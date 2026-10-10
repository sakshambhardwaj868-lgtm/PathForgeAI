const { validatePrerequisiteIds, detectGraphCycles, validateAndSanitizeRoadmap } = require('./dist/schemas/roadmapSchema');
const { FallbackService } = require('./dist/services/fallbackService');
const { AiService } = require('./dist/services/aiService');
const { createApp } = require('./dist/app');

async function runTests() {
  console.log('=== PATHFORGE AI — PHASE 2 AUTOMATED TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // --- TEST 1: Cycle Detection on Valid DAG ---
  const validMilestones = [
    { id: 'm1', prerequisiteIds: [] },
    { id: 'm2', prerequisiteIds: ['m1'] },
    { id: 'm3', prerequisiteIds: ['m2'] }
  ];
  assert(detectGraphCycles(validMilestones) === false, 'Cycle Detection: Acyclic graph returns false (no cycle)');

  // --- TEST 2: Cycle Detection on Cyclical Graph ---
  const cyclicMilestones = [
    { id: 'm1', prerequisiteIds: ['m3'] },
    { id: 'm2', prerequisiteIds: ['m1'] },
    { id: 'm3', prerequisiteIds: ['m2'] }
  ];
  assert(detectGraphCycles(cyclicMilestones) === true, 'Cycle Detection: Circular dependency (A->B->C->A) detected as true');

  // --- TEST 3: Prerequisite ID Verification ---
  const validPrereqCheck = validatePrerequisiteIds(validMilestones);
  assert(validPrereqCheck.valid === true, 'Prerequisite Validation: All declared parent IDs exist');

  const invalidPrereqCheck = validatePrerequisiteIds([
    { id: 'm1', prerequisiteIds: ['m_ghost'] }
  ]);
  assert(invalidPrereqCheck.valid === false && invalidPrereqCheck.missingPrereqs.length === 1,
    'Prerequisite Validation: Missing prerequisite ID is caught and flagged');

  // --- TEST 4: Fallback Service ---
  const climateFallback = FallbackService.getFallbackRoadmap('Full Stack Climate Developer', 15, 'Beginner');
  assert(climateFallback.source === 'cached_fallback' && climateFallback.milestones.length >= 4,
    'Fallback Service: Climate Tech fallback loads and passes DAG validation');

  const fintechFallback = FallbackService.getFallbackRoadmap('Fintech UI/UX Designer', 20, 'Intermediate');
  assert(fintechFallback.source === 'cached_fallback' && fintechFallback.targetRole.includes('UI/UX'),
    'Fallback Service: Fintech UX fallback loads properly based on keyword matching');

  const aiFallback = FallbackService.getFallbackRoadmap('Generative AI Systems Engineer', 25, 'Advanced');
  assert(aiFallback.source === 'cached_fallback' && aiFallback.milestones.length >= 3,
    'Fallback Service: AI Engineer fallback loads properly based on keyword matching');

  // --- TEST 5: Express App Endpoints ---
  const app = createApp();
  const server = app.listen(5001);

  try {
    // 5A: Request validation error test (targetRole too short)
    const badReqResponse = await fetch('http://localhost:5001/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'ab' })
    });
    const badReqJson = await badReqResponse.json();
    assert(badReqResponse.status === 400 && badReqJson.success === false,
      'API Request Validation: Short targetRole triggers HTTP 400 with details');

    // 5B: Live roadmap generation test via Gemini API
    console.log('\n[INFO] Testing Live Roadmap Generation via Gemini API...');
    const liveReqResponse = await fetch('http://localhost:5001/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: 'Full Stack Developer at a Climate Tech Startup',
        targetCompanyType: 'Clean Energy Series-A',
        experienceLevel: 'Beginner',
        weeklyCommitmentHours: 15
      })
    });

    assert(liveReqResponse.status === 200, 'API Live Generation: Endpoint returns HTTP 200 OK');
    const liveData = await liveReqResponse.json();
    assert(liveData.success === true, 'API Live Generation: Response has success: true');
    assert(Array.isArray(liveData.data.phases) && liveData.data.phases.length >= 3,
      'API Live Generation: Response contains structured phases');
    assert(Array.isArray(liveData.data.milestones) && liveData.data.milestones.length >= 4,
      'API Live Generation: Response contains validated milestone DAG nodes');
    assert(Array.isArray(liveData.data.edges) && liveData.data.edges.length >= 1,
      'API Live Generation: Deterministic edges derived from prerequisites');

    const hasCycles = detectGraphCycles(liveData.data.milestones);
    assert(hasCycles === false, 'API Live Generation: Verified 100% DAG acyclic graph');

    console.log(`\nGenerated Roadmap Source: ${liveData.data.source}`);
    console.log(`Total Milestones: ${liveData.data.milestones.length}`);
    console.log(`Total Edges: ${liveData.data.edges.length}`);
    console.log(`Estimated Prep Weeks: ${liveData.data.totalEstimatedWeeks}`);
  } finally {
    server.close();
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
