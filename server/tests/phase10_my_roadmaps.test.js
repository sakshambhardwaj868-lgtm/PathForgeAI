/**
 * PathForge AI — Phase 10 Automated Test Suite
 * Tests My Roadmaps Dashboard Backend Endpoints, Ownership Enforcement,
 * Secure Data Retrieval, Deletion with Cascade Cleanup, and Error Handling.
 */

const assert = require('assert');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-safe-forge';

const { RoadmapPersistenceController } = require('../dist/controllers/roadmapPersistenceController');
const { requireAuth } = require('../dist/middleware/authMiddleware');
const { AuthSecurity } = require('../dist/utils/token');
const { Database } = require('../dist/config/db');
const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
const { RoadmapShare } = require('../dist/models/RoadmapShare');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(() => {
        passedTests++;
        console.log(`  [PASS] ${name}`);
      }).catch((err) => {
        console.error(`  [FAIL] ${name}:`, err.message);
        throw err;
      });
    }
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('   PATHFORGE AI — PHASE 10: MY ROADMAPS DASHBOARD API TESTS    ');
  console.log('===============================================================\n');

  console.log('--- SECTION 1: Authentication Middleware Enforcement ---');

  await it('requireAuth: Blocks unauthenticated GET /api/v1/roadmaps/my (HTTP 401)', () => {
    let statusSent = null;
    let jsonSent = null;
    const req = { headers: {} };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, res, next);

    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(nextCalled, false);
  });

  await it('requireAuth: Blocks unauthenticated DELETE /api/v1/roadmaps/:id (HTTP 401)', () => {
    let statusSent = null;
    let jsonSent = null;
    const req = { headers: {}, params: { id: 'rm-101' } };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, res, next);

    assert.strictEqual(statusSent, 401);
    assert.strictEqual(nextCalled, false);
  });

  await it('requireAuth: Allows request with valid Bearer token and attaches user identity', () => {
    const token = AuthSecurity.generateToken({ userId: 'user-123', email: 'test@pathforge.ai' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.userId, 'user-123');
    assert.strictEqual(req.user.email, 'test@pathforge.ai');
  });

  console.log('\n--- SECTION 2: Listing Roadmaps & User Data Isolation ---');

  await it('getMyRoadmaps: Returns HTTP 503 when Database is offline', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => false;

    let statusSent = null;
    let jsonSent = null;
    const req = { user: { userId: 'user-123' } };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getMyRoadmaps(req, res);

    assert.strictEqual(statusSent, 503);
    assert.strictEqual(jsonSent.success, false);

    Database.isReady = origReady;
  });

  await it('getMyRoadmaps: Fetches roadmaps filtered strictly by authenticated userId', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    const origFind = SavedRoadmap.find;
    let queryPassed = null;
    let sortPassed = null;

    SavedRoadmap.find = (q) => {
      queryPassed = q;
      return {
        sort: (s) => {
          sortPassed = s;
          return Promise.resolve([
            {
              roadmapId: 'rm-user-1',
              targetRole: 'Data Scientist',
              userId: 'user-123',
              milestones: [{ id: 'm1', isKnown: true }]
            }
          ]);
        }
      };
    };

    let statusSent = null;
    let jsonSent = null;
    const req = { user: { userId: 'user-123' } };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getMyRoadmaps(req, res);

    assert.strictEqual(statusSent, 200);
    assert.strictEqual(jsonSent.success, true);
    assert.strictEqual(jsonSent.count, 1);
    assert.strictEqual(jsonSent.data[0].roadmapId, 'rm-user-1');
    assert.deepStrictEqual(queryPassed, { userId: 'user-123' });
    assert.deepStrictEqual(sortPassed, { updatedAt: -1 });

    SavedRoadmap.find = origFind;
    Database.isReady = origReady;
  });

  await it('getMyRoadmaps: Client body spoofing userId is completely ignored (identity from JWT)', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    const origFind = SavedRoadmap.find;
    let queryPassed = null;

    SavedRoadmap.find = (q) => {
      queryPassed = q;
      return {
        sort: () => Promise.resolve([])
      };
    };

    const req = {
      user: { userId: 'user-attacker-id' },
      body: { userId: 'user-victim-id' },
      query: { userId: 'user-victim-id' }
    };
    const res = {
      status() { return this; },
      json() {}
    };

    await RoadmapPersistenceController.getMyRoadmaps(req, res);

    assert.strictEqual(queryPassed.userId, 'user-attacker-id');

    SavedRoadmap.find = origFind;
    Database.isReady = origReady;
  });

  console.log('\n--- SECTION 3: Open / Retrieve Saved Roadmap ---');

  await it('getRoadmapById: Owner receives HTTP 200 with complete roadmap data', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    const origFindOne = SavedRoadmap.findOne;
    SavedRoadmap.findOne = async () => ({
      roadmapId: 'rm-201',
      targetRole: 'Quantum Software Engineer',
      userId: { toString: () => 'owner-id' },
      milestones: [{ id: 'ms-q1', title: 'Qubits & Gates' }],
      phases: [{ id: 'p1', title: 'Quantum Basics' }],
      edges: []
    });

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'owner-id' },
      params: { id: 'rm-201' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getRoadmapById(req, res);

    assert.strictEqual(statusSent, 200);
    assert.strictEqual(jsonSent.success, true);
    assert.strictEqual(jsonSent.data.roadmapId, 'rm-201');
    assert.strictEqual(jsonSent.data.milestones.length, 1);

    SavedRoadmap.findOne = origFindOne;
    Database.isReady = origReady;
  });

  await it('getRoadmapById: Non-owner receives HTTP 403 Forbidden', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    const origFindOne = SavedRoadmap.findOne;
    SavedRoadmap.findOne = async () => ({
      roadmapId: 'rm-201',
      userId: { toString: () => 'owner-id' }
    });

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'stranger-id' },
      params: { id: 'rm-201' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getRoadmapById(req, res);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
    assert.ok(jsonSent.error.includes('Access denied'));

    SavedRoadmap.findOne = origFindOne;
    Database.isReady = origReady;
  });

  await it('getRoadmapById: Non-existent roadmap returns HTTP 404', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    const origFindOne = SavedRoadmap.findOne;
    SavedRoadmap.findOne = async () => null;

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'owner-id' },
      params: { id: 'rm-non-existent' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getRoadmapById(req, res);

    assert.strictEqual(statusSent, 404);
    assert.strictEqual(jsonSent.success, false);

    SavedRoadmap.findOne = origFindOne;
    Database.isReady = origReady;
  });

  console.log('\n--- SECTION 4: Deletion & Cascade Share Cleanup ---');

  await it('deleteRoadmap: Owner can delete roadmap and cascade-cleans associated shares', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    let deletedDoc = false;
    let deletedSharesQuery = null;

    const origFindOne = SavedRoadmap.findOne;
    SavedRoadmap.findOne = async () => ({
      _id: 'mongo-doc-id-123',
      roadmapId: 'rm-301',
      userId: { toString: () => 'owner-id' },
      deleteOne: async () => {
        deletedDoc = true;
      }
    });

    const origDeleteMany = RoadmapShare.deleteMany;
    RoadmapShare.deleteMany = async (q) => {
      deletedSharesQuery = q;
      return { deletedCount: 2 };
    };

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'owner-id' },
      params: { id: 'rm-301' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.deleteRoadmap(req, res);

    assert.strictEqual(statusSent, 200);
    assert.strictEqual(jsonSent.success, true);
    assert.strictEqual(deletedDoc, true);
    assert.deepStrictEqual(deletedSharesQuery, { roadmapId: 'mongo-doc-id-123' });

    SavedRoadmap.findOne = origFindOne;
    RoadmapShare.deleteMany = origDeleteMany;
    Database.isReady = origReady;
  });

  await it('deleteRoadmap: Non-owner cannot delete roadmap (HTTP 403 Forbidden)', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    let deleteCalled = false;
    const origFindOne = SavedRoadmap.findOne;
    SavedRoadmap.findOne = async () => ({
      roadmapId: 'rm-301',
      userId: { toString: () => 'owner-id' },
      deleteOne: async () => {
        deleteCalled = true;
      }
    });

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'intruder-id' },
      params: { id: 'rm-301' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.deleteRoadmap(req, res);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(deleteCalled, false);

    SavedRoadmap.findOne = origFindOne;
    Database.isReady = origReady;
  });

  await it('deleteRoadmap: Non-existent roadmap returns HTTP 404', async () => {
    const origReady = Database.isReady;
    Database.isReady = () => true;

    const origFindOne = SavedRoadmap.findOne;
    SavedRoadmap.findOne = async () => null;

    let statusSent = null;
    const req = {
      user: { userId: 'owner-id' },
      params: { id: 'rm-does-not-exist' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json() {}
    };

    await RoadmapPersistenceController.deleteRoadmap(req, res);

    assert.strictEqual(statusSent, 404);

    SavedRoadmap.findOne = origFindOne;
    Database.isReady = origReady;
  });

  console.log('\n===============================================================');
  console.log(`Phase 10 Test Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
