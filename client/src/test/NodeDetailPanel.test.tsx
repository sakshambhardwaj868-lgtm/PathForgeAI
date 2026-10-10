import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeDetailPanel } from '../components/graph/NodeDetailPanel';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap } from '../types/roadmap';

describe('NodeDetailPanel Side Inspector', () => {
  const sampleRoadmap: CareerRoadmap = {
    id: 'inspector-test',
    targetRole: 'Climate Tech Lead',
    targetCompanyType: 'Clean Energy',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 12,
    source: 'live_ai',
    phases: [],
    intermediateRoles: [],
    milestones: [
      {
        id: 'ms-root',
        title: 'Python for Carbon Accounting',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 20,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          learningObjectives: ['GHG Protocol calculation standards', 'Emission factor databases'],
          weekendProject: {
            title: 'Scope 1-3 Carbon Footprint Engine',
            description: 'Calculates corporate emissions',
            deliverables: ['CLI calculator', 'CSV export functionality'],
            estimatedHours: 12,
          },
          curatedResources: [
            {
              title: 'OpenGHG Repository',
              type: 'github_search',
              searchQueryOrUrl: 'https://github.com/search?q=topic%3Acarbon-accounting',
              description: 'Open source GHG data models',
            },
          ],
          interviewChallenges: [
            {
              question: 'How do Scope 2 location-based vs market-based emissions differ?',
              idealAnswerKey: 'Location-based uses average grid emission factor, whereas market-based reflects contractual instruments like RECs.',
              difficulty: 'Medium',
            },
          ],
        },
      },
    ],
    edges: [],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
  });

  it('renders nothing when no milestone is selected', () => {
    const { container } = render(<NodeDetailPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders complete milestone details when a milestone is selected', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    // Title & Category
    expect(screen.getByText('Python for Carbon Accounting')).toBeInTheDocument();
    expect(screen.getByText('foundation')).toBeInTheDocument();
    expect(screen.getByText(/20 hrs/i)).toBeInTheDocument();

    // Learning Objectives
    expect(screen.getByText('GHG Protocol calculation standards')).toBeInTheDocument();

    // Weekend Project
    expect(screen.getByText('Scope 1-3 Carbon Footprint Engine')).toBeInTheDocument();
    expect(screen.getByText('CLI calculator')).toBeInTheDocument();

    // Curated Resources
    expect(screen.getByText('OpenGHG Repository')).toBeInTheDocument();

    // Interview Challenge
    expect(screen.getByText(/How do Scope 2 location-based vs market-based emissions differ/i)).toBeInTheDocument();
  });

  it('reveals model evaluation answer key on user request', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    // Initially hidden
    expect(screen.queryByText(/Location-based uses average grid emission factor/i)).not.toBeInTheDocument();

    // Click reveal button
    const revealBtn = screen.getByText('Reveal Ideal Answer Key');
    fireEvent.click(revealBtn);

    // Now displayed
    expect(screen.getByText(/Location-based uses average grid emission factor/i)).toBeInTheDocument();
  });

  it('toggles known completion status when user clicks action button', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    const toggleBtn = screen.getByText('Mark as Known');
    fireEvent.click(toggleBtn);

    expect(useRoadmapStore.getState().roadmap?.milestones[0].isKnown).toBe(true);
  });
});
