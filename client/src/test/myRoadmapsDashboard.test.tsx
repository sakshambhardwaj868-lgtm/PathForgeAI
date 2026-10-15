import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyRoadmapsDashboard } from '../components/dashboard/MyRoadmapsDashboard';
import { RoadmapPromptBar } from '../components/common/RoadmapPromptBar';
import { useAuthStore, SavedRoadmapSummary } from '../store/useAuthStore';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap } from '../types/roadmap';

describe('Phase 10 — My Roadmaps Dashboard Tests', () => {
  const sampleSavedSummaries: SavedRoadmapSummary[] = [
    {
      _id: 'db-id-1',
      roadmapId: 'rm-101',
      targetRole: 'Full Stack Climate Tech Engineer',
      targetCompanyType: 'Clean Energy Series-A',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
      totalEstimatedWeeks: 12,
      source: 'live_ai',
      milestonesCount: 10,
      completedMilestonesCount: 4,
      completionPercentage: 40,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-12T15:30:00.000Z',
    },
    {
      _id: 'db-id-2',
      roadmapId: 'rm-102',
      targetRole: 'Autonomous AI Systems Architect',
      targetCompanyType: 'AI Robotics Foundry',
      experienceLevel: 'Advanced',
      weeklyCommitmentHours: 25,
      totalEstimatedWeeks: 16,
      source: 'live_ai',
      milestonesCount: 8,
      completedMilestonesCount: 8,
      completionPercentage: 100,
      createdAt: '2026-10-11T09:00:00.000Z',
      updatedAt: '2026-10-15T18:00:00.000Z',
    },
  ];

  const sampleFullRoadmap: CareerRoadmap = {
    id: 'rm-101',
    targetRole: 'Full Stack Climate Tech Engineer',
    targetCompanyType: 'Clean Energy Series-A',
    experienceLevel: 'Beginner',
    weeklyCommitmentHours: 15,
    totalEstimatedWeeks: 12,
    source: 'live_ai',
    phases: [{ id: 'p1', title: 'Phase 1', description: 'Foundations', order: 1 }],
    intermediateRoles: [],
    milestones: [
      {
        id: 'ms-1',
        title: 'Carbon Ledger Modeling',
        category: 'core-skill',
        phaseId: 'p1',
        estimatedHours: 20,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          whyItMatters: 'Foundational accounting.',
          difficultyLevel: 'Beginner',
          learningObjectives: [],
          learningOutcomes: [],
          topics: [],
          lessons: [],
          practicalExercises: [],
          curatedResources: [],
          interviewChallenges: [],
          quizQuestions: [],
          completionCriteria: [],
          weekendProject: {
            title: 'Ledger Prototype',
            description: 'Build basic ledger.',
            deliverables: ['GitHub repo'],
            estimatedHours: 6,
          },
        },
      },
    ],
    edges: [],
    createdAt: '2026-10-10T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: { id: 'u-1', email: 'alex@example.com', name: 'Alex' },
      isAuthenticated: true,
      token: 'jwt-test-token',
      savedRoadmaps: sampleSavedSummaries,
      isFetchingRoadmaps: false,
      fetchRoadmapsError: null,
      isDeletingRoadmapId: null,
      deleteError: null,
    });

    useRoadmapStore.setState({
      roadmap: null,
      currentView: 'dashboard',
      isLoading: false,
      error: null,
    });
  });

  it('renders unauthenticated state when user is not signed in', () => {
    useAuthStore.setState({ isAuthenticated: false, user: null, token: null });

    render(<MyRoadmapsDashboard />);

    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in or create a free PathForge AI account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Your Account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Career Search/i })).toBeInTheDocument();
  });

  it('renders empty state when authenticated user has no saved roadmaps', () => {
    useAuthStore.setState({ savedRoadmaps: [], isFetchingRoadmaps: false, fetchSavedRoadmaps: vi.fn() });

    render(<MyRoadmapsDashboard />);

    expect(screen.getByText(/No Saved Roadmaps Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/You haven't saved any career roadmaps to your cloud account yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Career Search/i })).toBeInTheDocument();
  });

  it('renders loading skeleton when isFetchingRoadmaps is true with empty list', () => {
    useAuthStore.setState({ savedRoadmaps: [], isFetchingRoadmaps: true, fetchSavedRoadmaps: vi.fn() });

    render(<MyRoadmapsDashboard />);

    expect(screen.getByTestId('dashboard-loading-skeleton')).toBeInTheDocument();
  });

  it('renders error banner with Retry button when fetchRoadmapsError is present', () => {
    const fetchSpy = vi.fn();
    useAuthStore.setState({
      savedRoadmaps: [],
      fetchRoadmapsError: 'MongoDB Atlas connection timeout.',
      fetchSavedRoadmaps: fetchSpy,
    });

    render(<MyRoadmapsDashboard />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/MongoDB Atlas connection timeout\./i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    expect(fetchSpy).toHaveBeenCalled();
  });

  it('renders saved roadmap cards with details, progress, and badges', () => {
    render(<MyRoadmapsDashboard />);

    // Titles
    expect(screen.getByText('Full Stack Climate Tech Engineer')).toBeInTheDocument();
    expect(screen.getByText('Autonomous AI Systems Architect')).toBeInTheDocument();

    // Companies
    expect(screen.getByText('Clean Energy Series-A')).toBeInTheDocument();
    expect(screen.getByText('AI Robotics Foundry')).toBeInTheDocument();

    // Progress metrics
    expect(screen.getByText('40% Complete')).toBeInTheDocument();
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
    expect(screen.getByText('4 of 10 milestones done')).toBeInTheDocument();
    expect(screen.getByText('8 of 8 milestones done')).toBeInTheDocument();

    // Badges (matching card badge)
    expect(screen.getAllByText('Beginner').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Advanced').length).toBeGreaterThanOrEqual(1);
  });

  it('opens a saved roadmap, loads full data into store, and switches view to graph', async () => {
    const fetchByIdSpy = vi.fn().mockResolvedValue(sampleFullRoadmap);
    useAuthStore.setState({ fetchRoadmapById: fetchByIdSpy });

    render(<MyRoadmapsDashboard />);

    const openBtn = screen.getByRole('button', { name: /Open Full Stack Climate Tech Engineer/i });
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(fetchByIdSpy).toHaveBeenCalledWith('rm-101');
      expect(useRoadmapStore.getState().roadmap?.id).toBe('rm-101');
      expect(useRoadmapStore.getState().currentView).toBe('graph');
    });
  });

  it('clicking delete opens confirmation modal with roadmap title and warning', () => {
    render(<MyRoadmapsDashboard />);

    const deleteBtn = screen.getByRole('button', { name: /Delete Full Stack Climate Tech Engineer/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/Delete Saved Roadmap\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to permanently delete/i)).toBeInTheDocument();
    expect(screen.getByText(/"Full Stack Climate Tech Engineer"/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Delete Roadmap$/i })).toBeInTheDocument();
  });

  it('canceling delete confirmation modal dismisses without deleting', () => {
    const deleteSpy = vi.fn();
    useAuthStore.setState({ deleteSavedRoadmap: deleteSpy });

    render(<MyRoadmapsDashboard />);

    const deleteBtn = screen.getByRole('button', { name: /Delete Full Stack Climate Tech Engineer/i });
    fireEvent.click(deleteBtn);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Delete Saved Roadmap\?/i)).not.toBeInTheDocument();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('confirming delete calls deleteSavedRoadmap with roadmapId', async () => {
    const deleteSpy = vi.fn().mockResolvedValue(true);
    useAuthStore.setState({ deleteSavedRoadmap: deleteSpy });

    render(<MyRoadmapsDashboard />);

    const deleteBtn = screen.getByRole('button', { name: /Delete Full Stack Climate Tech Engineer/i });
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /^Delete Roadmap$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('rm-101');
    });
  });

  it('filters saved roadmaps by search query', () => {
    render(<MyRoadmapsDashboard />);

    const searchInput = screen.getByPlaceholderText(/Filter saved roadmaps\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Autonomous' } });

    expect(screen.getByText('Autonomous AI Systems Architect')).toBeInTheDocument();
    expect(screen.queryByText('Full Stack Climate Tech Engineer')).not.toBeInTheDocument();
  });

  it('filters saved roadmaps by experience level', () => {
    render(<MyRoadmapsDashboard />);

    const levelSelect = screen.getByRole('combobox');
    fireEvent.change(levelSelect, { target: { value: 'Advanced' } });

    expect(screen.getByText('Autonomous AI Systems Architect')).toBeInTheDocument();
    expect(screen.queryByText('Full Stack Climate Tech Engineer')).not.toBeInTheDocument();
  });

  it('RoadmapPromptBar contains prominent My Roadmaps button that toggles dashboard view', () => {
    useRoadmapStore.setState({ currentView: 'graph' });

    render(<RoadmapPromptBar />);

    const myRoadmapsBtn = screen.getByRole('button', { name: /My Roadmaps/i });
    expect(myRoadmapsBtn).toBeInTheDocument();

    fireEvent.click(myRoadmapsBtn);

    expect(useRoadmapStore.getState().currentView).toBe('dashboard');
  });
});
