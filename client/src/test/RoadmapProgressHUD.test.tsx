import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoadmapProgressHUD } from '../components/graph/RoadmapProgressHUD';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap } from '../types/roadmap';

describe('RoadmapProgressHUD Component (Phase 5)', () => {
  const sampleRoadmap: CareerRoadmap = {
    id: 'hud-test',
    targetRole: 'Staff Climate Engineer',
    targetCompanyType: 'Clean Energy',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 8,
    source: 'live_ai',
    phases: [],
    intermediateRoles: [],
    milestones: [
      {
        id: 'ms-1',
        title: 'Geospatial Python',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 20,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          learningObjectives: [],
          weekendProject: { title: 'P1', description: 'D1', deliverables: [], estimatedHours: 10 },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
      {
        id: 'ms-2',
        title: 'Decarbonization Platform',
        category: 'core-skill',
        phaseId: 'p1',
        estimatedHours: 20,
        prerequisiteIds: ['ms-1'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: [],
          weekendProject: { title: 'P2', description: 'D2', deliverables: [], estimatedHours: 10 },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
    ],
    edges: [{ id: 'e1', source: 'ms-1', target: 'ms-2' }],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
  });

  it('renders nothing when no roadmap is loaded', () => {
    const { container } = render(<RoadmapProgressHUD />);
    expect(container.firstChild).toBeNull();
  });

  it('renders progress percentage, remaining hours, and remaining weeks', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);

    render(<RoadmapProgressHUD />);

    expect(screen.getByText('Roadmap Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/0 of 2 skills acquired/i)).toBeInTheDocument();
    expect(screen.getByText(/40 hrs/i)).toBeInTheDocument(); // 20h + 20h
    expect(screen.getByText(/2 wks/i)).toBeInTheDocument(); // 40h / 20h/wk
  });

  it('updates dynamically when a milestone is toggled to known', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');

    render(<RoadmapProgressHUD />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 skills acquired/i)).toBeInTheDocument();
    expect(screen.getByText(/20 hrs/i)).toBeInTheDocument(); // 20h remaining
    expect(screen.getByText(/1 wks/i)).toBeInTheDocument(); // 1 wk remaining
  });

  it('renders prerequisite gap warning banner when downstream milestone is completed out of order', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    // Mark downstream ms-2 as known without completing ms-1
    useRoadmapStore.getState().toggleMilestoneKnown('ms-2');

    render(<RoadmapProgressHUD />);

    expect(screen.getByText(/Prerequisite Gap \(1\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed work is preserved/i)).toBeInTheDocument();
  });

  it('reset button clears all progress and resets timeline', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');

    render(<RoadmapProgressHUD />);

    // Click reset button
    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/0 of 2 skills acquired/i)).toBeInTheDocument();
    expect(screen.getByText(/40 hrs/i)).toBeInTheDocument();
  });

  it('displays completion celebration banner when 100% complete', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');
    useRoadmapStore.getState().toggleMilestoneKnown('ms-2');

    render(<RoadmapProgressHUD />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/All milestones completed! You are production-ready/i)).toBeInTheDocument();
  });
});
