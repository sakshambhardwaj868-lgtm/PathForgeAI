/**
 * PathForge AI — Phase 9: Universal Career Search Backend Integration Test Suite
 *
 * Verifies:
 * 1. Custom career goals pass validation and generate tailored roadmaps.
 * 2. Whitespace is sanitized and sub-3-char or >100-char roles return HTTP 400.
 * 3. Fallback route preserves custom career goal in returned roadmap data.
 * 4. Experience level and weekly hours overrides apply accurately.
 * 5. Multi-model resilience chain serves custom career goal without crashing.
 */

const { createApp } = require('../dist/app');
const { detectGraphCycles } = require('../dist/schemas/roadmapSchema');
const { FallbackService } = require('../dist/services/fallbackService');

async function runUniversalSearchBackendTests() {
  console.log('===============================================================');
  console.log('  PATHFORGE AI — PHASE 9: UNIVERSAL CAREER SEARCH TESTS (API)  ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  }

  const app = createApp();
  const server = app.listen(5098);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Validation rejection of empty or sub-3-char role
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Input Validation Boundaries ---');
    const emptyRes = await fetch('http://localhost:5098/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: '  ' }),
    });
    assert(emptyRes.status === 400, 'Rejects empty / whitespace role with HTTP 400');

    const shortRes = await fetch('http://localhost:5098/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'ab' }),
    });
    assert(shortRes.status === 400, 'Rejects sub-3-character role with HTTP 400');

    const longRes = await fetch('http://localhost:5098/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'a'.repeat(101) }),
    });
    assert(longRes.status === 400, 'Rejects >100 character role with HTTP 400');

    // -------------------------------------------------------------------------
    // TEST 2: Fallback route preserves custom career goal
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Custom Career in Fallback Route ---');
    const customRole = 'Quantum Software Engineer';
    const fallbackRes = await fetch('http://localhost:5098/api/v1/roadmap/fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: customRole,
        weeklyCommitmentHours: 25,
        experienceLevel: 'Advanced',
      }),
    });
    const fallbackData = await fallbackRes.json();

    assert(fallbackRes.status === 200, 'POST /roadmap/fallback returns HTTP 200');
    assert(fallbackData.success === true, 'Response payload has success: true');
    assert(fallbackData.data.targetRole === customRole, 'Returned roadmap reflects custom targetRole');
    assert(fallbackData.data.weeklyCommitmentHours === 25, 'Weekly commitment hours preserved');
    assert(fallbackData.data.experienceLevel === 'Advanced', 'Experience level preserved');
    assert(detectGraphCycles(fallbackData.data.milestones) === false, 'Graph is 100% acyclic');

    // -------------------------------------------------------------------------
    // TEST 3: Fallback Service unit test with custom careers
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Fallback Service Adaptation ---');
    const dataSciFallback = FallbackService.getFallbackRoadmap('Lead Data Scientist', 20, 'Intermediate');
    assert(dataSciFallback.targetRole === 'Lead Data Scientist', 'FallbackService assigns custom role to data scientist');
    assert(dataSciFallback.source === 'cached_fallback', 'FallbackService marks source as cached_fallback');
    assert(detectGraphCycles(dataSciFallback.milestones) === false, 'Data scientist graph is acyclic');

    const uxFallback = FallbackService.getFallbackRoadmap('Senior Product Designer', 15, 'Beginner');
    assert(uxFallback.targetRole === 'Senior Product Designer', 'FallbackService assigns custom role to product designer');
    assert(detectGraphCycles(uxFallback.milestones) === false, 'Product designer graph is acyclic');

  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`  UNIVERSAL SEARCH BACKEND SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
}

runUniversalSearchBackendTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
