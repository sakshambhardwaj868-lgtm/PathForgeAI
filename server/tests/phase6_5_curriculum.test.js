const { validateAndSanitizeRoadmap, detectGraphCycles, validatePrerequisiteIds } = require('../dist/schemas/roadmapSchema');
const { FallbackService } = require('../dist/services/fallbackService');
const { SavedRoadmap } = require('../dist/models/SavedRoadmap');
const { createApp } = require('../dist/app');
const mongoose = require('mongoose');

async function runPhase6_5Tests() {
  console.log('===============================================================');
  console.log('   PATHFORGE AI — PHASE 6.5: CURRICULUM & ROADMAP DEPTH TESTS ');
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

  // --- SECTION 1: VALIDATION OF ALL 3 DETAILED FALLBACK DATASETS ---
  console.log('--- SECTION 1: Fallback Datasets & Curriculum Depth ---');

  const climateRoadmap = FallbackService.getFallbackRoadmap('Full Stack Developer at a Climate Tech Startup', 15, 'Beginner');
  assert(climateRoadmap.milestones.length >= 10, `Climate Tech fallback has ${climateRoadmap.milestones.length} milestones (>= 10)`);
  assert(climateRoadmap.edges.length >= 10, `Climate Tech has ${climateRoadmap.edges.length} directed edges (>= 10)`);
  assert(detectGraphCycles(climateRoadmap.milestones) === false, 'Climate Tech DAG is 100% acyclic');
  assert(validatePrerequisiteIds(climateRoadmap.milestones).valid === true, 'All declared prerequisite IDs exist');

  // Verify milestone 1 curriculum
  const m1 = climateRoadmap.milestones[0];
  assert(!!m1.actionableData.whyItMatters, 'Milestone 1 has whyItMatters explanation');
  assert(Array.isArray(m1.actionableData.topics) && m1.actionableData.topics.length >= 2, 'Milestone 1 has structured topics & subtopics');
  assert(Array.isArray(m1.actionableData.lessons) && m1.actionableData.lessons.length >= 2, 'Milestone 1 has structured lessons');
  assert(m1.actionableData.lessons[0].studySteps.length >= 2, 'Lesson contains actionable study steps');
  assert(!!m1.actionableData.lessons[0].practiceActivity, 'Lesson contains hands-on practice activity');
  assert(!!m1.actionableData.lessons[0].completionCriteria, 'Lesson contains completion proof criterion');
  assert(Array.isArray(m1.actionableData.practicalExercises) && m1.actionableData.practicalExercises.length >= 1, 'Milestone 1 has practical exercises');
  assert(Array.isArray(m1.actionableData.quizQuestions) && m1.actionableData.quizQuestions.length >= 1, 'Milestone 1 has quiz questions with answers & explanations');
  assert(Array.isArray(m1.actionableData.completionCriteria) && m1.actionableData.completionCriteria.length >= 2, 'Milestone 1 has completion readiness criteria');

  // Verify FinTech UX fallback
  const fintechRoadmap = FallbackService.getFallbackRoadmap('Fintech Mobile & Web UI/UX Designer', 20, 'Intermediate');
  assert(fintechRoadmap.milestones.length >= 10, `FinTech UX fallback has ${fintechRoadmap.milestones.length} milestones (>= 10)`);
  assert(detectGraphCycles(fintechRoadmap.milestones) === false, 'FinTech UX DAG is 100% acyclic');
  assert(validatePrerequisiteIds(fintechRoadmap.milestones).valid === true, 'FinTech UX prerequisite IDs all valid');
  assert(fintechRoadmap.milestones[0].actionableData.whyItMatters.toLowerCase().includes('financial'), 'FinTech UX has domain-specific whyItMatters content');

  // Verify Generative AI fallback
  const aiRoadmap = FallbackService.getFallbackRoadmap('Generative AI Systems Engineer', 25, 'Advanced');
  assert(aiRoadmap.milestones.length >= 10, `AI Engineer fallback has ${aiRoadmap.milestones.length} milestones (>= 10)`);
  assert(detectGraphCycles(aiRoadmap.milestones) === false, 'AI Engineer DAG is 100% acyclic');
  assert(validatePrerequisiteIds(aiRoadmap.milestones).valid === true, 'AI Engineer prerequisite IDs all valid');
  assert(Array.isArray(aiRoadmap.milestones[0].actionableData.lessons) && aiRoadmap.milestones[0].actionableData.lessons.length >= 1, 'AI Engineer has deep lessons');

  // --- SECTION 2: BACKWARD COMPATIBILITY WITH LEGACY ROADMAPS ---
  console.log('\n--- SECTION 2: Backward Compatibility with Legacy Roadmaps ---');
  const legacyRaw = {
    id: 'legacy-v1-test',
    targetRole: 'Legacy System Architect',
    targetCompanyType: 'Enterprise',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 15,
    totalEstimatedWeeks: 10,
    phases: [
      { id: 'p1', title: 'Phase 1', description: 'Core foundation engineering', order: 1 },
      { id: 'p2', title: 'Phase 2', description: 'Advanced scalable platforms', order: 2 }
    ],
    intermediateRoles: [
      { title: 'Architect', estimatedTimelineMonth: 6, description: 'Senior architect leadership role' }
    ],
    milestones: [
      {
        id: 'ms-leg-1',
        title: 'Legacy Monoliths',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 25,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Objective 1', 'Objective 2'],
          weekendProject: {
            title: 'Refactor Script',
            description: 'Refactoring project',
            deliverables: ['PR link'],
            estimatedHours: 10
          },
          curatedResources: [
            {
              title: 'Legacy Docs',
              type: 'documentation',
              searchQueryOrUrl: 'https://docs.python.org',
              description: 'Python docs'
            }
          ],
          interviewChallenges: [
            {
              question: 'How do you decouple monoliths?',
              idealAnswerKey: 'Apply the Strangler Fig pattern.',
              difficulty: 'Medium'
            }
          ]
          // Notice: no whyItMatters, no topics, no lessons, no quizQuestions!
        }
      },
      {
        id: 'ms-leg-2',
        title: 'Microservices Transition',
        category: 'core-skill',
        phaseId: 'p2',
        estimatedHours: 35,
        prerequisiteIds: ['ms-leg-1'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Event-driven architecture'],
          weekendProject: {
            title: 'Event Bus',
            description: 'Build event bus',
            deliverables: ['Code'],
            estimatedHours: 12
          },
          curatedResources: [
            {
              title: 'Kafka Docs',
              type: 'documentation',
              searchQueryOrUrl: 'https://kafka.apache.org',
              description: 'Apache Kafka'
            }
          ],
          interviewChallenges: [
            {
              question: 'Explain at-least-once delivery.',
              idealAnswerKey: 'Retries until acknowledged, requires idempotency.',
              difficulty: 'Hard'
            }
          ]
        }
      },
      {
        id: 'ms-leg-3',
        title: 'Cloud Orchestration',
        category: 'capstone',
        phaseId: 'p2',
        estimatedHours: 40,
        prerequisiteIds: ['ms-leg-2'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Deploy distributed cluster'],
          weekendProject: {
            title: 'Kubernetes Cluster',
            description: 'Cluster deployment',
            deliverables: ['Manifests'],
            estimatedHours: 15
          },
          curatedResources: [
            {
              title: 'K8s Docs',
              type: 'documentation',
              searchQueryOrUrl: 'https://kubernetes.io',
              description: 'Official K8s documentation'
            }
          ],
          interviewChallenges: [
            {
              question: 'How do pods communicate?',
              idealAnswerKey: 'Via flat network overlay model.',
              difficulty: 'Hard'
            }
          ]
        }
      }
    ]
  };

  const legacyValidation = validateAndSanitizeRoadmap(legacyRaw, 'cached_fallback');
  if (!legacyValidation.success) {
    console.error('Legacy validation error details:', legacyValidation.errors);
  }
  assert(legacyValidation.success === true, 'Legacy roadmap without new curriculum fields validates successfully');
  if (legacyValidation.success) {
    const sanitized = legacyValidation.data;
    assert(sanitized.milestones[0].actionableData.topics !== undefined, 'Default empty topics array provided for legacy milestone');
    assert(sanitized.milestones[0].actionableData.lessons !== undefined, 'Default empty lessons array provided for legacy milestone');
    assert(sanitized.milestones[0].actionableData.quizQuestions !== undefined, 'Default empty quizQuestions array provided for legacy milestone');
  }

  // --- SECTION 3: TIMELINE & TOTAL HOURS CALCULATIONS ---
  console.log('\n--- SECTION 3: Timeline & Study Hours Calculations ---');
  const sumOfHours = climateRoadmap.milestones.reduce((acc, m) => acc + m.estimatedHours, 0);
  const calculatedWeeks = Math.ceil(sumOfHours / climateRoadmap.weeklyCommitmentHours);
  assert(climateRoadmap.totalEstimatedWeeks === calculatedWeeks, `Total estimated weeks (${climateRoadmap.totalEstimatedWeeks}) matches sum(${sumOfHours}h) / ${climateRoadmap.weeklyCommitmentHours}h/wk = ${calculatedWeeks} wks`);

  // --- SECTION 4: MONGODB SAVEDROADMAP MODEL SERIALIZATION ---
  console.log('\n--- SECTION 4: MongoDB Model Serialization ---');
  const dummyDoc = new SavedRoadmap({
    userId: new mongoose.Types.ObjectId(),
    roadmapId: climateRoadmap.id,
    targetRole: climateRoadmap.targetRole,
    targetCompanyType: climateRoadmap.targetCompanyType,
    experienceLevel: climateRoadmap.experienceLevel,
    weeklyCommitmentHours: climateRoadmap.weeklyCommitmentHours,
    totalEstimatedWeeks: climateRoadmap.totalEstimatedWeeks,
    source: climateRoadmap.source,
    phases: climateRoadmap.phases,
    intermediateRoles: climateRoadmap.intermediateRoles,
    milestones: climateRoadmap.milestones,
    edges: climateRoadmap.edges,
  });

  const serialized = dummyDoc.toJSON();
  assert(Array.isArray(serialized.milestones) && serialized.milestones.length === climateRoadmap.milestones.length, 'Mongoose preserves all 12 milestones in document');
  assert(Array.isArray(serialized.milestones[0].actionableData.lessons) && serialized.milestones[0].actionableData.lessons.length >= 2, 'Mongoose preserves lessons array in actionableData');
  assert(Array.isArray(serialized.milestones[0].actionableData.topics) && serialized.milestones[0].actionableData.topics.length >= 2, 'Mongoose preserves topics array in actionableData');
  assert(Array.isArray(serialized.milestones[0].actionableData.quizQuestions) && serialized.milestones[0].actionableData.quizQuestions.length >= 1, 'Mongoose preserves quizQuestions array in actionableData');

  // --- SECTION 5: HTTP ENDPOINT EXECUTION ---
  console.log('\n--- SECTION 5: HTTP API Endpoints ---');
  const app = createApp();
  const server = app.listen(5004);

  try {
    const res = await fetch('http://localhost:5004/api/v1/roadmap/fallback?role=Generative+AI+Systems+Engineer&hours=25&level=Advanced');
    const data = await res.json();

    assert(res.status === 200, 'GET /api/v1/roadmap/fallback returns HTTP 200');
    assert(data.success === true, 'Fallback response success: true');
    assert(data.data.milestones.length >= 10, `Endpoint returns ${data.data.milestones.length} milestones (>= 10)`);
    assert(data.data.milestones[0].actionableData.lessons.length >= 1, 'Endpoint returns rich lessons');
    assert(detectGraphCycles(data.data.milestones) === false, 'Endpoint returns 100% acyclic DAG');
  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`Phase 6.5 Curriculum Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
}

runPhase6_5Tests().catch((err) => {
  console.error('Fatal Phase 6.5 test error:', err);
  process.exit(1);
});
