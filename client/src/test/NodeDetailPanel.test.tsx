import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NodeDetailPanel } from '../components/graph/NodeDetailPanel';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap } from '../types/roadmap';

describe('NodeDetailPanel Milestone Detail Drawer (Phase 4)', () => {
  const sampleRoadmap: CareerRoadmap = {
    id: 'inspector-test-p4',
    targetRole: 'Staff Climate Engineer',
    targetCompanyType: 'Clean Energy Venture',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 12,
    source: 'live_ai',
    phases: [
      { id: 'p1', title: 'Phase 1: Foundations', description: 'Domain basics', order: 1 },
      { id: 'p2', title: 'Phase 2: Core Platform', description: 'Platform scale', order: 2 },
    ],
    intermediateRoles: [],
    milestones: [
      {
        id: 'ms-root',
        title: 'Python for Carbon Accounting & GHG Protocol',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 25,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          learningObjectives: [
            'Master Scope 1, 2, and 3 GHG Protocol accounting standards',
            'Perform vectorized emissions factor lookups with Pandas',
          ],
          weekendProject: {
            title: 'Automated Scope 1-3 Carbon Footprint Engine',
            description: 'Build a production-grade emissions ingestion engine with CSV parsing.',
            deliverables: [
              'CLI tool parsing facility utility bills',
              'FastAPI calculation service with automated unit tests',
              'JSON emission report generator compliant with ISO 14064',
            ],
            estimatedHours: 14,
          },
          curatedResources: [
            {
              title: 'Official GHG Protocol Guidance',
              type: 'documentation',
              searchQueryOrUrl: 'https://docs.python.org/3/library/csv.html',
              description: 'Python Standard CSV Library documentation for parsing utility ledgers',
            },
            {
              title: 'OpenGHG GitHub Repositories',
              type: 'github_search',
              searchQueryOrUrl: 'https://github.com/search?q=topic%3Acarbon-accounting',
              description: 'Curated open-source GHG accounting reference implementations',
            },
          ],
          interviewChallenges: [
            {
              question: 'How do Scope 2 location-based vs market-based emissions methodologies differ?',
              idealAnswerKey: 'Location-based method calculates emissions using grid average emission intensity, whereas market-based reflects emissions from contractual supplier choices such as Power Purchase Agreements (PPAs) and Guarantees of Origin.',
              difficulty: 'Medium',
            },
          ],
        },
      },
      {
        id: 'ms-downstream',
        title: 'Geospatial Grid Topology & Decarbonization Engine',
        category: 'core-skill',
        phaseId: 'p2',
        estimatedHours: 35,
        prerequisiteIds: ['ms-root'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          learningObjectives: ['PostGIS queries', 'Grid balance simulation'],
          weekendProject: {
            title: 'Sub-station Power Dispatcher',
            description: 'Simulates grid dispatch',
            deliverables: ['Grid simulation script'],
            estimatedHours: 15,
          },
          curatedResources: [],
          interviewChallenges: [],
        },
      },
    ],
    edges: [{ id: 'e-root-down', source: 'ms-root', target: 'ms-downstream' }],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
  });

  it('renders nothing when no milestone is selected', () => {
    const { container } = render(<NodeDetailPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('opens and renders milestone title, phase, category, and hours when selected', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Python for Carbon Accounting & GHG Protocol')).toBeInTheDocument();
    expect(screen.getByText('foundation')).toBeInTheDocument();
    expect(screen.getByText('Phase 1: Foundations')).toBeInTheDocument();
    expect(screen.getByText(/25 hrs/i)).toBeInTheDocument();
    expect(screen.getByText('Ready to Learn')).toBeInTheDocument();
  });

  it('closes the drawer when close button is clicked', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    const closeBtn = screen.getByLabelText('Close milestone drawer');
    fireEvent.click(closeBtn);

    expect(useRoadmapStore.getState().selectedMilestoneId).toBeNull();
  });

  it('closes the drawer when Escape key is pressed (accessible keyboard behavior)', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(useRoadmapStore.getState().selectedMilestoneId).toBeNull();
  });

  it('switches milestone data when selecting another milestone in the graph', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    const { rerender } = render(<NodeDetailPanel />);
    expect(screen.getByText('Python for Carbon Accounting & GHG Protocol')).toBeInTheDocument();

    // Select downstream milestone
    act(() => {
      useRoadmapStore.getState().selectMilestone('ms-downstream');
    });
    rerender(<NodeDetailPanel />);

    expect(screen.getByText('Geospatial Grid Topology & Decarbonization Engine')).toBeInTheDocument();
    expect(screen.getByText('core skill')).toBeInTheDocument();
    expect(screen.getByText('Phase 2: Core Platform')).toBeInTheDocument();
  });

  it('displays actionable weekend project with step-by-step checklist items', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    // Project metadata
    expect(screen.getByText('Automated Scope 1-3 Carbon Footprint Engine')).toBeInTheDocument();
    expect(screen.getByText(/~14 hrs effort/i)).toBeInTheDocument();
    expect(screen.getByText(/Build a production-grade emissions ingestion engine/i)).toBeInTheDocument();

    // Deliverables list
    const delivItem = screen.getByText('CLI tool parsing facility utility bills');
    expect(delivItem).toBeInTheDocument();
    expect(screen.getByText('FastAPI calculation service with automated unit tests')).toBeInTheDocument();

    // Toggle deliverable checkbox
    fireEvent.click(delivItem);
    // After clicking, deliverable parent receives completed line-through styling
    expect(delivItem.closest('.line-through')).toBeInTheDocument();
  });

  it('displays curated resources with safety labels and verified badges', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    // Verified official link
    expect(screen.getByText('Official GHG Protocol Guidance')).toBeInTheDocument();
    expect(screen.getByText('Official Documentation')).toBeInTheDocument();

    // Curated search query
    expect(screen.getByText('OpenGHG GitHub Repositories')).toBeInTheDocument();
    expect(screen.getByText('Curated GitHub Query')).toBeInTheDocument();
  });

  it('displays interview prep questions and toggles model evaluation rubric', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-root');

    render(<NodeDetailPanel />);

    expect(screen.getByText(/How do Scope 2 location-based vs market-based/i)).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();

    // Rubric is initially collapsed
    expect(screen.queryByText(/Power Purchase Agreements/i)).not.toBeInTheDocument();

    // Reveal button click
    const toggleBtn = screen.getByText('Reveal Model Answer & Rubric');
    fireEvent.click(toggleBtn);

    // Rubric is now visible
    expect(screen.getByText(/Power Purchase Agreements/i)).toBeInTheDocument();
    expect(screen.getByText('Hide Evaluation Answer')).toBeInTheDocument();
  });

  it('gracefully handles missing optional content in milestones', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-downstream');

    render(<NodeDetailPanel />);

    // When resources array is empty
    expect(screen.getByText(/No specific resources declared for this node/i)).toBeInTheDocument();

    // When interview challenges array is empty
    expect(screen.getByText(/No interview challenges for this foundational node/i)).toBeInTheDocument();
  });

  it('allows clicking a prerequisite to navigate directly to it', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-downstream');

    render(<NodeDetailPanel />);

    // Downstream milestone lists ms-root as a prerequisite
    const prereqLink = screen.getByText('Python for Carbon Accounting & GHG Protocol');
    fireEvent.click(prereqLink);

    expect(useRoadmapStore.getState().selectedMilestoneId).toBe('ms-root');
  });
});
