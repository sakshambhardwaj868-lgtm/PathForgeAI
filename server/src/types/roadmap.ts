/**
 * PathForge AI — Server Roadmap Type Definitions
 */

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'completed_with_warning';

export type MilestoneCategory = 'foundation' | 'core-skill' | 'tooling' | 'capstone' | 'career-prep';

export interface TopicLesson {
  id: string; // e.g. "lesson-1"
  title: string;
  durationMinutes: number; // estimated duration in minutes
  explanation: string; // clear narrative concept explanation
  studySteps: string[]; // step-by-step actionable learning steps
  practiceActivity: string; // specific hands-on coding/design practice task
  completionCriteria: string; // concrete proof of topic mastery
}

export interface CurriculumTopic {
  title: string;
  subtopics: string[];
}

export interface PracticalExercise {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  hints?: string[];
  solutionOverview?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface WeekendProject {
  title: string;
  description: string;
  deliverables: string[];
  estimatedHours: number;
  tasks?: string[]; // step-by-step implementation tasks
  acceptanceCriteria?: string[]; // clear pass/fail acceptance requirements
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
  explanation?: string;
}

export interface MilestoneActionableData {
  learningObjectives: string[];
  whyItMatters?: string;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  learningOutcomes?: string[];
  topics?: CurriculumTopic[];
  lessons?: TopicLesson[];
  practicalExercises?: PracticalExercise[];
  weekendProject: WeekendProject;
  curatedResources: CuratedResource[];
  interviewChallenges: InterviewChallenge[];
  quizQuestions?: QuizQuestion[];
  completionCriteria?: string[];
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
  modelUsed?: string;
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

export interface CreateShareRequest {
  expiresInDays?: number | null;
  label?: string;
}

export interface ShareSummary {
  id: string;
  tokenPrefix: string;
  label?: string;
  expiresAt: string | null;
  isRevoked: boolean;
  revokedAt?: string | null;
  viewCount: number;
  createdAt: string;
}

export interface CreateShareResponseData {
  id: string;
  shareUrl: string;
  tokenPrefix: string;
  label?: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface PublicShareInfo {
  label?: string;
  ownerName: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface PublicSharedRoadmapResponse {
  shareInfo: PublicShareInfo;
  roadmap: CareerRoadmap;
}

