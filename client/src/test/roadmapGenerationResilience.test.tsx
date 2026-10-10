import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { ErrorState } from '../components/common/ErrorState';

describe('Roadmap Generation Resilience & Offline Fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useRoadmapStore.getState().clearRoadmap();
  });

  it('prevents "Unexpected end of JSON input" on empty response and sets informative error', async () => {
    // Mock fetch returning empty response body
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      text: async () => '',
    } as any);

    const success = await useRoadmapStore.getState().generateRoadmap({
      targetRole: 'Full Stack Engineer',
      targetCompanyType: 'Tech',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });

    expect(success).toBe(false);
    const storeState = useRoadmapStore.getState();
    expect(storeState.error).toBeTruthy();
    expect(storeState.error).not.toContain('Unexpected end of JSON input');
    expect(storeState.error).toContain('empty response body');
  });

  it('loads verified offline fallback instantly without making network requests', () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    // Call loadOfflineFallback
    useRoadmapStore.getState().loadOfflineFallback('Full Stack Developer at a Climate Tech Startup');

    const state = useRoadmapStore.getState();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(state.roadmap).not.toBeNull();
    expect(state.roadmap?.source).toBe('cached_fallback');
    expect(state.roadmap?.targetRole).toContain('Climate Tech');
    expect(state.nodes.length).toBeGreaterThan(0);
    expect(state.edges.length).toBeGreaterThan(0);
    expect(state.metrics.totalMilestones).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });

  it('recovers from error state when user clicks "Load Verified Offline Fallback"', () => {
    useRoadmapStore.setState({
      error: 'Server responded with HTTP 500 but returned an empty response body.',
      roadmap: null,
    });

    render(
      <ErrorState message="Server responded with HTTP 500 but returned an empty response body." />
    );

    const fallbackBtn = screen.getByRole('button', { name: /Load Verified Offline Fallback/i });
    expect(fallbackBtn).toBeInTheDocument();

    fireEvent.click(fallbackBtn);

    const state = useRoadmapStore.getState();
    expect(state.roadmap).not.toBeNull();
    expect(state.nodes.length).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });
});
