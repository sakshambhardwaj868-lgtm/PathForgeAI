import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { CareerRoadmap, GenerateRoadmapRequest, RoadmapMilestone, ApiResponse } from '../types/roadmap';
import { getLayoutedRoadmap } from '../utils/dagreLayout';

interface RoadmapStoreState {
  roadmap: CareerRoadmap | null;
  nodes: Node[];
  edges: Edge[];
  selectedMilestoneId: string | null;
  layoutDirection: 'TB' | 'LR';
  isLoading: boolean;
  error: string | null;
  activeFilter: string; // 'all' or category

  // Actions
  setRoadmap: (roadmap: CareerRoadmap) => void;
  setLayoutDirection: (direction: 'TB' | 'LR') => void;
  selectMilestone: (id: string | null) => void;
  setActiveFilter: (filter: string) => void;
  clearRoadmap: () => void;
  generateRoadmap: (input: GenerateRoadmapRequest) => Promise<boolean>;
  toggleMilestoneKnown: (milestoneId: string) => void;
}

export const useRoadmapStore = create<RoadmapStoreState>((set, get) => ({
  roadmap: null,
  nodes: [],
  edges: [],
  selectedMilestoneId: null,
  layoutDirection: 'TB',
  isLoading: false,
  error: null,
  activeFilter: 'all',

  setRoadmap: (roadmap: CareerRoadmap) => {
    const { layoutDirection } = get();
    const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction: layoutDirection });
    set({
      roadmap,
      nodes,
      edges,
      selectedMilestoneId: roadmap.milestones[0]?.id || null,
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
    set({
      roadmap: null,
      nodes: [],
      edges: [],
      selectedMilestoneId: null,
      error: null,
    });
  },

  generateRoadmap: async (input: GenerateRoadmapRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/v1/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result = (await response.json()) as ApiResponse<CareerRoadmap>;

      if (!response.ok || !result.success || !result.data) {
        const errorMsg = result.error || 'Failed to generate career roadmap. Please try again.';
        set({ isLoading: false, error: errorMsg });
        return false;
      }

      const roadmap = result.data;
      const { layoutDirection } = get();
      const { nodes, edges } = getLayoutedRoadmap(roadmap, { direction: layoutDirection });

      set({
        roadmap,
        nodes,
        edges,
        selectedMilestoneId: roadmap.milestones[0]?.id || null,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Network connection failed while contacting PathForge API.',
      });
      return false;
    }
  },

  toggleMilestoneKnown: (milestoneId: string) => {
    const { roadmap, layoutDirection } = get();
    if (!roadmap) return;

    const updatedMilestones: RoadmapMilestone[] = roadmap.milestones.map((m) => {
      if (m.id !== milestoneId) return m;

      const nextKnown = !m.isKnown;
      const nextStatus = nextKnown ? 'completed' : 'available';

      return {
        ...m,
        isKnown: nextKnown,
        status: nextStatus,
      };
    });

    const updatedRoadmap: CareerRoadmap = {
      ...roadmap,
      milestones: updatedMilestones,
    };

    const { nodes, edges } = getLayoutedRoadmap(updatedRoadmap, { direction: layoutDirection });
    set({
      roadmap: updatedRoadmap,
      nodes,
      edges,
    });
  },
}));
