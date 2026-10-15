/**
 * PathForge AI — Phase 11: Career Graph Redesign Tests
 * Validates backend roadmap schemas, in_progress status support, DAG acyclicity, and stage definitions.
 */

const assert = require('assert');
const path = require('path');

let roadmapSchemaModule;
try {
  roadmapSchemaModule = require('../dist/schemas/roadmapSchema');
} catch {
  // If dist not built yet, we'll build or import
}

function runTests() {
  console.log('\n===============================================================');
  console.log('   PATHFORGE AI — PHASE 11: CAREER GRAPH REDESIGN TESTS (API)  ');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      throw err;
    }
  }

  if (!roadmapSchemaModule) {
    console.log('  Building server first...');
    const { execSync } = require('child_process');
    execSync('npm run build', { cwd: path.join(__dirname, '..') });
    roadmapSchemaModule = require('../dist/schemas/roadmapSchema');
  }

  const {
    roadmapMilestoneSchema,
    roadmapPhaseSchema,
    detectGraphCycles,
  } = roadmapSchemaModule;

  const validActionableData = {
    learningObjectives: ['Learn Raft', 'Write replication logs'],
    weekendProject: {
      title: 'Mini Raft',
      description: 'Raft consensus in Go',
      deliverables: ['Election loop'],
      estimatedHours: 12,
    },
    curatedResources: [
      {
        title: 'Raft Paper',
        type: 'documentation',
        searchQueryOrUrl: 'https://raft.github.io',
        description: 'Original In Search of an Understandable Consensus Algorithm paper',
      },
    ],
    interviewChallenges: [
      {
        question: 'How does Raft elect a new leader during split votes?',
        idealAnswerKey: 'Randomized election timeouts break split-vote ties effectively.',
        difficulty: 'Medium',
      },
    ],
  };

  console.log('--- SECTION 1: Milestone Status & Schema Support ---');

  test('Accepts "in_progress" status in roadmapMilestoneSchema', () => {
    const milestone = {
      id: 'ms-test-in-progress',
      title: 'Distributed Storage Systems',
      category: 'core-skill',
      phaseId: 'phase-core',
      estimatedHours: 25,
      prerequisiteIds: ['ms-foundations'],
      status: 'in_progress',
      isKnown: false,
      actionableData: validActionableData,
    };

    const parsed = roadmapMilestoneSchema.parse(milestone);
    assert.strictEqual(parsed.status, 'in_progress');
  });

  test('Accepts all standard career roadmap statuses', () => {
    const statuses = ['locked', 'available', 'in_progress', 'completed', 'completed_with_warning'];
    statuses.forEach((status) => {
      const milestone = {
        id: `ms-status-${status}`,
        title: `Skill with status ${status}`,
        category: 'foundation',
        phaseId: 'phase-1',
        estimatedHours: 20,
        prerequisiteIds: [],
        status,
        isKnown: status === 'completed',
        actionableData: validActionableData,
      };

      const parsed = roadmapMilestoneSchema.parse(milestone);
      assert.strictEqual(parsed.status, status);
    });
  });

  console.log('\n--- SECTION 2: Career Stages / Phases Schema ---');

  test('Validates progressive career stages with title, order, and description', () => {
    const stages = [
      { id: 'stage-1', title: 'Foundations', description: 'Core computer science fundamentals', order: 1 },
      { id: 'stage-2', title: 'Core Skills', description: 'Domain-specific technologies', order: 2 },
      { id: 'stage-3', title: 'Advanced Systems', description: 'Distributed consensus & scale', order: 3 },
      { id: 'stage-4', title: 'Capstone & Projects', description: 'Production deliverable', order: 4 },
      { id: 'stage-5', title: 'Career Readiness', description: 'Interview & architecture readiness', order: 5 },
    ];

    stages.forEach((stage) => {
      const parsed = roadmapPhaseSchema.parse(stage);
      assert.strictEqual(parsed.id, stage.id);
      assert.strictEqual(parsed.order, stage.order);
      assert.strictEqual(parsed.title, stage.title);
    });
  });

  console.log('\n--- SECTION 3: DAG Prerequisite Topologies & Cycle Prevention ---');

  test('Detects and flags circular dependencies in graph', () => {
    const cyclicMilestones = [
      { id: 'a', prerequisiteIds: ['b'] },
      { id: 'b', prerequisiteIds: ['c'] },
      { id: 'c', prerequisiteIds: ['a'] },
    ];

    const hasCycle = detectGraphCycles(cyclicMilestones);
    assert.strictEqual(hasCycle, true);
  });

  test('Approves valid DAG with progressive tiers and multiple prerequisites', () => {
    const validDagMilestones = [
      { id: 'foundations', prerequisiteIds: [] },
      { id: 'networking', prerequisiteIds: ['foundations'] },
      { id: 'databases', prerequisiteIds: ['foundations'] },
      { id: 'distributed_systems', prerequisiteIds: ['networking', 'databases'] },
      { id: 'capstone', prerequisiteIds: ['distributed_systems'] },
    ];

    const hasCycle = detectGraphCycles(validDagMilestones);
    assert.strictEqual(hasCycle, false);
  });

  console.log('\n===============================================================');
  console.log(`  CAREER GRAPH BACKEND SUITE: ${passed} PASSED, 0 FAILED`);
  console.log('===============================================================\n');
}

runTests();
