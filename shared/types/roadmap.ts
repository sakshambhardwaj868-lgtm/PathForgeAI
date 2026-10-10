/**
 * PathForge AI — Shared Roadmap Type Definitions
 * Shared data contracts between Frontend client and Backend API.
 */

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * Refined Phase 5 Decoupled Node Status Model:
 * - 'locked': Prerequisites not yet met. Blocked.
 * - 'available': Prerequisites met. Ready to learn.
 * - 'completed': Verified completed with all prerequisites met.
 * - 'completed_with_warning': Marked completed by user, but one or more prerequisites are currently uncompleted. Preserves completion without erasing work!
 */
export type NodeStatus = 'locked' | 'available' | 'completed' | 'completed_with_warning';

export type MilestoneCategory = 'foundation' | 'core-skill' | 'tooling' | 'capstone' | 'career-prep';

export interface WeekendProject {
  title: string;
  description: string;
  deliverables: string[];
  estimatedHours: number;
}

export interface CuratedResource {
  title: string;
  type: 'github_search' | 'documentation' | 'tutorial';
  searchQueryOrUrl: string;
  description: string;
}

export interface InterviewChallenge {
  question: string;
  idealAnswerKey: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface MilestoneActionableData {
  learningObjectives: string[];
  weekendProject: WeekendProject;
  curatedResources: CuratedResource[];
  interviewChallenges: InterviewChallenge[];
}

export interface RoadmapMilestone {
  id: string; // Stable unique ID, e.g., "ms-ts-runtime"
  title: string;
  category: MilestoneCategory;
  phaseId: string; // Links to parent phase, e.g., "phase-1"
  estimatedHours: number;
  prerequisiteIds: string[]; // Upstream parent milestone IDs
  status: NodeStatus;
  isKnown: boolean;
  actionableData: MilestoneActionableData;
}

export interface RoadmapPhase {
  id: string; // e.g., "phase-1"
  title: string;
  description: string;
  order: number;
}

export interface IntermediateRole {
  title: string;
  estimatedTimelineMonth: number;
  description: string;
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isWarningGap?: boolean; // Highlighted when target is completed but source is uncompleted
}

export interface CareerRoadmap {
  id: string;
  targetRole: string;
  targetCompanyType: string;
  experienceLevel: SkillLevel;
  weeklyCommitmentHours: number;
  totalEstimatedWeeks: number;
  source: 'live_ai' | 'cached_fallback';
  phases: RoadmapPhase[];
  intermediateRoles: IntermediateRole[];
  milestones: RoadmapMilestone[];
  edges: RoadmapEdge[];
  createdAt: string;
}

export interface GenerateRoadmapRequest {
  targetRole: string;
  targetCompanyType?: string;
  experienceLevel: SkillLevel;
  weeklyCommitmentHours: number;
  knownSkillIds?: string[];
}

export interface RoadmapProgressMetrics {
  totalMilestones: number;
  completedCount: number;
  completionPercentage: number;
  totalHours: number;
  completedHours: number;
  remainingHours: number;
  totalWeeks: number;
  remainingWeeks: number;
  warningGapCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}
