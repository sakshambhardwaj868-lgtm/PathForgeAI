import { describe, it, expect } from 'vitest';
import { recalculateRoadmapState } from '../utils/replanEngine';
import { CareerRoadmap, RoadmapMilestone } from '../types/roadmap';

describe('Phase 5 Dynamic Re-planning & Skill Gap Engine (replanEngine)', () => {
  const createMilestone = (
    id: string,
    prereqIds: string[] = [],
    isKnown = false,
    hours = 20
  ): RoadmapMilestone => ({
    id,
    title: `Milestone ${id}`,
    category: 'core-skill',
    phaseId: 'p1',
    estimatedHours: hours,
    prerequisiteIds: prereqIds,
    status: prereqIds.length === 0 ? 'available' : 'locked',
    isKnown,
    actionableData: {
      learningObjectives: [],
      weekendProject: { title: 'P', description: 'D', deliverables: [], estimatedHours: 10 },
      curatedResources: [],
      interviewChallenges: [],
    },
  });

  const baseRoadmap: CareerRoadmap = {
    id: 'replan-test',
    targetRole: 'Distributed Systems Engineer',
    targetCompanyType: 'Cloud Infra',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 10,
    source: 'live_ai',
    phases: [],
    intermediateRoles: [],
    milestones: [],
    edges: [],
    createdAt: new Date().toISOString(),
  };

  it('handles null, undefined, and empty roadmaps safely without crashing', () => {
    const nullResult = recalculateRoadmapState(null);
    expect(nullResult.metrics.totalMilestones).toBe(0);
    expect(nullResult.metrics.remainingHours).toBe(0);

    const emptyResult = recalculateRoadmapState({ ...baseRoadmap, milestones: [] });
    expect(emptyResult.metrics.totalMilestones).toBe(0);
    expect(emptyResult.metrics.completionPercentage).toBe(0);
  });

  it('evaluates initial states correctly: root nodes available, dependent nodes locked', () => {
    const m1 = createMilestone('m1', [], false, 20); // root
    const m2 = createMilestone('m2', ['m1'], false, 20); // dependent

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1, m2],
      edges: [{ id: 'e1', source: 'm1', target: 'm2' }],
    };

    const { roadmap: updated, metrics } = recalculateRoadmapState(roadmap);

    expect(updated.milestones.find((m) => m.id === 'm1')?.status).toBe('available');
    expect(updated.milestones.find((m) => m.id === 'm2')?.status).toBe('locked');
    expect(metrics.completedCount).toBe(0);
    expect(metrics.totalHours).toBe(40);
    expect(metrics.remainingHours).toBe(40);
    expect(metrics.remainingWeeks).toBe(2); // 40h / 20h/wk
  });

  it('unlocks downstream milestone when prerequisite is completed', () => {
    const m1 = createMilestone('m1', [], true, 20); // completed
    const m2 = createMilestone('m2', ['m1'], false, 20); // dependent

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1, m2],
      edges: [{ id: 'e1', source: 'm1', target: 'm2' }],
    };

    const { roadmap: updated, metrics } = recalculateRoadmapState(roadmap);

    expect(updated.milestones.find((m) => m.id === 'm1')?.status).toBe('completed');
    expect(updated.milestones.find((m) => m.id === 'm2')?.status).toBe('available');
    expect(metrics.completedCount).toBe(1);
    expect(metrics.remainingHours).toBe(20);
    expect(metrics.completionPercentage).toBe(50);
  });

  it('handles converging dependencies: child requires ALL prerequisites satisfied', () => {
    // m3 requires BOTH m1 and m2
    const m1 = createMilestone('m1', [], true, 10); // completed
    const m2 = createMilestone('m2', [], false, 10); // incomplete
    const m3 = createMilestone('m3', ['m1', 'm2'], false, 20);

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1, m2, m3],
      edges: [
        { id: 'e1', source: 'm1', target: 'm3' },
        { id: 'e2', source: 'm2', target: 'm3' },
      ],
    };

    // When only m1 is done, m3 remains locked
    const statePartial = recalculateRoadmapState(roadmap);
    expect(statePartial.roadmap.milestones.find((m) => m.id === 'm3')?.status).toBe('locked');

    // When m2 is also completed, m3 unlocks to available
    const roadmapAllDone: CareerRoadmap = {
      ...roadmap,
      milestones: [
        createMilestone('m1', [], true, 10),
        createMilestone('m2', [], true, 10),
        createMilestone('m3', ['m1', 'm2'], false, 20),
      ],
    };

    const stateComplete = recalculateRoadmapState(roadmapAllDone);
    expect(stateComplete.roadmap.milestones.find((m) => m.id === 'm3')?.status).toBe('available');
  });

  it('handles branching dependencies: completing root unlocks all parallel children', () => {
    const root = createMilestone('root', [], true, 20);
    const branchA = createMilestone('branchA', ['root'], false, 20);
    const branchB = createMilestone('branchB', ['root'], false, 20);

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [root, branchA, branchB],
      edges: [
        { id: 'e-r-a', source: 'root', target: 'branchA' },
        { id: 'e-r-b', source: 'root', target: 'branchB' },
      ],
    };

    const { roadmap: updated } = recalculateRoadmapState(roadmap);

    expect(updated.milestones.find((m) => m.id === 'branchA')?.status).toBe('available');
    expect(updated.milestones.find((m) => m.id === 'branchB')?.status).toBe('available');
  });

  it('PRESERVES WORK NON-DESTRUCTIVELY: shows completed_with_warning when prereq is incomplete', () => {
    // Learner independently learned m2, but did not complete m1
    const m1 = createMilestone('m1', [], false, 20); // open prereq
    const m2 = createMilestone('m2', ['m1'], true, 20); // learner knows this!

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1, m2],
      edges: [{ id: 'e1', source: 'm1', target: 'm2' }],
    };

    const { roadmap: updated, metrics } = recalculateRoadmapState(roadmap);

    const m2Node = updated.milestones.find((m) => m.id === 'm2');
    expect(m2Node?.isKnown).toBe(true); // WORK PRESERVED!
    expect(m2Node?.status).toBe('completed_with_warning'); // Flagged with warning!
    expect(metrics.warningGapCount).toBe(1);

    // Edge m1 -> m2 is flagged with isWarningGap: true
    const gapEdge = updated.edges.find((e) => e.source === 'm1' && e.target === 'm2');
    expect(gapEdge?.isWarningGap).toBe(true);
  });

  it('preserves work when an upstream prerequisite is unmarked/unchecked', () => {
    // Both were previously complete
    // Now user unchecks m1
    const m1 = createMilestone('m1', [], false, 20); // unchecked
    const m2 = createMilestone('m2', ['m1'], true, 20); // remains checked

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1, m2],
      edges: [{ id: 'e1', source: 'm1', target: 'm2' }],
    };

    const { roadmap: updated, metrics } = recalculateRoadmapState(roadmap);

    expect(updated.milestones.find((m) => m.id === 'm2')?.status).toBe('completed_with_warning');
    expect(metrics.warningGapCount).toBe(1);
    expect(metrics.completedCount).toBe(1); // User still has credit for m2!
  });

  it('resolves gap warning when the missing prerequisite is subsequently completed', () => {
    // User now completes m1
    const m1 = createMilestone('m1', [], true, 20);
    const m2 = createMilestone('m2', ['m1'], true, 20);

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1, m2],
      edges: [{ id: 'e1', source: 'm1', target: 'm2' }],
    };

    const { roadmap: updated, metrics } = recalculateRoadmapState(roadmap);

    expect(updated.milestones.find((m) => m.id === 'm2')?.status).toBe('completed');
    expect(metrics.warningGapCount).toBe(0);
    expect(metrics.completionPercentage).toBe(100);
    expect(metrics.remainingHours).toBe(0);
    expect(metrics.remainingWeeks).toBe(0);
  });

  it('safely handles ghost/missing prerequisite IDs without throwing', () => {
    const m1 = createMilestone('m1', ['non_existent_ghost_node'], false, 20);

    const roadmap: CareerRoadmap = {
      ...baseRoadmap,
      milestones: [m1],
      edges: [],
    };

    // Missing ghost node is not known, so m1 is locked
    const { roadmap: updated } = recalculateRoadmapState(roadmap);
    expect(updated.milestones[0].status).toBe('locked');
  });
});
