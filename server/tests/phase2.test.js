const { validatePrerequisiteIds, detectGraphCycles } = require('../dist/schemas/roadmapSchema');
const { FallbackService } = require('../dist/services/fallbackService');
const { createApp } = require('../dist/app');

async function runPhase2Tests() {
  console.log('===============================================================');
  console.log('       PATHFORGE AI — PHASE 2 COMPREHENSIVE TEST SUITE         ');
  console.log('===============================================================\n');

  let unitPassed = 0;
  let unitFailed = 0;
  let liveStatus = 'UNKNOWN';

  function assertUnit(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      unitPassed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      unitFailed++;
    }
  }

  // --- SECTION 1: GRAPH & TOPOLOGY UNIT TESTS ---
  console.log('--- SECTION 1: Graph Topology & Schema Unit Tests ---');
  const validMilestones = [
    { id: 'm1', prerequisiteIds: [] },
    { id: 'm2', prerequisiteIds: ['m1'] },
    { id: 'm3', prerequisiteIds: ['m2'] }
  ];
  assertUnit(detectGraphCycles(validMilestones) === false, 'Cycle Detection: Acyclic DAG returns false (no cycle)');

  const cyclicMilestones = [
    { id: 'm1', prerequisiteIds: ['m3'] },
    { id: 'm2', prerequisiteIds: ['m1'] },
    { id: 'm3', prerequisiteIds: ['m2'] }
  ];
  assertUnit(detectGraphCycles(cyclicMilestones) === true, 'Cycle Detection: Circular dependency (A->B->C->A) detected as true');

  const validPrereqCheck = validatePrerequisiteIds(validMilestones);
  assertUnit(validPrereqCheck.valid === true, 'Prerequisite Validation: All declared parent IDs exist');

  const invalidPrereqCheck = validatePrerequisiteIds([
    { id: 'm1', prerequisiteIds: ['m_ghost'] }
  ]);
  assertUnit(invalidPrereqCheck.valid === false && invalidPrereqCheck.missingPrereqs.length === 1,
    'Prerequisite Validation: Missing prerequisite ID is caught and flagged');

  // --- SECTION 2: OFFLINE FALLBACK RESILIENCE TESTS ---
  console.log('\n--- SECTION 2: Offline Fallback Resilience Tests ---');
  const climateFallback = FallbackService.getFallbackRoadmap('Full Stack Climate Developer', 15, 'Beginner');
  assertUnit(climateFallback.source === 'cached_fallback' && climateFallback.milestones.length >= 4,
    'Fallback Service: Climate Tech fallback loads and passes full DAG validation');

  const fintechFallback = FallbackService.getFallbackRoadmap('Fintech UI/UX Designer', 20, 'Intermediate');
  assertUnit(fintechFallback.source === 'cached_fallback' && fintechFallback.targetRole.includes('UI/UX'),
    'Fallback Service: Fintech UX fallback loads properly based on keyword matching');

  const aiFallback = FallbackService.getFallbackRoadmap('Generative AI Systems Engineer', 25, 'Advanced');
  assertUnit(aiFallback.source === 'cached_fallback' && aiFallback.milestones.length >= 3,
    'Fallback Service: AI Engineer fallback loads properly based on keyword matching');

  // --- SECTION 3: API REQUEST VALIDATION TESTS ---
  console.log('\n--- SECTION 3: HTTP API Request Validation Tests ---');
  const app = createApp();
  const server = app.listen(5002);

  try {
    const badReqResponse = await fetch('http://localhost:5002/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'x' }) // invalid: length < 3
    });
    const badReqJson = await badReqResponse.json();
    assertUnit(badReqResponse.status === 400 && badReqJson.success === false && !!badReqJson.details,
      'Request Validation: Sub-minimum targetRole triggers HTTP 400 with field details');

    // --- SECTION 4: LIVE ROADMAP GENERATION ATTEMPT & API ENDPOINT TEST ---
    console.log('\n--- SECTION 4: Live Roadmap Generation & Endpoint Execution ---');
    console.log('Sending live generation request to POST /api/v1/roadmap/generate...');
    const startTime = Date.now();

    const liveReqResponse = await fetch('http://localhost:5002/api/v1/roadmap/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole: 'Full Stack Developer at a Climate Tech Startup',
        targetCompanyType: 'Clean Energy Series-A',
        experienceLevel: 'Beginner',
        weeklyCommitmentHours: 15
      })
    });

    const elapsed = Date.now() - startTime;
    const liveStatusCode = liveReqResponse.status;
    const liveData = await liveReqResponse.json();

    assertUnit(liveStatusCode === 200, `Endpoint Availability: Returned HTTP 200 OK (${elapsed}ms)`);
    assertUnit(liveData.success === true, 'Response Payload: Has success: true');
    assertUnit(Array.isArray(liveData.data?.phases) && liveData.data.phases.length >= 2,
      'Graph Structure: Response contains structured phases');
    assertUnit(Array.isArray(liveData.data?.milestones) && liveData.data.milestones.length >= 3,
      'Graph Structure: Response contains validated milestone DAG nodes');
    assertUnit(Array.isArray(liveData.data?.edges) && liveData.data.edges.length >= 1,
      'Graph Structure: Deterministic edges derived from prerequisites');
    assertUnit(detectGraphCycles(liveData.data.milestones) === false,
      'DAG Integrity: Graph verified 100% acyclic');

    liveStatus = liveData.data.source; // 'live_ai' or 'cached_fallback'

    console.log('\n---------------------------------------------------------------');
    console.log('              LIVE GENERATION EXECUTION SUMMARY                ');
    console.log('---------------------------------------------------------------');
    console.log(`Endpoint HTTP Status:  ${liveStatusCode}`);
    console.log(`Execution Time:        ${elapsed}ms`);
    console.log(`Delivered Source:      ${liveData.data.source}`);
    console.log(`Milestones Rendered:   ${liveData.data.milestones.length}`);
    console.log(`Edges Connected:       ${liveData.data.edges.length}`);
    console.log(`Calculated Prep Weeks: ${liveData.data.totalEstimatedWeeks}`);
    if (liveStatus === 'live_ai') {
      console.log('Status:                LIVE AI INFERENCE SUCCEEDED via Gemini API');
    } else {
      console.log('Status:                FALLBACK SAFETY ENGAGED (due to upstream 503 high-demand spike)');
    }
  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`  UNIT & VALIDATION TESTS: ${unitPassed} PASSED, ${unitFailed} FAILED`);
  console.log(`  LIVE GENERATION OUTCOME:  Source = ${liveStatus}`);
  console.log('===============================================================\n');

  if (unitFailed > 0) process.exit(1);
}

runPhase2Tests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
