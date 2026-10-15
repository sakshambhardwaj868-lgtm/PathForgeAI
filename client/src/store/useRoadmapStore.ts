import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import {
  CareerRoadmap,
  GenerateRoadmapRequest,
  RoadmapMilestone,
  ApiResponse,
  RoadmapProgressMetrics,
} from '../types/roadmap';
import { getLayoutedRoadmap } from '../utils/dagreLayout';
import { recalculateRoadmapState } from '../utils/replanEngine';
import { safeFetchJson } from '../services/apiClient';
import { getClientOfflineFallback } from '../data/fallbackService';
import { useAuthStore } from './useAuthStore';

const DEFAULT_METRICS: RoadmapProgressMetrics = {
  totalMilestones: 0,
  completedCount: 0,
  completionPercentage: 0,
  totalHours: 0,
  completedHours: 0,
  remainingHours: 0,
  totalWeeks: 0,
  remainingWeeks: 0,
  warningGapCount: 0,
};

const ACTIVE_ROADMAP_STORAGE_KEY = 'pathforge_active_roadmap';

function saveRoadmapToLocalStorage(roadmap: CareerRoadmap | null) {
  if (typeof window === 'undefined') return;
  try {
    if (roadmap) {
      localStorage.setItem(ACTIVE_ROADMAP_STORAGE_KEY, JSON.stringify(roadmap));
    } else {
      localStorage.removeItem(ACTIVE_ROADMAP_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to cache active roadmap in localStorage:', err);
  }
}

function loadInitialRoadmap(): CareerRoadmap | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_ROADMAP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached roadmap from localStorage:', err);
  }
  return null;
}

interface RoadmapStoreState {
  roadmap: CareerRoadmap | null;
  nodes: Node[];
  edges: Edge[];
  metrics: RoadmapProgressMetrics;
  selectedMilestoneId: string | null;
  layoutDirection: 'TB' | 'LR';
  isLoading: boolean;
  error: string | null;
  activeFilter: string; // 'all' or category
  isReadOnly: boolean;
  sharedMetadata: {
    ownerName: string;
    createdAt: string;
    expiresAt: string | null;
    label?: string;
  } | null;
  shareError: string | null;

  // Actions
  setRoadmap: (roadmap: CareerRoadmap) => void;
  setLayoutDirection: (direction: 'TB' | 'LR') => void;
  selectMilestone: (id: string | null) => void;
  setActiveFilter: (filter: string) => void;
  clearRoadmap: () => void;
  generateRoadmap: (input: GenerateRoadmapRequest) => Promise<boolean>;
  loadOfflineFallback: (targetRole?: string) => void;
  toggleMilestoneKnown: (milestoneId: string) => void;
  setWeeklyCommitmentHours: (hours: number) => void;
  resetAllProgress: () => void;
  markAllCompleted: () => void;
  loadSharedRoadmap: (token: string) => Promise<boolean>;
  exitSharedView: () => void;
}

const initialRoadmap = loadInitialRoadmap();
const initialRecalc = initialRoadmap ? recalculateRoadmapState(initialRoadmap) : null;
const initialGraph = initialRecalc
  ? getLayoutedRoadmap(initialRecalc.roadmap, { direction: 'TB' })
  : { nodes: [], edges: [] };

export const useRoadmapStore = create<RoadmapStoreState>((set, get) => ({
  roadmap: initialRecalc ? initialRecalc.roadmap : null,
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  metrics: initialRecalc ? initialRecalc.metrics : DEFAULT_METRICS,
  selectedMilestoneId: initialRecalc?.roadmap.milestones[0]?.id || null,
  layoutDirection: 'TB',
  isLoading: false,
  error: null,
  activeFilter: 'all',
  isReadOnly: false,
  sharedMetadata: null,
  shareError: null,

  setRoadmap: (rawRoadmap: CareerRoadmap) => {
    const { layoutDirection } = get();
    const { roadmap, metrics } = recalculateRoadmapState(rawRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(roadmap);

    set({
      roadmap,
      nodes,
      edges,
      metrics,
      selectedMilestoneId: roadmap.milestones[0]?.id || null,
      isReadOnly: false,
      sharedMetadata: null,
      shareError: null,
      error: null,
    });
  },

  setLayoutDirection: (direction: 'TB' | 'LR') => {
    const { roadmap } = get();
    if (!roadmap) {
      set({ layoutDirection: direction });
      return;
    }
    const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction });
    set({
      layoutDirection: direction,
      nodes,
      edges,
    });
  },

  selectMilestone: (id: string | null) => {
    set({ selectedMilestoneId: id });
  },

  setActiveFilter: (filter: string) => {
    set({ activeFilter: filter });
  },

  clearRoadmap: () => {
    saveRoadmapToLocalStorage(null);
    set({
      roadmap: null,
      nodes: [],
      edges: [],
      metrics: DEFAULT_METRICS,
      selectedMilestoneId: null,
      error: null,
    });
  },

  generateRoadmap: async (input: GenerateRoadmapRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });

    const fetchResult = await safeFetchJson<ApiResponse<CareerRoadmap>>(
      '/api/v1/roadmap/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }
    );

    if (!fetchResult.ok || !fetchResult.data?.success || !fetchResult.data?.data) {
      const errorMsg =
        fetchResult.error ||
        fetchResult.data?.error ||
        'Failed to generate career roadmap. Please check backend connection or load offline fallback.';
      set({ isLoading: false, error: errorMsg });
      return false;
    }

    const rawRoadmap = fetchResult.data.data;
    const { layoutDirection } = get();
    const { roadmap, metrics } = recalculateRoadmapState(rawRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(roadmap);

    set({
      roadmap,
      nodes,
      edges,
      metrics,
      selectedMilestoneId: roadmap.milestones[0]?.id || null,
      isLoading: false,
      error: null,
    });

    return true;
  },

  loadOfflineFallback: (targetRole?: string) => {
    const { layoutDirection, roadmap: currentRoadmap } = get();
    const role =
      targetRole ||
      currentRoadmap?.targetRole ||
      'Full Stack Developer at a Climate Tech Startup';
    const rawFallback = getClientOfflineFallback(
      role,
      currentRoadmap?.weeklyCommitmentHours || 15,
      currentRoadmap?.experienceLevel || 'Beginner'
    );

    const { roadmap, metrics } = recalculateRoadmapState(rawFallback);
    const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(roadmap);

    set({
      roadmap,
      nodes,
      edges,
      metrics,
      selectedMilestoneId: roadmap.milestones[0]?.id || null,
      isLoading: false,
      error: null,
    });
  },

  toggleMilestoneKnown: (milestoneId: string) => {
    const { roadmap, layoutDirection, isReadOnly } = get();
    if (!roadmap || isReadOnly) return;

    // 1. Invert isKnown for the target milestone
    const intermediateMilestones: RoadmapMilestone[] = roadmap.milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        isKnown: !m.isKnown,
      };
    });

    const modifiedRoadmap: CareerRoadmap = {
      ...roadmap,
      milestones: intermediateMilestones,
    };

    // 2. Perform topological recalculation with work preservation & gap detection
    const { roadmap: updatedRoadmap, metrics } = recalculateRoadmapState(modifiedRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(updatedRoadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(updatedRoadmap);

    set({
      roadmap: updatedRoadmap,
      nodes,
      edges,
      metrics,
    });

    // Background cloud sync if user is authenticated
    try {
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.token) {
        authState.saveRoadmapToCloud(updatedRoadmap).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  },

  setWeeklyCommitmentHours: (hours: number) => {
    const { roadmap, layoutDirection, isReadOnly } = get();
    if (!roadmap || isReadOnly || hours <= 0) return;

    const modifiedRoadmap: CareerRoadmap = {
      ...roadmap,
      weeklyCommitmentHours: hours,
    };

    const { roadmap: updatedRoadmap, metrics } = recalculateRoadmapState(modifiedRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(updatedRoadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(updatedRoadmap);

    set({
      roadmap: updatedRoadmap,
      nodes,
      edges,
      metrics,
    });

    try {
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.token) {
        authState.saveRoadmapToCloud(updatedRoadmap).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  },

  resetAllProgress: () => {
    const { roadmap, layoutDirection, isReadOnly } = get();
    if (!roadmap || isReadOnly) return;

    const clearedMilestones = roadmap.milestones.map((m) => ({
      ...m,
      isKnown: false,
    }));

    const modifiedRoadmap = { ...roadmap, milestones: clearedMilestones };
    const { roadmap: updatedRoadmap, metrics } = recalculateRoadmapState(modifiedRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(updatedRoadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(updatedRoadmap);

    set({
      roadmap: updatedRoadmap,
      nodes,
      edges,
      metrics,
    });

    try {
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.token) {
        authState.saveRoadmapToCloud(updatedRoadmap).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  },

  markAllCompleted: () => {
    const { roadmap, layoutDirection, isReadOnly } = get();
    if (!roadmap || isReadOnly) return;

    const completedMilestones = roadmap.milestones.map((m) => ({
      ...m,
      isKnown: true,
    }));

    const modifiedRoadmap = { ...roadmap, milestones: completedMilestones };
    const { roadmap: updatedRoadmap, metrics } = recalculateRoadmapState(modifiedRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(updatedRoadmap, { direction: layoutDirection });

    saveRoadmapToLocalStorage(updatedRoadmap);

    set({
      roadmap: updatedRoadmap,
      nodes,
      edges,
      metrics,
    });

    try {
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.token) {
        authState.saveRoadmapToCloud(updatedRoadmap).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  },

  loadSharedRoadmap: async (token: string): Promise<boolean> => {
    set({ isLoading: true, error: null, shareError: null });

    const fetchResult = await safeFetchJson<ApiResponse<{
      shareInfo: {
        label?: string;
        ownerName: string;
        createdAt: string;
        expiresAt: string | null;
      };
      roadmap: CareerRoadmap;
    }>>(`/api/v1/shares/${token}`);

    if (!fetchResult.ok || !fetchResult.data?.success || !fetchResult.data?.data) {
      const errorMsg =
        fetchResult.error ||
        fetchResult.data?.error ||
        'This roadmap share link is invalid, expired, or was revoked.';
      set({ isLoading: false, shareError: errorMsg, error: errorMsg });
      return false;
    }

    const { shareInfo, roadmap: rawRoadmap } = fetchResult.data.data;
    const { layoutDirection } = get();
    const { roadmap, metrics } = recalculateRoadmapState(rawRoadmap);
    const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction: layoutDirection });

    set({
      roadmap,
      nodes,
      edges,
      metrics,
      selectedMilestoneId: roadmap.milestones[0]?.id || null,
      isReadOnly: true,
      sharedMetadata: shareInfo,
      isLoading: false,
      error: null,
      shareError: null,
    });

    return true;
  },

  exitSharedView: () => {
    set({
      isReadOnly: false,
      sharedMetadata: null,
      shareError: null,
    });
  },
}));
