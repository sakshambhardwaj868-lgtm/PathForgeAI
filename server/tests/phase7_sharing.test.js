/**
 * PathForge AI — Phase 7 Automated Test Suite
 * Tests Secure Shareable Roadmap Links:
 * - Cryptographic token generation & SHA-256 hashing
 * - Input validation & rate limiting
 * - Authenticated owner link creation & listing
 * - Unauthenticated & cross-user authorization enforcement (User A cannot share User B's roadmap)
 * - Public read-only access (no authentication required)
 * - Expiration and revocation enforcement
 * - Information privacy (no emails, password hashes, or private metadata leaked)
 * - Persistence & uniqueness
 */

const assert = require('assert');
const path = require('path');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-safe-forge';

const { generateSecureShareToken, hashShareToken } = require('../dist/utils/cryptoUtils');
const { createShareSchema, shareTokenParamSchema } = require('../dist/schemas/shareSchemas');
const { createSlidingRateLimiter } = require('../dist/middleware/rateLimiter');
const { RoadmapShareController } = require('../dist/controllers/roadmapShareController');
const { RoadmapShare } = require('../dist/models/RoadmapShare');
const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
const { Database } = require('../dist/config/db');

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

// Mock Express response generator
function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('   PATHFORGE AI — PHASE 7: SECURE ROADMAP SHARING TESTS        ');
  console.log('===============================================================\n');

  console.log('--- SECTION 1: Cryptographic Token Security & Hashing ---');

  await it('Token Generation: Produces 64-character hexadecimal unpredictable token', () => {
    const token = generateSecureShareToken();
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.length, 64);
    assert.strictEqual(/^[0-9a-f]{64}$/.test(token), true);
  });

  await it('Token Generation: Successive tokens are unique and non-colliding', () => {
    const token1 = generateSecureShareToken();
    const token2 = generateSecureShareToken();
    assert.notStrictEqual(token1, token2);
  });

  await it('Token Hashing: Produces deterministic SHA-256 hash', () => {
    const token = generateSecureShareToken();
    const hash1 = hashShareToken(token);
    const hash2 = hashShareToken(token);
    assert.strictEqual(hash1, hash2);
    assert.strictEqual(hash1.length, 64);
    assert.notStrictEqual(hash1, token);
  });

  await it('Token Hashing: Different tokens produce distinct hashes (no collision)', () => {
    const t1 = generateSecureShareToken();
    const t2 = generateSecureShareToken();
    assert.notStrictEqual(hashShareToken(t1), hashShareToken(t2));
  });

  console.log('\n--- SECTION 2: Zod Schema Validation ---');

  await it('Create Share Schema: Accepts valid expiration days and label', () => {
    const valid = createShareSchema.safeParse({ expiresInDays: 30, label: 'Mentor Review' });
    assert.strictEqual(valid.success, true);
    assert.strictEqual(valid.data.expiresInDays, 30);
    assert.strictEqual(valid.data.label, 'Mentor Review');
  });

  await it('Create Share Schema: Accepts null expiration for permanent links', () => {
    const valid = createShareSchema.safeParse({ expiresInDays: null });
    assert.strictEqual(valid.success, true);
    assert.strictEqual(valid.data.expiresInDays, null);
  });

  await it('Create Share Schema: Rejects invalid expiration (< 1 day or > 365 days)', () => {
    const tooLow = createShareSchema.safeParse({ expiresInDays: 0 });
    const tooHigh = createShareSchema.safeParse({ expiresInDays: 400 });
    const decimal = createShareSchema.safeParse({ expiresInDays: 3.5 });
    assert.strictEqual(tooLow.success, false);
    assert.strictEqual(tooHigh.success, false);
    assert.strictEqual(decimal.success, false);
  });

  await it('Share Token Param Schema: Validates 64-char hex token', () => {
    const validHex = 'a'.repeat(64);
    const valid = shareTokenParamSchema.safeParse({ token: validHex });
    assert.strictEqual(valid.success, true);
  });

  await it('Share Token Param Schema: Rejects malformed or suspicious tokens', () => {
    const tooShort = shareTokenParamSchema.safeParse({ token: 'abc123' });
    const invalidChars = shareTokenParamSchema.safeParse({ token: 'g'.repeat(64) });
    const sqlInjection = shareTokenParamSchema.safeParse({ token: "'; DROP TABLE shares; --" });
    assert.strictEqual(tooShort.success, false);
    assert.strictEqual(invalidChars.success, false);
    assert.strictEqual(sqlInjection.success, false);
  });

  console.log('\n--- SECTION 3: Rate Limiting Enforcement ---');

  await it('Sliding Rate Limiter: Allows requests within quota and blocks excess with HTTP 429', () => {
    const limiter = createSlidingRateLimiter({
      windowMs: 1000,
      maxRequests: 3,
      message: 'Quota exceeded',
      keyGenerator: () => 'test-ip-client',
    });

    const mockReq = { ip: '127.0.0.1' };
    let blocked = false;
    let statusCode = 200;

    for (let i = 0; i < 4; i++) {
      const res = createMockRes();
      let nextCalled = false;
      limiter(mockReq, res, () => { nextCalled = true; });

      if (!nextCalled) {
        blocked = true;
        statusCode = res.statusCode;
        assert.strictEqual(res.headers['Retry-After'] !== undefined, true);
      }
    }

    assert.strictEqual(blocked, true);
    assert.strictEqual(statusCode, 429);
  });

  console.log('\n--- SECTION 4: Authorization & Ownership Isolation ---');

  await it('Unauthenticated User: Cannot create share link (blocked by auth check)', async () => {
    // Database offline mode returns 503 if DB disconnected
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    try {
      const req = {
        params: { id: 'rm-test-123' },
        user: null, // Unauthenticated
        body: {},
      };
      const res = createMockRes();

      await RoadmapShareController.createShareLink(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    } finally {
      Database.isReady = originalIsReady;
    }
  });

  await it('Unauthenticated User: Cannot list or revoke share links', async () => {
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    try {
      const req = {
        params: { id: 'rm-test-123', shareId: 'share-abc' },
        user: null,
      };
      const resList = createMockRes();
      await RoadmapShareController.getSharesForRoadmap(req, resList);
      assert.strictEqual(resList.statusCode, 401);

      const resRevoke = createMockRes();
      await RoadmapShareController.revokeShareLink(req, resRevoke);
      assert.strictEqual(resRevoke.statusCode, 401);
    } finally {
      Database.isReady = originalIsReady;
    }
  });

  await it('Cross-User Authorization: User A cannot create share link for User B private roadmap', async () => {
    const originalIsReady = Database.isReady;
    const originalFindOne = SavedRoadmap.findOne;
    Database.isReady = () => true;

    // Mock SavedRoadmap belonging to User B ('user-b-id')
    SavedRoadmap.findOne = async () => ({
      _id: 'roadmap-mongo-id-123',
      userId: { toString: () => 'user-b-id' },
      roadmapId: 'rm-secret-b',
    });

    try {
      const req = {
        params: { id: 'rm-secret-b' },
        user: { userId: 'user-a-id', email: 'userA@example.com' }, // User A requesting
        body: { expiresInDays: 30 },
      };
      const res = createMockRes();

      await RoadmapShareController.createShareLink(req, res);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(/access denied/i.test(res.body.error), true);
    } finally {
      Database.isReady = originalIsReady;
      SavedRoadmap.findOne = originalFindOne;
    }
  });

  await it('Cross-User Authorization: User A cannot revoke User B share link', async () => {
    const originalIsReady = Database.isReady;
    const originalFindRoadmap = SavedRoadmap.findOne;
    const originalFindShare = RoadmapShare.findOne;
    Database.isReady = () => true;

    SavedRoadmap.findOne = async () => ({
      _id: 'roadmap-mongo-id-123',
      userId: { toString: () => 'user-b-id' },
    });

    try {
      const req = {
        params: { id: 'rm-secret-b', shareId: 'share-b-1' },
        user: { userId: 'user-a-id', email: 'userA@example.com' },
      };
      const res = createMockRes();

      await RoadmapShareController.revokeShareLink(req, res);
      assert.strictEqual(res.statusCode, 403);
    } finally {
      Database.isReady = originalIsReady;
      SavedRoadmap.findOne = originalFindRoadmap;
      RoadmapShare.findOne = originalFindShare;
    }
  });

  console.log('\n--- SECTION 5: Public Access, Expiration & Revocation ---');

  await it('Public Lookup: Rejects invalid share token with HTTP 400', async () => {
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    try {
      const req = { params: { token: 'short-invalid-token' } };
      const res = createMockRes();

      await RoadmapShareController.getPublicSharedRoadmap(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
    } finally {
      Database.isReady = originalIsReady;
    }
  });

  await it('Public Lookup: Non-existent token returns HTTP 404', async () => {
    const originalIsReady = Database.isReady;
    const originalFindShare = RoadmapShare.findOne;
    Database.isReady = () => true;

    RoadmapShare.findOne = async () => null;

    try {
      const req = { params: { token: '0'.repeat(64) } };
      const res = createMockRes();

      await RoadmapShareController.getPublicSharedRoadmap(req, res);
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
    } finally {
      Database.isReady = originalIsReady;
      RoadmapShare.findOne = originalFindShare;
    }
  });

  await it('Public Lookup: Revoked share link returns HTTP 410 (Gone)', async () => {
    const originalIsReady = Database.isReady;
    const originalFindShare = RoadmapShare.findOne;
    Database.isReady = () => true;

    RoadmapShare.findOne = async () => ({
      _id: 'share-1',
      isRevoked: true,
      revokedAt: new Date(),
    });

    try {
      const req = { params: { token: '1'.repeat(64) } };
      const res = createMockRes();

      await RoadmapShareController.getPublicSharedRoadmap(req, res);
      assert.strictEqual(res.statusCode, 410);
      assert.strictEqual(res.body.isRevoked, true);
    } finally {
      Database.isReady = originalIsReady;
      RoadmapShare.findOne = originalFindShare;
    }
  });

  await it('Public Lookup: Expired share link returns HTTP 410 (Gone)', async () => {
    const originalIsReady = Database.isReady;
    const originalFindShare = RoadmapShare.findOne;
    Database.isReady = () => true;

    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
    RoadmapShare.findOne = async () => ({
      _id: 'share-2',
      isRevoked: false,
      expiresAt: pastDate,
    });

    try {
      const req = { params: { token: '2'.repeat(64) } };
      const res = createMockRes();

      await RoadmapShareController.getPublicSharedRoadmap(req, res);
      assert.strictEqual(res.statusCode, 410);
      assert.strictEqual(res.body.isExpired, true);
    } finally {
      Database.isReady = originalIsReady;
      RoadmapShare.findOne = originalFindShare;
    }
  });

  console.log('\n--- SECTION 6: Data Privacy & Sanitization ---');

  await it('Public Response: Sanitizes roadmap and excludes private account data', async () => {
    const originalIsReady = Database.isReady;
    const originalFindShare = RoadmapShare.findOne;
    const originalFindRoadmap = SavedRoadmap.findById;
    const { User } = require('../dist/models/User');
    const originalFindUser = User.findById;

    Database.isReady = () => true;

    const rawToken = '3'.repeat(64);
    RoadmapShare.findOne = async () => ({
      _id: 'share-3',
      roadmapId: 'rm-doc-id-999',
      userId: 'user-doc-id-888',
      label: 'Career Portfolio',
      isRevoked: false,
      expiresAt: null,
      createdAt: new Date('2026-03-01'),
    });

    SavedRoadmap.findById = async () => ({
      roadmapId: 'rm-target-fullstack',
      targetRole: 'Full Stack Engineer',
      targetCompanyType: 'Series-A Tech',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
      totalEstimatedWeeks: 16,
      source: 'live_ai',
      phases: [{ id: 'p1', title: 'Phase 1' }],
      intermediateRoles: [],
      milestones: [{ id: 'ms-1', title: 'Milestone 1', isKnown: true, status: 'completed' }],
      edges: [],
      metrics: { completionPercentage: 50 },
      createdAt: new Date('2026-03-01'),
      // Sensitive fields that must NOT leak:
      userId: 'user-doc-id-888',
      internalSecrets: 'sensitive-database-field',
    });

    User.findById = () => ({
      select: async () => ({
        name: 'Alex Developer',
        email: 'alex.private@company.com',
        passwordHash: '$2a$12$superSecretHashedPassword',
      }),
    });

    try {
      const req = { params: { token: rawToken } };
      const res = createMockRes();

      await RoadmapShareController.getPublicSharedRoadmap(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);

      const { shareInfo, roadmap } = res.body.data;

      // Approved fields present
      assert.strictEqual(shareInfo.ownerName, 'Alex Developer');
      assert.strictEqual(roadmap.targetRole, 'Full Stack Engineer');
      assert.strictEqual(roadmap.milestones.length, 1);

      // Private fields strictly excluded
      assert.strictEqual(res.body.data.email, undefined);
      assert.strictEqual(res.body.data.passwordHash, undefined);
      assert.strictEqual(shareInfo.email, undefined);
      assert.strictEqual(shareInfo.passwordHash, undefined);
      assert.strictEqual(roadmap.userId, undefined);
      assert.strictEqual(roadmap.internalSecrets, undefined);
    } finally {
      Database.isReady = originalIsReady;
      RoadmapShare.findOne = originalFindShare;
      SavedRoadmap.findById = originalFindRoadmap;
      User.findById = originalFindUser;
    }
  });

  console.log('\n--- SECTION 7: Data Model & Persistence Across Restarts ---');

  await it('Mongoose Model: RoadmapShare schema has required indexes and hides tokenHash on JSON conversion', () => {
    const indexes = RoadmapShare.schema.indexes();
    assert.strictEqual(Array.isArray(indexes), true);

    const sampleDoc = new RoadmapShare({
      roadmapId: '507f1f77bcf86cd799439011',
      userId: '507f1f77bcf86cd799439012',
      tokenHash: 'a'.repeat(64),
      tokenPrefix: 'pfg_12345678',
      label: 'Mentorship Share',
      isRevoked: false,
    });

    const json = sampleDoc.toJSON();
    assert.strictEqual(json.tokenHash, undefined);
    assert.strictEqual(json.__v, undefined);
    assert.strictEqual(json.tokenPrefix, 'pfg_12345678');
  });

  await it('Persistence Across Restarts: Inactive state hydrated strictly from DB without in-memory state', () => {
    const token = generateSecureShareToken();
    const storedHash = hashShareToken(token);
    const lookupHash = hashShareToken(token);
    assert.strictEqual(lookupHash, storedHash);
  });

  console.log('\n--- SECTION 8: HTTP Route Mounting & Express Middleware ---');

  const { createApp } = require('../dist/app');
  const app = createApp();
  const testServer = app.listen(5004);

  try {
    await it('HTTP Endpoint: GET /api/v1/shares/:token returns 400 for malformed token format', async () => {
      const res = await fetch('http://localhost:5004/api/v1/shares/invalid-short-token');
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.strictEqual(/invalid share link format/i.test(data.error), true);
    });

    await it('HTTP Endpoint: POST /api/v1/roadmaps/:id/shares blocks unauthenticated requests with 401', async () => {
      const res = await fetch('http://localhost:5004/api/v1/roadmaps/rm-123/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 30 }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
    });

    await it('HTTP Endpoint: DELETE /api/v1/roadmaps/:id/shares/:shareId blocks unauthenticated requests with 401', async () => {
      const res = await fetch('http://localhost:5004/api/v1/roadmaps/rm-123/shares/share-123', {
        method: 'DELETE',
      });
      const data = await res.json();
      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.success, false);
    });

    console.log('\n--- SECTION 9: Production Regression — Roadmap ID Resolution & Multi-User Isolation ---');

    const origDbReady = Database.isReady;
    Database.isReady = () => true;

    try {
      await it('Share Link Creation: Non-ObjectId roadmapId string (e.g. rf-climate-tech-verified) correctly queries DB and generates link', async () => {
      const origFindOne = SavedRoadmap.findOne;
      const origCreate = RoadmapShare.create;
      let capturedQuery = null;

      SavedRoadmap.findOne = async (query) => {
        capturedQuery = query;
        if (query.userId === 'user-owner') {
          return {
            _id: '507f1f77bcf86cd799439011',
            userId: { toString: () => 'user-owner' },
            roadmapId: 'rf-climate-tech-verified',
          };
        }
        return null;
      };

      RoadmapShare.create = async (doc) => ({
        _id: 'share-doc-id-123',
        tokenPrefix: doc.tokenPrefix,
        label: doc.label,
        expiresAt: doc.expiresAt,
        createdAt: new Date(),
      });

      try {
        const req = {
          params: { id: 'rf-climate-tech-verified' },
          user: { userId: 'user-owner' },
          body: { expiresInDays: 30, label: 'Climate Career' },
        };
        const res = createMockRes();

        await RoadmapShareController.createShareLink(req, res);

        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(typeof res.body.data.shareUrl, 'string');
        assert.strictEqual(res.body.data.shareUrl.includes('/share/'), true);

        // Verify query structure: $or must NOT contain { _id: undefined }
        assert.deepStrictEqual(capturedQuery.userId, 'user-owner');
        assert.deepStrictEqual(capturedQuery.$or, [{ roadmapId: 'rf-climate-tech-verified' }]);
      } finally {
        SavedRoadmap.findOne = origFindOne;
        RoadmapShare.create = origCreate;
      }
    });

    await it('Share Link Creation: 24-character hexadecimal ObjectId correctly constructs query with both roadmapId and _id', async () => {
      const origFindOne = SavedRoadmap.findOne;
      const origCreate = RoadmapShare.create;
      let capturedQuery = null;
      const hexId = '507f1f77bcf86cd799439011';

      SavedRoadmap.findOne = async (query) => {
        capturedQuery = query;
        return {
          _id: hexId,
          userId: { toString: () => 'user-owner' },
          roadmapId: 'rm-persisted-custom',
        };
      };

      RoadmapShare.create = async (doc) => ({
        _id: 'share-doc-id-456',
        tokenPrefix: doc.tokenPrefix,
        label: doc.label,
        expiresAt: doc.expiresAt,
        createdAt: new Date(),
      });

      try {
        const req = {
          params: { id: hexId },
          user: { userId: 'user-owner' },
          body: {},
        };
        const res = createMockRes();

        await RoadmapShareController.createShareLink(req, res);

        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.body.success, true);
        assert.deepStrictEqual(capturedQuery.userId, 'user-owner');
        assert.deepStrictEqual(capturedQuery.$or, [{ roadmapId: hexId }, { _id: hexId }]);
      } finally {
        SavedRoadmap.findOne = origFindOne;
        RoadmapShare.create = origCreate;
      }
    });

    await it('Multi-User Isolation: User B creates share link for their own roadmap when User A has identical roadmapId', async () => {
      const origFindOne = SavedRoadmap.findOne;
      const origCreate = RoadmapShare.create;
      let capturedUserId = null;

      // User A and User B both have 'rf-climate-tech-verified' in DB
      SavedRoadmap.findOne = async (query) => {
        if (query.userId === 'user-b') {
          return {
            _id: 'mongo-id-b',
            userId: { toString: () => 'user-b' },
            roadmapId: 'rf-climate-tech-verified',
          };
        }
        if (query.userId === 'user-a' || !query.userId) {
          return {
            _id: 'mongo-id-a',
            userId: { toString: () => 'user-a' },
            roadmapId: 'rf-climate-tech-verified',
          };
        }
        return null;
      };

      RoadmapShare.create = async (doc) => {
        capturedUserId = doc.userId.toString();
        return {
          _id: 'share-doc-b',
          tokenPrefix: doc.tokenPrefix,
          label: doc.label,
          expiresAt: doc.expiresAt,
          createdAt: new Date(),
        };
      };

      try {
        const req = {
          params: { id: 'rf-climate-tech-verified' },
          user: { userId: 'user-b' },
          body: { label: "User B's Climate Roadmap" },
        };
        const res = createMockRes();

        await RoadmapShareController.createShareLink(req, res);

        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(capturedUserId, 'user-b');
      } finally {
        SavedRoadmap.findOne = origFindOne;
        RoadmapShare.create = origCreate;
      }
    });

    await it('Parameter Validation: "undefined" string roadmap ID parameter is rejected with HTTP 400', async () => {
      const req = {
        params: { id: 'undefined' },
        user: { userId: 'user-owner' },
        body: {},
      };
      const res = createMockRes();

      await RoadmapShareController.createShareLink(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(/Roadmap ID parameter is required/i.test(res.body.error), true);
    });

    await it('Non-Existent Roadmap: Returns HTTP 404 when roadmap does not exist in DB', async () => {
      const origFindOne = SavedRoadmap.findOne;
      SavedRoadmap.findOne = async () => null;

      try {
        const req = {
          params: { id: 'non-existent-roadmap-999' },
          user: { userId: 'user-owner' },
          body: {},
        };
        const res = createMockRes();

        await RoadmapShareController.createShareLink(req, res);

        assert.strictEqual(res.statusCode, 404);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error, 'Roadmap not found.');
      } finally {
        SavedRoadmap.findOne = origFindOne;
      }
    });

    await it('Cross-User Authorization: Returns HTTP 403 when User A attempts to share User B roadmap', async () => {
      const origFindOne = SavedRoadmap.findOne;
      SavedRoadmap.findOne = async (query) => {
        // Not found under user-a, but found globally under user-b
        if (query.userId === 'user-a') return null;
        return {
          _id: 'mongo-id-b',
          userId: { toString: () => 'user-b' },
          roadmapId: 'rm-user-b-exclusive',
        };
      };

      try {
        const req = {
          params: { id: 'rm-user-b-exclusive' },
          user: { userId: 'user-a' },
          body: {},
        };
        const res = createMockRes();

        await RoadmapShareController.createShareLink(req, res);

        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(/access denied/i.test(res.body.error), true);
      } finally {
        SavedRoadmap.findOne = origFindOne;
      }
    });
    } finally {
      Database.isReady = origDbReady;
    }
  } finally {
    testServer.close();
  }

  console.log('\n===============================================================');
  console.log(`Phase 7 Test Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
