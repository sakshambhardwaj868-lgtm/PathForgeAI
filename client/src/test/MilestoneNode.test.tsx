import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MilestoneNode } from '../components/graph/MilestoneNode';
import { RoadmapMilestone } from '../types/roadmap';
import { Position, ReactFlowProvider } from '@xyflow/react';
import { useRoadmapStore } from '../store/useRoadmapStore';

describe('MilestoneNode Custom React Flow Node', () => {
  const baseMilestone: RoadmapMilestone = {
    id: 'ms-test-1',
    title: 'Distributed Consensus & Raft Protocol',
    category: 'core-skill',
    phaseId: 'p1',
    estimatedHours: 35,
    prerequisiteIds: ['ms-prev'],
    status: 'available',
    isKnown: false,
    actionableData: {
      learningObjectives: ['Understand Raft election'],
      weekendProject: {
        title: 'Mini-Raft Leader Election',
        description: 'Simulate heartbeats',
        deliverables: ['Election test suite'],
        estimatedHours: 14,
      },
      curatedResources: [],
      interviewChallenges: [],
    },
  };

  const renderWithFlow = (component: React.ReactElement) =>
    render(<ReactFlowProvider>{component}</ReactFlowProvider>);

  it('renders milestone title, category, hours, and weekend project preview', () => {
    const nodeProps: any = {
      id: 'ms-test-1',
      data: {
        milestone: baseMilestone,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      },
    };

    renderWithFlow(<MilestoneNode {...nodeProps} />);

    expect(screen.getByText('Distributed Consensus & Raft Protocol')).toBeInTheDocument();
    expect(screen.getByText('core skill')).toBeInTheDocument();
    expect(screen.getByText(/35 hrs/i)).toBeInTheDocument();
    expect(screen.getByText(/Mini-Raft Leader Election/i)).toBeInTheDocument();
    expect(screen.getByText('Ready to Learn')).toBeInTheDocument();
  });

  it('renders correct visual badge for completed status', () => {
    const completedMilestone: RoadmapMilestone = {
      ...baseMilestone,
      status: 'completed',
      isKnown: true,
    };

    const nodeProps: any = {
      id: 'ms-test-1',
      data: {
        milestone: completedMilestone,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      },
    };

    renderWithFlow(<MilestoneNode {...nodeProps} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders correct visual badge for locked status', () => {
    const lockedMilestone: RoadmapMilestone = {
      ...baseMilestone,
      status: 'locked',
    };

    const nodeProps: any = {
      id: 'ms-test-1',
      data: {
        milestone: lockedMilestone,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      },
    };

    renderWithFlow(<MilestoneNode {...nodeProps} />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('renders correct visual badge for completed_with_warning status', () => {
    const warningMilestone: RoadmapMilestone = {
      ...baseMilestone,
      status: 'completed_with_warning',
    };

    const nodeProps: any = {
      id: 'ms-test-1',
      data: {
        milestone: warningMilestone,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      },
    };

    renderWithFlow(<MilestoneNode {...nodeProps} />);
    expect(screen.getByText('Gap Warning')).toBeInTheDocument();
  });

  it('clicking the node selects it in useRoadmapStore', () => {
    const nodeProps: any = {
      id: 'ms-test-1',
      data: {
        milestone: baseMilestone,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      },
    };

    renderWithFlow(<MilestoneNode {...nodeProps} />);
    const nodeElement = screen.getByRole('button');
    fireEvent.click(nodeElement);

    expect(useRoadmapStore.getState().selectedMilestoneId).toBe('ms-test-1');
  });

  it('handles missing or malformed milestone data safely', () => {
    const brokenProps: any = {
      id: 'broken',
      data: {},
    };

    render(<MilestoneNode {...brokenProps} />);
    expect(screen.getByText('Invalid Node Data')).toBeInTheDocument();
  });
});
