import { describe, it, expect } from 'vitest';
import { getLayoutedRoadmap } from '../utils/dagreLayout';
import { CareerRoadmap, RoadmapMilestone, RoadmapEdge } from '../types/roadmap';
import { Position } from '@xyflow/react';

describe('Dagre Graph Layout Utility', () => {
  const createMockMilestone = (id: string, prereqIds: string[] = []): RoadmapMilestone => ({
    id,
    title: `Milestone ${id}`,
    category: 'core-skill',
    phaseId: 'phase-1',
    estimatedHours: 20,
    prerequisiteIds: prereqIds,
    status: prereqIds.length === 0 ? 'available' : 'locked',
    isKnown: false,
    actionableData: {
      learningObjectives: ['Objective 1'],
      weekendProject: {
        title: 'Project Alpha',
        description: 'Test project description',
        deliverables: ['Deliverable 1'],
        estimatedHours: 15,
      },
      curatedResources: [
        {
          title: 'Resource 1',
          type: 'github_search',
          searchQueryOrUrl: 'https://github.com/search?q=test',
          description: 'Search repo',
        },
      ],
      interviewChallenges: [
        {
          question: 'What is X?',
          idealAnswerKey: 'X is Y.',
          difficulty: 'Medium',
        },
      ],
    },
  });

  it('handles empty roadmap gracefully without error', () => {
    const result = getLayoutedRoadmap(null);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);

    const emptyRoadmap = { milestones: [], edges: [] } as unknown as CareerRoadmap;
    const emptyResult = getLayoutedRoadmap(emptyRoadmap);
    expect(emptyResult.nodes).toEqual([]);
    expect(emptyResult.edges).toEqual([]);
  });

  it('correctly layouts a linear sequence of milestones', () => {
    const m1 = createMockMilestone('m1', []);
    const m2 = createMockMilestone('m2', ['m1']);
    const m3 = createMockMilestone('m3', ['m2']);

    const edges: RoadmapEdge[] = [
      { id: 'e1', source: 'm1', target: 'm2' },
      { id: 'e2', source: 'm2', target: 'm3' },
    ];

    const roadmap: CareerRoadmap = {
      id: 'test-linear',
      targetRole: 'Software Engineer',
      targetCompanyType: 'Tech',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
      totalEstimatedWeeks: 8,
      source: 'live_ai',
      phases: [{ id: 'p1', title: 'Phase 1', description: 'Desc', order: 1 }],
      intermediateRoles: [],
      milestones: [m1, m2, m3],
      edges,
      createdAt: new Date().toISOString(),
    };

    const layout = getLayoutedRoadmap(roadmap, { direction: 'TB' });

    expect(layout.nodes.length).toBe(3);
    expect(layout.edges.length).toBe(2);

    // In top-to-bottom layout, downstream milestones should have higher Y coordinates
    const m1Node = layout.nodes.find((n) => n.id === 'm1')!;
    const m2Node = layout.nodes.find((n) => n.id === 'm2')!;
    const m3Node = layout.nodes.find((n) => n.id === 'm3')!;

    expect(m2Node.position.y).toBeGreaterThan(m1Node.position.y);
    expect(m3Node.position.y).toBeGreaterThan(m2Node.position.y);
  });

  it('correctly handles branching and converging dependencies', () => {
    // Branching: root branches to branchA and branchB
    // Converging: branchA and branchB converge into capstone
    const root = createMockMilestone('root', []);
    const branchA = createMockMilestone('branchA', ['root']);
    const branchB = createMockMilestone('branchB', ['root']);
    const capstone = createMockMilestone('capstone', ['branchA', 'branchB']);

    const edges: RoadmapEdge[] = [
      { id: 'e-r-a', source: 'root', target: 'branchA' },
      { id: 'e-r-b', source: 'root', target: 'branchB' },
      { id: 'e-a-c', source: 'branchA', target: 'capstone' },
      { id: 'e-b-c', source: 'branchB', target: 'capstone' },
    ];

    const roadmap: CareerRoadmap = {
      id: 'test-dag',
      targetRole: 'Data Engineer',
      targetCompanyType: 'Tech',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
      totalEstimatedWeeks: 10,
      source: 'live_ai',
      phases: [],
      intermediateRoles: [],
      milestones: [root, branchA, branchB, capstone],
      edges,
      createdAt: new Date().toISOString(),
    };

    const layout = getLayoutedRoadmap(roadmap, { direction: 'TB' });

    expect(layout.nodes.length).toBe(4);
    expect(layout.edges.length).toBe(4);

    const rootNode = layout.nodes.find((n) => n.id === 'root')!;
    const branchANode = layout.nodes.find((n) => n.id === 'branchA')!;
    const branchBNode = layout.nodes.find((n) => n.id === 'branchB')!;
    const capstoneNode = layout.nodes.find((n) => n.id === 'capstone')!;

    // Both branches should be lower than root
    expect(branchANode.position.y).toBeGreaterThan(rootNode.position.y);
    expect(branchBNode.position.y).toBeGreaterThan(rootNode.position.y);

    // Branch A and Branch B should have separated X coordinates
    expect(branchANode.position.x).not.toEqual(branchBNode.position.x);

    // Capstone should be lower than both branches
    expect(capstoneNode.position.y).toBeGreaterThan(branchANode.position.y);
    expect(capstoneNode.position.y).toBeGreaterThan(branchBNode.position.y);
  });

  it('safely filters out invalid or ghost prerequisite references without crashing', () => {
    const m1 = createMockMilestone('m1', []);
    const m2 = createMockMilestone('m2', ['ghost_node_that_does_not_exist']);

    const edges: RoadmapEdge[] = [
      { id: 'e-valid', source: 'm1', target: 'm2' },
      { id: 'e-ghost', source: 'ghost_node_that_does_not_exist', target: 'm2' },
    ];

    const roadmap: CareerRoadmap = {
      id: 'test-invalid-prereq',
      targetRole: 'Test Role',
      targetCompanyType: 'Tech',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 10,
      totalEstimatedWeeks: 4,
      source: 'cached_fallback',
      phases: [],
      intermediateRoles: [],
      milestones: [m1, m2],
      edges,
      createdAt: new Date().toISOString(),
    };

    const layout = getLayoutedRoadmap(roadmap);

    // Both valid nodes rendered safely
    expect(layout.nodes.length).toBe(2);
    // Ghost edge pointing from non-existent node was safely discarded
    expect(layout.edges.length).toBe(1);
    expect(layout.edges[0].id).toBe('e-valid');
  });

  it('supports horizontal Left-to-Right (LR) layout and configures handles accordingly', () => {
    const m1 = createMockMilestone('m1', []);
    const m2 = createMockMilestone('m2', ['m1']);

    const roadmap: CareerRoadmap = {
      id: 'test-lr',
      targetRole: 'Frontend Dev',
      targetCompanyType: 'Agency',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
      totalEstimatedWeeks: 6,
      source: 'cached_fallback',
      phases: [],
      intermediateRoles: [],
      milestones: [m1, m2],
      edges: [{ id: 'e1', source: 'm1', target: 'm2' }],
      createdAt: new Date().toISOString(),
    };

    const layoutLR = getLayoutedRoadmap(roadmap, { direction: 'LR' });

    expect(layoutLR.nodes[0].targetPosition).toBe(Position.Left);
    expect(layoutLR.nodes[0].sourcePosition).toBe(Position.Right);

    const m1Node = layoutLR.nodes.find((n) => n.id === 'm1')!;
    const m2Node = layoutLR.nodes.find((n) => n.id === 'm2')!;

    // In LR layout, downstream node should have higher X coordinate
    expect(m2Node.position.x).toBeGreaterThan(m1Node.position.x);
  });
});
