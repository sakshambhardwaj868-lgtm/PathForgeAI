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
  updatedAt: string;
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
  isSavingToCloud: boolean;
  lastSavedAt: string | null;

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
  isSavingToCloud: false,
  lastSavedAt: null,

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
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
        return;
      }

      const data = await response.json();
      if (data.success && data.user) {
        set({
          user: data.user,
          token,
          isAuthenticated: true,
        });
        get().fetchSavedRoadmaps();
      } else {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch {
      // In offline mode or network drop, keep existing session or reset gracefully
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
      const response = await fetch('/api/v1/roadmaps/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roadmap),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        set({
          isSavingToCloud: false,
          error: data.error || 'Failed to save roadmap to cloud.',
        });
        return false;
      }

      set({
        isSavingToCloud: false,
        lastSavedAt: new Date().toLocaleTimeString(),
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
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch('/api/v1/roadmaps/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const summaries: SavedRoadmapSummary[] = data.data.map((item: any) => ({
          _id: item._id,
          roadmapId: item.roadmapId,
          targetRole: item.targetRole,
          targetCompanyType: item.targetCompanyType,
          experienceLevel: item.experienceLevel,
          updatedAt: item.updatedAt,
        }));
        set({ savedRoadmaps: summaries });
      }
    } catch (err) {
      console.warn('Failed to fetch saved roadmaps from cloud:', err);
    }
  },

  fetchRoadmapById: async (id: string): Promise<CareerRoadmap | null> => {
    const { token, isAuthenticated } = get();
    if (!isAuthenticated || !token) return null;

    try {
      const response = await fetch(`/api/v1/roadmaps/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.success && data.data) {
        return data.data as CareerRoadmap;
      }
      return null;
    } catch {
      return null;
    }
  },

  deleteSavedRoadmap: async (id: string): Promise<boolean> => {
    const { token, isAuthenticated } = get();
    if (!isAuthenticated || !token) return false;

    try {
      const response = await fetch(`/api/v1/roadmaps/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        get().fetchSavedRoadmaps();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
