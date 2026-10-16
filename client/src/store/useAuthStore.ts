import { create } from 'zustand';
import { CareerRoadmap } from '../types/roadmap';
import { safeFetchJson } from '../services/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SavedRoadmapSummary {
  _id?: string;
  roadmapId: string;
  targetRole: string;
  targetCompanyType: string;
  experienceLevel: string;
  weeklyCommitmentHours?: number;
  totalEstimatedWeeks?: number;
  source?: string;
  milestonesCount?: number;
  completedMilestonesCount?: number;
  completionPercentage?: number;
  createdAt?: string;
  updatedAt: string;
  milestones?: any[];
  metrics?: any;
}

interface AuthStoreState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  savedRoadmaps: SavedRoadmapSummary[];
  isFetchingRoadmaps: boolean;
  fetchRoadmapsError: string | null;
  isDeletingRoadmapId: string | null;
  deleteError: string | null;
  isSavingToCloud: boolean;
  lastSavedAt: string | null;
  lastSavedRoadmapId: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  saveRoadmapToCloud: (roadmap: CareerRoadmap) => Promise<boolean>;
  fetchSavedRoadmaps: () => Promise<void>;
  fetchRoadmapById: (id: string) => Promise<CareerRoadmap | null>;
  deleteSavedRoadmap: (id: string) => Promise<boolean>;
  clearError: () => void;
}

const TOKEN_KEY = 'pathforge_auth_token';

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  savedRoadmaps: [],
  isFetchingRoadmaps: false,
  fetchRoadmapsError: null,
  isDeletingRoadmapId: null,
  deleteError: null,
  isSavingToCloud: false,
  lastSavedAt: null,
  lastSavedRoadmapId: null,

  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  register: async (name: string, email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    const result = await safeFetchJson<any>('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!result.ok || !result.data?.success) {
      const errorMsg =
        result.error ||
        result.data?.error ||
        'Registration failed. Please check your details.';
      set({ isLoading: false, error: errorMsg });
      return false;
    }

    const { token, user } = result.data;
    localStorage.setItem(TOKEN_KEY, token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isAuthModalOpen: false,
    });

    get().fetchSavedRoadmaps();
    return true;
  },

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    const result = await safeFetchJson<any>('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!result.ok || !result.data?.success) {
      const errorMsg =
        result.error || result.data?.error || 'Invalid email or password.';
      set({ isLoading: false, error: errorMsg });
      return false;
    }

    const { token, user } = result.data;
    localStorage.setItem(TOKEN_KEY, token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isAuthModalOpen: false,
    });

    get().fetchSavedRoadmaps();
    return true;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      savedRoadmaps: [],
      lastSavedAt: null,
      lastSavedRoadmapId: null,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const result = await safeFetchJson<any>('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.ok || !result.data?.success || !result.data?.user) {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
        return;
      }

      set({
        user: result.data.user,
        token,
        isAuthenticated: true,
      });
      get().fetchSavedRoadmaps();
    } catch {
      // In offline mode or network drop, reset gracefully
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  saveRoadmapToCloud: async (roadmap: CareerRoadmap): Promise<boolean> => {
    const { token, isAuthenticated } = get();
    if (!isAuthenticated || !token) {
      set({ error: 'Please log in to save roadmaps to MongoDB Atlas cloud.' });
      get().openAuthModal('login');
      return false;
    }

    set({ isSavingToCloud: true });
    try {
      const result = await safeFetchJson<any>('/api/v1/roadmaps/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roadmap),
      });

      if (!result.ok || !result.data?.success) {
        set({
          isSavingToCloud: false,
          error: result.error || result.data?.error || 'Failed to save roadmap to cloud.',
        });
        return false;
      }

      const savedDoc = result.data?.data;
      const persistedId = savedDoc?.roadmapId || savedDoc?.id || savedDoc?._id;

      set({
        isSavingToCloud: false,
        lastSavedAt: new Date().toLocaleTimeString(),
        lastSavedRoadmapId: persistedId || null,
      });

      // Refresh saved roadmaps list
      get().fetchSavedRoadmaps();
      return true;
    } catch (err: any) {
      set({
        isSavingToCloud: false,
        error: err.message || 'Network error while persisting roadmap.',
      });
      return false;
    }
  },

  fetchSavedRoadmaps: async () => {
    const { token, isAuthenticated } = get();
    if (!isAuthenticated || !token) {
      set({ isFetchingRoadmaps: false });
      return;
    }

    set({ isFetchingRoadmaps: true, fetchRoadmapsError: null });

    try {
      const result = await safeFetchJson<any>('/api/v1/roadmaps/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.ok && result.data?.success && Array.isArray(result.data.data)) {
        const summaries: SavedRoadmapSummary[] = result.data.data.map((item: any) => {
          const milestones = Array.isArray(item.milestones) ? item.milestones : [];
          const totalMilestones = milestones.length;
          const completedCount = milestones.filter(
            (m: any) => m.isKnown || m.status === 'completed'
          ).length;
          const completionPercentage =
            totalMilestones > 0
              ? Math.round((completedCount / totalMilestones) * 100)
              : item.metrics?.completionPercentage || 0;

          return {
            _id: item._id,
            roadmapId: item.roadmapId,
            targetRole: item.targetRole,
            targetCompanyType: item.targetCompanyType,
            experienceLevel: item.experienceLevel,
            weeklyCommitmentHours: item.weeklyCommitmentHours,
            totalEstimatedWeeks: item.totalEstimatedWeeks,
            source: item.source,
            milestonesCount: totalMilestones,
            completedMilestonesCount: completedCount,
            completionPercentage,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            milestones: item.milestones,
            metrics: item.metrics,
          };
        });
        set({ savedRoadmaps: summaries, isFetchingRoadmaps: false, fetchRoadmapsError: null });
      } else {
        const errorMsg =
          result.error || result.data?.error || 'Failed to fetch saved roadmaps from cloud.';
        set({ isFetchingRoadmaps: false, fetchRoadmapsError: errorMsg });
      }
    } catch (err: any) {
      console.warn('Failed to fetch saved roadmaps from cloud:', err);
      set({
        isFetchingRoadmaps: false,
        fetchRoadmapsError: err.message || 'Network error fetching saved roadmaps.',
      });
    }
  },

  fetchRoadmapById: async (id: string): Promise<CareerRoadmap | null> => {
    const { token, isAuthenticated } = get();
    if (!isAuthenticated || !token) return null;

    try {
      const result = await safeFetchJson<any>(`/api/v1/roadmaps/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.ok && result.data?.success && result.data.data) {
        const raw = result.data.data;
        const normalizedRoadmap: CareerRoadmap = {
          ...raw,
          id: raw.id || raw.roadmapId || raw._id,
        };
        return normalizedRoadmap;
      }
      return null;
    } catch {
      return null;
    }
  },

  deleteSavedRoadmap: async (id: string): Promise<boolean> => {
    const { token, isAuthenticated } = get();
    if (!isAuthenticated || !token) return false;

    set({ isDeletingRoadmapId: id, deleteError: null });

    try {
      const result = await safeFetchJson<any>(`/api/v1/roadmaps/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.ok && result.data?.success) {
        set({ isDeletingRoadmapId: null, deleteError: null });
        await get().fetchSavedRoadmaps();
        return true;
      }

      const errorMsg =
        result.error || result.data?.error || 'Failed to delete roadmap from cloud storage.';
      set({ isDeletingRoadmapId: null, deleteError: errorMsg });
      return false;
    } catch (err: any) {
      set({
        isDeletingRoadmapId: null,
        deleteError: err.message || 'Network error while deleting roadmap.',
      });
      return false;
    }
  },
}));
