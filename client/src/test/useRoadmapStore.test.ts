import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap } from '../types/roadmap';

describe('useRoadmapStore Zustand Store', () => {
  const sampleRoadmap: CareerRoadmap = {
    id: 'store-test-roadmap',
    targetRole: 'Staff Climate Engineer',
    targetCompanyType: 'Renewable Tech',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 15,
    totalEstimatedWeeks: 12,
    source: 'live_ai',
    phases: [
      { id: 'p1', title: 'Phase 1: Foundations', description: 'Core basics', order: 1 },
    ],
    intermediateRoles: [],
    milestones: [
      {
        id: 'ms-1',
        title: 'Geospatial Analytics in Python',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 25,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Objective 1'],
          weekendProject: {
            title: 'Satellite Image Analyzer',
            description: 'Analyzes NDVI',
            deliverables: ['NDVI calculation script'],
            estimatedHours: 12,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
      {
        id: 'ms-2',
        title: 'Grid Decarbonization Pipeline',
        category: 'core-skill',
        phaseId: 'p1',
        estimatedHours: 30,
        prerequisiteIds: ['ms-1'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Objective 2'],
          weekendProject: {
            title: 'Grid Balancing Model',
            description: 'Simulates storage',
            deliverables: ['Simulation report'],
            estimatedHours: 15,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
    ],
    edges: [{ id: 'e-1-2', source: 'ms-1', target: 'ms-2' }],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
  });

  it('initializes with default empty state', () => {
    const state = useRoadmapStore.getState();
    expect(state.roadmap).toBeNull();
    expect(state.nodes).toEqual([]);
    expect(state.edges).toEqual([]);
    expect(state.selectedMilestoneId).toBeNull();
    expect(state.layoutDirection).toBe('TB');
  });

  it('setRoadmap computes Dagre nodes and edges and selects first milestone', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    const state = useRoadmapStore.getState();

    expect(state.roadmap).toEqual(sampleRoadmap);
    expect(state.nodes.length).toBe(2);
    expect(state.edges.length).toBe(1);
    expect(state.selectedMilestoneId).toBe('ms-1');
  });

  it('setLayoutDirection re-computes layout elements without losing data', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().setLayoutDirection('LR');

    const state = useRoadmapStore.getState();
    expect(state.layoutDirection).toBe('LR');
    expect(state.nodes.length).toBe(2);
    // In LR layout, nodes have Position.Left and Position.Right
    expect(state.nodes[0].targetPosition).toBe('left');
    expect(state.nodes[0].sourcePosition).toBe('right');
  });

  it('selectMilestone updates the selectedMilestoneId', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-2');

    expect(useRoadmapStore.getState().selectedMilestoneId).toBe('ms-2');
  });

  it('toggleMilestoneKnown updates milestone isKnown and status', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');

    const updatedRoadmap = useRoadmapStore.getState().roadmap;
    const ms1 = updatedRoadmap?.milestones.find((m) => m.id === 'ms-1');

    expect(ms1?.isKnown).toBe(true);
    expect(ms1?.status).toBe('completed');

    // Toggling again marks as incomplete
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');
    const toggledAgain = useRoadmapStore.getState().roadmap?.milestones.find((m) => m.id === 'ms-1');
    expect(toggledAgain?.isKnown).toBe(false);
    expect(toggledAgain?.status).toBe('available');
  });

  it('generateRoadmap handles network errors gracefully', async () => {
    // Mock fetch failure
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error: ECONNREFUSED'));

    const success = await useRoadmapStore.getState().generateRoadmap({
      targetRole: 'Test Role',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });

    expect(success).toBe(false);
    expect(useRoadmapStore.getState().isLoading).toBe(false);
    expect(useRoadmapStore.getState().error).toContain('ECONNREFUSED');
  });
});
