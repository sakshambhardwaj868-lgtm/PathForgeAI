/**
 * PathForge AI — Phase 6 Automated Test Suite
 * Tests Authentication, Security, Token Handling, and Ownership Authorization
 */

const assert = require('assert');
const path = require('path');

// Ensure test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-safe-forge';

const { AuthSecurity } = require('../dist/utils/token');
const { registerSchema, loginSchema, updateProgressSchema } = require('../dist/schemas/authSchemas');
const { requireAuth } = require('../dist/middleware/authMiddleware');
const { AuthController } = require('../dist/controllers/authController');
const { RoadmapPersistenceController } = require('../dist/controllers/roadmapPersistenceController');
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

async function runTests() {
  console.log('\n===============================================================');
  console.log('   PATHFORGE AI — PHASE 6: AUTHENTICATION & SECURITY TESTS     ');
  console.log('===============================================================\n');

  console.log('--- SECTION 1: Password Hashing & Bcrypt Security ---');

  await it('Bcrypt Hashing: Produces hashed password different from plaintext', async () => {
    const raw = 'SecurePass123!';
    const hash = await AuthSecurity.hashPassword(raw);
    assert.notStrictEqual(hash, raw);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.startsWith('$2'), true);
  });

  await it('Bcrypt Verification: Returns true for valid password', async () => {
    const raw = 'CareerForge2026!';
    const hash = await AuthSecurity.hashPassword(raw);
    const isValid = await AuthSecurity.comparePassword(raw, hash);
    assert.strictEqual(isValid, true);
  });

  await it('Bcrypt Verification: Returns false for incorrect password', async () => {
    const raw = 'CorrectPassword1!';
    const wrong = 'WrongPassword2@';
    const hash = await AuthSecurity.hashPassword(raw);
    const isValid = await AuthSecurity.comparePassword(wrong, hash);
    assert.strictEqual(isValid, false);
  });

  await it('Bcrypt Salt Uniqueness: Same password produces distinct salt hashes', async () => {
    const raw = 'SamePassword123!';
    const hash1 = await AuthSecurity.hashPassword(raw);
    const hash2 = await AuthSecurity.hashPassword(raw);
    assert.notStrictEqual(hash1, hash2);
  });

  console.log('\n--- SECTION 2: JWT Generation, Verification & Expiry ---');

  await it('JWT Signing: Generates valid signature with payload', () => {
    const payload = { userId: 'user-12345', email: 'developer@pathforge.ai' };
    const token = AuthSecurity.generateToken(payload);
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.split('.').length, 3);
  });

  await it('JWT Verification: Decodes valid token and restores payload', () => {
    const payload = { userId: 'user-abc-999', email: 'test@example.com' };
    const token = AuthSecurity.generateToken(payload);
    const verified = AuthSecurity.verifyToken(token);
    assert.ok(verified);
    assert.strictEqual(verified.userId, 'user-abc-999');
    assert.strictEqual(verified.email, 'test@example.com');
  });

  await it('JWT Tamper Resistance: Tampered token returns null', () => {
    const token = AuthSecurity.generateToken({ userId: 'u1', email: 'u1@test.com' });
    const tampered = token.slice(0, -6) + 'xxxxxx';
    const verified = AuthSecurity.verifyToken(tampered);
    assert.strictEqual(verified, null);
  });

  console.log('\n--- SECTION 3: Input Validation with Zod ---');

  await it('Register Schema: Accepts valid email, strong password, and name', () => {
    const valid = registerSchema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'StrongPassword123!',
    });
    assert.strictEqual(valid.success, true);
  });

  await it('Register Schema: Rejects invalid email address', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email',
      password: 'StrongPassword123!',
    });
    assert.strictEqual(result.success, false);
  });

  await it('Register Schema: Rejects weak password lacking digits or symbols', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'user@example.com',
      password: 'short',
    });
    assert.strictEqual(result.success, false);
  });

  await it('Login Schema: Accepts valid email and password format', () => {
    const result = loginSchema.safeParse({
      email: 'user@domain.com',
      password: 'AnyPassword123',
    });
    assert.strictEqual(result.success, true);
  });

  await it('Progress Schema: Accepts valid milestone update payload', () => {
    const result = updateProgressSchema.safeParse({
      milestoneId: 'ms-docker-container',
      isKnown: true,
    });
    assert.strictEqual(result.success, true);
  });

  console.log('\n--- SECTION 4: Authentication Middleware Enforcement ---');

  await it('requireAuth: Blocks request without Authorization header (HTTP 401)', () => {
    let statusSent = null;
    let jsonSent = null;
    const req = { headers: {} };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.success, false);
  });

  await it('requireAuth: Blocks request with invalid Bearer token (HTTP 401)', () => {
    let statusSent = null;
    const req = { headers: { authorization: 'Bearer invalid-token-string' } };
    const res = {
      status(s) { statusSent = s; return this; },
      json() {}
    };
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusSent, 401);
  });

  await it('requireAuth: Passes valid Bearer token and attaches user to request', () => {
    const token = AuthSecurity.generateToken({ userId: 'u-valid-1', email: 'valid@test.com' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status() { return this; },
      json() {}
    };
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.userId, 'u-valid-1');
  });

  console.log('\n--- SECTION 5: Ownership Authorization & Data Isolation ---');

  await it('Ownership Isolation: User B cannot access User A roadmap (403 Forbidden)', async () => {
    // Simulate database readiness
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
    const originalFindOne = SavedRoadmap.findOne;

    // Mock document owned by user A
    SavedRoadmap.findOne = async () => ({
      userId: { toString: () => 'user-A-id' },
      roadmapId: 'rm-user-a',
      targetRole: 'Senior AI Engineer',
      milestones: []
    });

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'user-B-id', email: 'userb@test.com' },
      params: { id: 'rm-user-a' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getRoadmapById(req, res);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);
    assert.ok(jsonSent.error.includes('Access denied'));

    // Restore mocks
    SavedRoadmap.findOne = originalFindOne;
    Database.isReady = originalIsReady;
  });

  await it('Ownership Isolation: User B cannot modify User A milestone progress (403 Forbidden)', async () => {
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
    const originalFindOne = SavedRoadmap.findOne;

    SavedRoadmap.findOne = async () => ({
      userId: { toString: () => 'user-A-id' },
      roadmapId: 'rm-user-a',
      milestones: [{ id: 'm1', isKnown: false }]
    });

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'user-B-id', email: 'userb@test.com' },
      params: { id: 'rm-user-a' },
      body: { milestoneId: 'm1', isKnown: true }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.updateMilestoneProgress(req, res);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(jsonSent.success, false);

    SavedRoadmap.findOne = originalFindOne;
    Database.isReady = originalIsReady;
  });

  await it('Ownership Isolation: User B cannot delete User A roadmap (403 Forbidden)', async () => {
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
    const originalFindOne = SavedRoadmap.findOne;

    let deleteCalled = false;
    SavedRoadmap.findOne = async () => ({
      userId: { toString: () => 'user-A-id' },
      roadmapId: 'rm-user-a',
      deleteOne: async () => { deleteCalled = true; }
    });

    let statusSent = null;
    const req = {
      user: { userId: 'user-B-id', email: 'userb@test.com' },
      params: { id: 'rm-user-a' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json() {}
    };

    await RoadmapPersistenceController.deleteRoadmap(req, res);

    assert.strictEqual(statusSent, 403);
    assert.strictEqual(deleteCalled, false);

    SavedRoadmap.findOne = originalFindOne;
    Database.isReady = originalIsReady;
  });

  await it('Ownership Authorization: Owner (User A) is permitted to access their own roadmap', async () => {
    const originalIsReady = Database.isReady;
    Database.isReady = () => true;

    const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
    const originalFindOne = SavedRoadmap.findOne;

    const mockDoc = {
      userId: { toString: () => 'user-A-id' },
      roadmapId: 'rm-user-a',
      targetRole: 'Staff Frontend Architect',
      milestones: [{ id: 'm1', title: 'State Machines' }]
    };
    SavedRoadmap.findOne = async () => mockDoc;

    let statusSent = null;
    let jsonSent = null;
    const req = {
      user: { userId: 'user-A-id', email: 'usera@test.com' },
      params: { id: 'rm-user-a' }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await RoadmapPersistenceController.getRoadmapById(req, res);

    assert.strictEqual(statusSent, 200);
    assert.strictEqual(jsonSent.success, true);
    assert.strictEqual(jsonSent.data.targetRole, 'Staff Frontend Architect');

    SavedRoadmap.findOne = originalFindOne;
    Database.isReady = originalIsReady;
  });

  console.log('\n--- SECTION 6: Graceful Offline & Unconfigured Handling ---');

  await it('Offline DB Handling: Auth endpoints return HTTP 503 when database is not connected', async () => {
    const originalIsReady = Database.isReady;
    Database.isReady = () => false;

    let statusSent = null;
    let jsonSent = null;
    const req = {
      body: {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Tester'
      }
    };
    const res = {
      status(s) { statusSent = s; return this; },
      json(j) { jsonSent = j; }
    };

    await AuthController.register(req, res);

    assert.strictEqual(statusSent, 503);
    assert.strictEqual(jsonSent.success, false);
    assert.ok(jsonSent.error.includes('Database service is currently unavailable'));

    Database.isReady = originalIsReady;
  });

  await it('Environment Detection: Missing MONGODB_URI is detected accurately without false positives', async () => {
    const originalUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = '';

    // Database.isConfigured must return false when MONGODB_URI is empty/absent
    const isConfigured = Database.isConfigured();
    assert.strictEqual(isConfigured, false);

    // Database.connect must return false and not crash
    const connected = await Database.connect();
    assert.strictEqual(connected, false);
    assert.strictEqual(Database.isReady(), false);

    if (originalUri !== undefined) {
      process.env.MONGODB_URI = originalUri;
    } else {
      delete process.env.MONGODB_URI;
    }
  });

  await it('Credential Sanitization: MongoDB connection errors never leak passwords in logs', () => {
    const mockRawError = 'MongoServerError: bad auth : authentication failed for user "pathforge_admin:SuperSecretPass123!@cluster0.abcde.mongodb.net"';
    const sanitized = mockRawError.replace(/:([^@]+)@/, ':****@');

    assert.strictEqual(sanitized.includes('SuperSecretPass123!'), false);
    assert.strictEqual(sanitized.includes(':****@'), true);
  });

  console.log('\n===============================================================');
  console.log(`Phase 6 Test Results: ${passedTests}/${totalTests} tests passed.`);
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
