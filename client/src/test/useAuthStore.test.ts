import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';

describe('useAuthStore Zustand Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isAuthModalOpen: false,
      authModalMode: 'login',
      savedRoadmaps: [],
      isSavingToCloud: false,
      lastSavedAt: null,
    });
    vi.restoreAllMocks();
  });

  it('initializes with unauthenticated defaults', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.savedRoadmaps).toEqual([]);
  });

  it('opens and closes auth modal with specific mode', () => {
    useAuthStore.getState().openAuthModal('register');
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().authModalMode).toBe('register');

    useAuthStore.getState().closeAuthModal();
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  const mockFetchResponse = (body: any, ok = true, status = 200) => {
    const jsonStr = typeof body === 'string' ? body : JSON.stringify(body);
    return {
      ok,
      status,
      headers: { get: () => 'application/json' },
      text: async () => jsonStr,
      json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
    } as any;
  };

  it('successfully registers and sets user and token in state and localStorage', async () => {
    const mockUser = { id: 'u-123', email: 'ada@example.com', name: 'Ada Lovelace' };
    const mockToken = 'mock-jwt-token-string';

    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        token: mockToken,
        user: mockUser,
      })
    );

    const success = await useAuthStore.getState().register('Ada Lovelace', 'ada@example.com', 'SecurePass123!');

    expect(success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe(mockToken);
    expect(localStorage.getItem('pathforge_auth_token')).toBe(mockToken);
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  it('handles registration failure gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse(
        {
          success: false,
          error: 'An account with this email address already exists.',
        },
        false,
        409
      )
    );

    const success = await useAuthStore.getState().register('Duplicate', 'existing@example.com', 'Pass123456!');

    expect(success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().error).toBe('An account with this email address already exists.');
  });

  it('successfully logs in and fetches saved roadmaps', async () => {
    const mockUser = { id: 'u-456', email: 'dev@pathforge.ai', name: 'Lead Dev' };
    const mockToken = 'mock-jwt-login-token';

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/auth/login')) {
        return Promise.resolve(
          mockFetchResponse({
            success: true,
            token: mockToken,
            user: mockUser,
          })
        );
      }
      if (url.includes('/api/v1/roadmaps/my')) {
        return Promise.resolve(
          mockFetchResponse({
            success: true,
            data: [
              {
                _id: 'mongo-id-1',
                roadmapId: 'rm-101',
                targetRole: 'AI Engineer',
                targetCompanyType: 'Tech',
                experienceLevel: 'Advanced',
                updatedAt: new Date().toISOString(),
              },
            ],
          })
        );
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const success = await useAuthStore.getState().login('dev@pathforge.ai', 'Password123!');

    expect(success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(localStorage.getItem('pathforge_auth_token')).toBe(mockToken);
  });

  it('logs out and clears token from state and localStorage', () => {
    localStorage.setItem('pathforge_auth_token', 'token-to-be-removed');
    useAuthStore.setState({
      user: { id: 'u-1', email: 'test@example.com', name: 'User' },
      token: 'token-to-be-removed',
      isAuthenticated: true,
      savedRoadmaps: [{ roadmapId: 'rm-1', targetRole: 'Dev', targetCompanyType: 'Tech', experienceLevel: 'Mid', updatedAt: '' }],
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().savedRoadmaps).toEqual([]);
    expect(localStorage.getItem('pathforge_auth_token')).toBeNull();
  });

  it('requires authentication before saving roadmap to cloud', async () => {
    const mockRoadmap = {
      id: 'rm-test',
      targetRole: 'Test Engineer',
      targetCompanyType: 'Tech',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 10,
      totalEstimatedWeeks: 8,
      source: 'live_ai',
      phases: [],
      intermediateRoles: [],
      milestones: [],
      edges: [],
    } as any;

    const saved = await useAuthStore.getState().saveRoadmapToCloud(mockRoadmap);

    expect(saved).toBe(false);
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().error).toContain('Please log in');
  });

  it('saves roadmap to cloud when authenticated', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: 'valid-test-token',
      user: { id: 'u-1', email: 'dev@test.com', name: 'Dev' },
    });

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/roadmaps/save')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Roadmap saved to cloud storage.',
          }),
        });
      }
      if (url.includes('/api/v1/roadmaps/my')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [],
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const mockRoadmap = {
      id: 'rm-test-cloud',
      targetRole: 'Cloud Architect',
      milestones: [],
    } as any;

    const saved = await useAuthStore.getState().saveRoadmapToCloud(mockRoadmap);

    expect(saved).toBe(true);
    expect(useAuthStore.getState().lastSavedAt).toBeTruthy();
    expect(useAuthStore.getState().isSavingToCloud).toBe(false);
  });
});
