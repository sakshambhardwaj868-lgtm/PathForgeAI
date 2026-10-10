/**
 * PathForge AI — Server Roadmap Type Definitions
 */

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

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
  id: string;
  title: string;
  category: MilestoneCategory;
  phaseId: string;
  estimatedHours: number;
  prerequisiteIds: string[];
  status: NodeStatus;
  isKnown: boolean;
  actionableData: MilestoneActionableData;
}

export interface RoadmapPhase {
  id: string;
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
  isWarningGap?: boolean;
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

