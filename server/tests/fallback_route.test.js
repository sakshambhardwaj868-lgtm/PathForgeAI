const { createApp } = require('../dist/app');
const { detectGraphCycles } = require('../dist/schemas/roadmapSchema');

async function runFallbackRouteTests() {
  console.log('===============================================================');
  console.log('   PATHFORGE AI — BACKEND FALLBACK & RESILIENCE TEST SUITE    ');
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
  const server = app.listen(5003);

  try {
    // 1. GET /api/v1/roadmap/fallback
    const getRes = await fetch('http://localhost:5003/api/v1/roadmap/fallback');
    const getData = await getRes.json();

    assert(getRes.status === 200, 'GET /api/v1/roadmap/fallback returns HTTP 200');
    assert(getData.success === true, 'GET fallback response has success: true');
    assert(getRes.headers.get('x-roadmap-source') === 'cached_fallback', 'Header X-Roadmap-Source is cached_fallback');
    assert(Array.isArray(getData.data.milestones) && getData.data.milestones.length >= 3, 'Milestones array contains valid milestones');
    assert(detectGraphCycles(getData.data.milestones) === false, 'Fallback graph is 100% acyclic');

    // 2. POST /api/v1/roadmap/fallback with specific role
    const postRes = await fetch('http://localhost:5003/api/v1/roadmap/fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: 'Senior AI Engineer & LLM Architect',
        weeklyCommitmentHours: 20,
        experienceLevel: 'Advanced',
      }),
    });
    const postData = await postRes.json();

    assert(postRes.status === 200, 'POST /api/v1/roadmap/fallback returns HTTP 200');
    assert(postData.success === true, 'POST fallback response has success: true');
    assert(postData.data.experienceLevel === 'Advanced', 'Experience level override applied');
    assert(postData.data.weeklyCommitmentHours === 20, 'Weekly commitment hours override applied');
    assert(detectGraphCycles(postData.data.milestones) === false, 'AI fallback graph is acyclic');

    // 3. Fallback route never returns empty body or throws uncaught exception
    const malformedPost = await fetch('http://localhost:5003/api/v1/roadmap/fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 12345 }), // unexpected type
    });
    const malformedData = await malformedPost.json();
    assert(malformedPost.status === 200 && malformedData.success === true, 'Fallback safely handles loose parameters without crashing');

    // 4. Verify 404 handler returns structured JSON instead of empty/HTML body
    const notFoundRes = await fetch('http://localhost:5003/api/v1/non-existent-route');
    const notFoundText = await notFoundRes.text();
    let notFoundJson = null;
    try {
      notFoundJson = JSON.parse(notFoundText);
    } catch {
      // not json
    }
    assert(notFoundRes.status === 404, 'Unknown endpoint returns 404');
    assert(notFoundJson !== null && notFoundJson.success === false, 'Unknown route returns valid JSON error structure, never empty body');

  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`Fallback & Resilience Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
}

runFallbackRouteTests().catch((err) => {
  console.error('Fatal fallback test error:', err);
  process.exit(1);
});
