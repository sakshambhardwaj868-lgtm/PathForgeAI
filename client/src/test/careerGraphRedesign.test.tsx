import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { MilestoneNode } from '../components/graph/MilestoneNode';
import { CareerStageJourneyBar } from '../components/graph/CareerStageJourneyBar';
import { getLayoutedRoadmap } from '../utils/dagreLayout';
import { recalculateRoadmapState } from '../utils/replanEngine';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap, RoadmapMilestone } from '../types/roadmap';

describe('Phase 11 — Career Graph Redesign', () => {
  const sampleCareerRoadmap: CareerRoadmap = {
    id: 'career-graph-test-roadmap',
    targetRole: 'Senior Distributed Systems Architect',
    targetCompanyType: 'High-Scale Cloud Infrastructure',
    experienceLevel: 'Advanced',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 14,
    source: 'live_ai',
    edges: [],
    createdAt: '2026-10-15T00:00:00.000Z',
    phases: [
      {
        id: 'phase-foundations',
        title: 'Stage 1: Core Foundations',
        description: 'Underlying concurrency models and networking',
        order: 1,
      },
      {
        id: 'phase-core',
        title: 'Stage 2: Consensus & Storage Engines',
        description: 'Replication, consensus protocols, and LSM trees',
        order: 2,
      },
      {
        id: 'phase-capstone',
        title: 'Stage 3: Capstone Systems',
        description: 'Production distributed KV store deployment',
        order: 3,
      },
    ],
    intermediateRoles: [
      {
        title: 'Systems Engineer',
        estimatedTimelineMonth: 6,
        description: 'Core distributed services engineer',
      },
      {
        title: 'Senior Platform Engineer',
        estimatedTimelineMonth: 12,
        description: 'Platform infrastructure engineer',
      },
    ],
    milestones: [
      {
        id: 'ms-foundations-1',
        title: 'Async I/O & Actor Concurrency',
        category: 'foundation',
        phaseId: 'phase-foundations',
        estimatedHours: 20,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Master event loops', 'Implement non-blocking actor system'],
          weekendProject: {
            title: 'Custom Actor Runtime',
            description: 'Build an async message-passing actor runtime',
            deliverables: ['Benchmark suite', 'Thread pool dispatcher'],
            estimatedHours: 10,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
      {
        id: 'ms-consensus-2',
        title: 'Raft Consensus Implementation',
        category: 'core-skill',
        phaseId: 'phase-core',
        estimatedHours: 35,
        prerequisiteIds: ['ms-foundations-1'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['Leader election', 'Log compaction'],
          weekendProject: {
            title: 'Fault-Tolerant State Machine',
            description: 'Implement distributed consensus with Raft',
            deliverables: ['Cluster heartbeat test', 'Split-brain recovery test'],
            estimatedHours: 15,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
      {
        id: 'ms-storage-3',
        title: 'LSM-Tree Key-Value Engine',
        category: 'core-skill',
        phaseId: 'phase-core',
        estimatedHours: 30,
        prerequisiteIds: ['ms-foundations-1'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['MemTable, SSTable, Compaction'],
          weekendProject: {
            title: 'Mini LSM-Store',
            description: 'Persistent key-value engine with SSTable merges',
            deliverables: ['Write-ahead log', 'Compaction worker'],
            estimatedHours: 14,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
      {
        id: 'ms-capstone-4',
        title: 'Distributed Sharded Database Capstone',
        category: 'capstone',
        phaseId: 'phase-capstone',
        estimatedHours: 45,
        prerequisiteIds: ['ms-consensus-2', 'ms-storage-3'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['End-to-end distributed system integration'],
          weekendProject: {
            title: 'Production Sharded DB',
            description: 'Full multi-node sharded storage cluster',
            deliverables: ['Chaos engineering test run', 'Terraform manifest'],
            estimatedHours: 20,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
    ],
  };

  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
  });

  const renderWithFlow = (component: React.ReactElement) =>
    render(<ReactFlowProvider>{component}</ReactFlowProvider>);

  describe('1. Dynamic Career Stage Organization', () => {
    it('groups milestones into ordered stages with bounding boxes and completion metrics', () => {
      const layout = getLayoutedRoadmap(sampleCareerRoadmap, { direction: 'TB' });

      expect(layout.stageGroups).toBeDefined();
      expect(layout.stageGroups).toHaveLength(3);

      const [stage1, stage2, stage3] = layout.stageGroups!;

      expect(stage1.title).toBe('Stage 1: Core Foundations');
      expect(stage1.order).toBe(1);
      expect(stage1.totalCount).toBe(1);
      expect(stage1.completedCount).toBe(0);
      expect(stage1.isCompleted).toBe(false);
      expect(stage1.isActive).toBe(true);
      expect(stage1.bounds).toBeDefined();
      expect(stage1.bounds?.minX).toBeDefined();

      expect(stage2.title).toBe('Stage 2: Consensus & Storage Engines');
      expect(stage2.order).toBe(2);
      expect(stage2.totalCount).toBe(2);
      expect(stage2.totalHours).toBe(65);

      expect(stage3.title).toBe('Stage 3: Capstone Systems');
      expect(stage3.order).toBe(3);
      expect(stage3.totalCount).toBe(1);
      expect(stage3.totalHours).toBe(45);
    });

    it('attaches stage metadata (phaseTitle and stageOrder) to each node', () => {
      const layout = getLayoutedRoadmap(sampleCareerRoadmap, { direction: 'TB' });

      const node1 = layout.nodes.find((n) => n.id === 'ms-foundations-1');
      expect(node1?.data.phaseTitle).toBe('Stage 1: Core Foundations');
      expect(node1?.data.stageOrder).toBe(1);

      const node2 = layout.nodes.find((n) => n.id === 'ms-consensus-2');
      expect(node2?.data.phaseTitle).toBe('Stage 2: Consensus & Storage Engines');
      expect(node2?.data.stageOrder).toBe(2);
    });

    it('falls back to category-based stages gracefully when roadmap.phases is absent', () => {
      const roadmapWithoutPhases: CareerRoadmap = {
        ...sampleCareerRoadmap,
        phases: [],
      };

      const layout = getLayoutedRoadmap(roadmapWithoutPhases);
      expect(layout.stageGroups).toBeDefined();
      expect(layout.stageGroups!.length).toBeGreaterThan(0);
      expect(layout.stageGroups!.some((g) => g.title === 'Foundations')).toBe(true);
      expect(layout.stageGroups!.some((g) => g.title === 'Core Skills')).toBe(true);
      expect(layout.stageGroups!.some((g) => g.title === 'Capstone & Projects')).toBe(true);
    });

    it('renders CareerStageJourneyBar with stages, hours, completion counts, and click focus', () => {
      useRoadmapStore.getState().setRoadmap(sampleCareerRoadmap);

      renderWithFlow(<CareerStageJourneyBar />);

      expect(screen.getByRole('region', { name: /Career Journey Stages/i })).toBeInTheDocument();
      expect(screen.getByText('Stage 1: Core Foundations')).toBeInTheDocument();
      expect(screen.getByText('Stage 2: Consensus & Storage Engines')).toBeInTheDocument();
      expect(screen.getByText('Stage 3: Capstone Systems')).toBeInTheDocument();

      // Check hour badges in stage ribbon
      expect(screen.getByText('20h')).toBeInTheDocument();
      expect(screen.getByText('65h')).toBeInTheDocument();
      expect(screen.getByText('45h')).toBeInTheDocument();

      // Stage buttons should be clickable
      const stage1Button = screen.getByRole('button', { name: /Focus on Stage 1: Core Foundations/i });
      expect(stage1Button).toBeInTheDocument();
      fireEvent.click(stage1Button);
    });
  });

  describe('2. Prerequisite Gating & Meaningful Dependencies', () => {
    it('ensures locked status when upstream prerequisites are not completed', () => {
      const { roadmap } = recalculateRoadmapState(sampleCareerRoadmap);

      const nodeFoundations = roadmap.milestones.find((m) => m.id === 'ms-foundations-1')!;
      const nodeConsensus = roadmap.milestones.find((m) => m.id === 'ms-consensus-2')!;
      const nodeCapstone = roadmap.milestones.find((m) => m.id === 'ms-capstone-4')!;

      // Foundations has 0 prerequisites, so it is available
      expect(nodeFoundations.status).toBe('available');

      // Consensus requires ms-foundations-1 (which is false), so it must be locked
      expect(nodeConsensus.status).toBe('locked');

      // Capstone requires both consensus and storage, so it must be locked
      expect(nodeCapstone.status).toBe('locked');
    });

    it('unlocks downstream skills to available when prerequisites are satisfied', () => {
      // Step 1: Complete the foundation milestone
      const updatedMilestones: RoadmapMilestone[] = sampleCareerRoadmap.milestones.map((m) =>
        m.id === 'ms-foundations-1' ? { ...m, isKnown: true } : m
      );

      const { roadmap } = recalculateRoadmapState({
        ...sampleCareerRoadmap,
        milestones: updatedMilestones,
      });

      const nodeFoundations = roadmap.milestones.find((m) => m.id === 'ms-foundations-1')!;
      const nodeConsensus = roadmap.milestones.find((m) => m.id === 'ms-consensus-2')!;
      const nodeStorage = roadmap.milestones.find((m) => m.id === 'ms-storage-3')!;
      const nodeCapstone = roadmap.milestones.find((m) => m.id === 'ms-capstone-4')!;

      expect(nodeFoundations.status).toBe('completed');
      expect(nodeConsensus.status).toBe('available');
      expect(nodeStorage.status).toBe('available');
      // Capstone is still locked because neither consensus nor storage is known
      expect(nodeCapstone.status).toBe('locked');
    });

    it('preserves in_progress status when prerequisites remain satisfied', () => {
      const updatedMilestones: RoadmapMilestone[] = sampleCareerRoadmap.milestones.map((m) => {
        if (m.id === 'ms-foundations-1') return { ...m, isKnown: true };
        if (m.id === 'ms-consensus-2') return { ...m, status: 'in_progress' };
        return m;
      });

      const { roadmap } = recalculateRoadmapState({
        ...sampleCareerRoadmap,
        milestones: updatedMilestones,
      });

      const nodeConsensus = roadmap.milestones.find((m) => m.id === 'ms-consensus-2')!;
      expect(nodeConsensus.status).toBe('in_progress');
    });
  });

  describe('3. Redesigned MilestoneNode UI and Status Indicators', () => {
    it('renders stage header, category icon, and In Progress status correctly', () => {
      const inProgressMilestone: RoadmapMilestone = {
        ...sampleCareerRoadmap.milestones[0],
        status: 'in_progress',
      };

      const nodeProps: any = {
        id: 'ms-in-progress',
        data: {
          milestone: inProgressMilestone,
          phaseTitle: 'Stage 1: Core Foundations',
          stageOrder: 1,
        },
      };

      renderWithFlow(<MilestoneNode {...nodeProps} />);

      expect(screen.getByText('Stage 1: Core Foundations')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('foundation')).toBeInTheDocument();
      expect(screen.getByText(/20 hrs/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Actor Runtime/i)).toBeInTheDocument();
      expect(screen.getByText('Root Foundation')).toBeInTheDocument();
    });

    it('renders prerequisite requirement count in card footer for multi-prerequisite nodes', () => {
      const lockedCapstone = sampleCareerRoadmap.milestones.find((m) => m.id === 'ms-capstone-4')!;

      const nodeProps: any = {
        id: 'ms-capstone-4',
        data: {
          milestone: lockedCapstone,
          phaseTitle: 'Stage 3: Capstone Systems',
          stageOrder: 3,
        },
      };

      renderWithFlow(<MilestoneNode {...nodeProps} />);

      expect(screen.getByText('Stage 3: Capstone Systems')).toBeInTheDocument();
      expect(screen.getByText('Locked')).toBeInTheDocument();
      expect(screen.getByText('2 prereqs')).toBeInTheDocument();
      expect(screen.getByText(/45 hrs/i)).toBeInTheDocument();
    });
  });

  describe('4. Edge Routing and Graph Spacing', () => {
    it('generates smoothstep edges with rounded corners and dynamic status styling', () => {
      const layout = getLayoutedRoadmap(sampleCareerRoadmap, { direction: 'TB' });

      expect(layout.edges.length).toBeGreaterThan(0);
      layout.edges.forEach((edge) => {
        expect(edge.type).toBe('smoothstep');
        expect((edge as any).pathOptions?.borderRadius).toBe(16);
        expect(edge.markerEnd).toBeDefined();
      });

      // Initially, edge from ms-foundations-1 to ms-consensus-2 points to a locked node
      const lockedEdge = layout.edges.find((e) => e.target === 'ms-consensus-2');
      expect(lockedEdge?.style?.stroke).toBe('#334155');
    });

    it('updates edge styling to cyan/animated when target becomes available or in-progress', () => {
      // Mark foundations as known
      const modified: CareerRoadmap = {
        ...sampleCareerRoadmap,
        milestones: sampleCareerRoadmap.milestones.map((m) =>
          m.id === 'ms-foundations-1' ? { ...m, isKnown: true } : m
        ),
      };

      const { roadmap } = recalculateRoadmapState(modified);
      const layout = getLayoutedRoadmap(roadmap, { direction: 'TB' });

      const readyEdge = layout.edges.find((e) => e.target === 'ms-consensus-2');
      expect(readyEdge?.animated).toBe(true);
      expect(readyEdge?.style?.stroke).toBe('#06b6d4'); // cyan
    });
  });
});
