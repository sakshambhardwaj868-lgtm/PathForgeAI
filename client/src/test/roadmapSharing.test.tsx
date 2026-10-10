import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useAuthStore } from '../store/useAuthStore';
import { SharedRoadmapHeader } from '../components/share/SharedRoadmapHeader';
import { SharedLinkErrorView } from '../components/share/SharedLinkErrorView';
import { NodeDetailPanel } from '../components/graph/NodeDetailPanel';
import { ShareModal } from '../components/share/ShareModal';
import { getClientOfflineFallback } from '../data/fallbackService';

describe('Phase 7 — Secure Shareable Roadmap Links (Frontend)', () => {
  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
    useRoadmapStore.setState({
      isReadOnly: false,
      sharedMetadata: null,
      shareError: null,
    });
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    vi.restoreAllMocks();
  });

  it('prevents progress mutations in store when isReadOnly is active', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);

    // Turn on read-only mode (simulating public shared link)
    useRoadmapStore.setState({ isReadOnly: true });

    const initialMilestones = useRoadmapStore.getState().roadmap!.milestones;
    const targetId = initialMilestones[0].id;
    const initialKnown = initialMilestones[0].isKnown;

    // Attempt to toggle
    useRoadmapStore.getState().toggleMilestoneKnown(targetId);
    expect(useRoadmapStore.getState().roadmap!.milestones[0].isKnown).toBe(initialKnown);

    // Attempt markAllCompleted
    useRoadmapStore.getState().markAllCompleted();
    expect(useRoadmapStore.getState().roadmap!.milestones[0].isKnown).toBe(initialKnown);

    // Attempt resetAllProgress
    useRoadmapStore.getState().resetAllProgress();
    expect(useRoadmapStore.getState().roadmap!.milestones[0].isKnown).toBe(initialKnown);
  });

  it('SharedRoadmapHeader displays owner name, read-only status, and Build Own Roadmap button', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);
    useRoadmapStore.setState({
      isReadOnly: true,
      sharedMetadata: {
        ownerName: 'Sarah Connor',
        createdAt: new Date().toISOString(),
        expiresAt: null,
        label: 'Cybernetics Roadmap',
      },
    });

    render(<SharedRoadmapHeader />);

    expect(screen.getByText(/Shared View • Read-Only/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Connor/i)).toBeInTheDocument();
    expect(screen.getByText(/Build Your Own Roadmap/i)).toBeInTheDocument();
  });

  it('SharedLinkErrorView displays error message and return button', () => {
    render(<SharedLinkErrorView message="This roadmap share link has expired." />);

    expect(screen.getByText(/Share Link Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/This roadmap share link has expired/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore PathForge AI Interactive Builder/i)).toBeInTheDocument();
  });

  it('NodeDetailPanel displays Read-Only badge and disables milestone modification in shared mode', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);
    useRoadmapStore.setState({
      isReadOnly: true,
      selectedMilestoneId: fallback.milestones[0].id,
    });

    render(<NodeDetailPanel />);

    // In read-only mode, the "Mark as Known" button is replaced by "Read-Only Link"
    expect(screen.getByText(/Read-Only Link/i)).toBeInTheDocument();
    expect(screen.queryByText(/Mark as Known/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mark as Incomplete/i)).not.toBeInTheDocument();
  });

  it('ShareModal displays authentication prompt when user is not logged in', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);

    render(<ShareModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Sign in to Generate Share Links/i)).toBeInTheDocument();
    expect(screen.getByText(/Log In or Create Account/i)).toBeInTheDocument();
  });

  it('ShareModal renders share creation controls when user is authenticated', async () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: 'usr-1', email: 'test@example.com', name: 'Tester' },
      token: 'mock-jwt-token',
    });

    // Mock fetch for listing existing shares
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ success: true, count: 0, data: [] }),
    } as any);

    render(<ShareModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Link Purpose or Label/i)).toBeInTheDocument();
      expect(screen.getByText(/Expiration Duration/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Secure Share Link/i })).toBeInTheDocument();
    });
  });
});
