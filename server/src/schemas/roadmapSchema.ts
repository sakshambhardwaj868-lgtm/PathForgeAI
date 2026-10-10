import { z } from 'zod';
import { CareerRoadmap, RoadmapMilestone, RoadmapEdge } from '../types/roadmap';

export const weekendProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  deliverables: z.array(z.string().min(2)).min(1),
  estimatedHours: z.number().positive().max(50),
});

export const curatedResourceSchema = z.object({
  title: z.string().min(2),
  type: z.enum(['github_search', 'documentation', 'tutorial']),
  searchQueryOrUrl: z.string().min(3),
  description: z.string().min(5),
});

export const interviewChallengeSchema = z.object({
  question: z.string().min(5),
  idealAnswerKey: z.string().min(10),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

export const actionableDataSchema = z.object({
  learningObjectives: z.array(z.string().min(5)).min(1),
  weekendProject: weekendProjectSchema,
  curatedResources: z.array(curatedResourceSchema).min(1),
  interviewChallenges: z.array(interviewChallengeSchema).min(1),
});

export const roadmapMilestoneSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(3),
  category: z.enum(['foundation', 'core-skill', 'tooling', 'capstone', 'career-prep']),
  phaseId: z.string().min(2),
  estimatedHours: z.number().int().positive().min(5).max(120),
  prerequisiteIds: z.array(z.string()).default([]),
  status: z.enum(['locked', 'available', 'completed', 'completed_with_warning']).default('available'),
  isKnown: z.boolean().default(false),
  actionableData: actionableDataSchema,
});

export const roadmapPhaseSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(5),
  order: z.number().int().positive(),
});

export const intermediateRoleSchema = z.object({
  title: z.string().min(3),
  estimatedTimelineMonth: z.number().int().positive(),
  description: z.string().min(5),
});

export const roadmapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  isWarningGap: z.boolean().optional(),
});

export const rawCareerRoadmapSchema = z.object({
  id: z.string().default(() => `rf-${Date.now()}`),
  targetRole: z.string().min(3),
  targetCompanyType: z.string().default('Tech Startup'),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  weeklyCommitmentHours: z.number().int().positive().default(15),
  totalEstimatedWeeks: z.number().int().positive().default(20),
  phases: z.array(roadmapPhaseSchema).min(2),
  intermediateRoles: z.array(intermediateRoleSchema).min(1),
  milestones: z.array(roadmapMilestoneSchema).min(3),
  edges: z.array(roadmapEdgeSchema).optional().default([]),
});

/**
 * Validates that all prerequisite IDs declared by milestones exist in the milestone set.
 */
export function validatePrerequisiteIds(milestones: RoadmapMilestone[]): { valid: boolean; missingPrereqs: string[] } {
  const milestoneIds = new Set(milestones.map((m) => m.id));
  const missingPrereqs: string[] = [];

  for (const milestone of milestones) {
    for (const prereqId of milestone.prerequisiteIds) {
      if (!milestoneIds.has(prereqId)) {
        missingPrereqs.push(`Milestone "${milestone.id}" references unknown prerequisite "${prereqId}"`);
      }
    }
  }

  return {
    valid: missingPrereqs.length === 0,
    missingPrereqs,
  };
}

/**
 * Detects cycles in the milestone dependency graph using Kahn's algorithm (Topological Sort).
 * Returns true if a cycle is found, false if graph is a valid DAG.
 */
export function detectGraphCycles(milestones: RoadmapMilestone[]): boolean {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  // Initialize
  for (const m of milestones) {
    inDegree.set(m.id, 0);
    adjList.set(m.id, []);
  }

  // Populate graph edges (prereqId -> milestoneId)
  for (const m of milestones) {
    for (const prereqId of m.prerequisiteIds) {
      if (adjList.has(prereqId)) {
        adjList.get(prereqId)!.push(m.id);
        inDegree.set(m.id, (inDegree.get(m.id) || 0) + 1);
      }
    }
  }

  // Kahn's algorithm queue
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  let visitedCount = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedCount++;

    for (const neighbor of adjList.get(current) || []) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If visited count != total nodes, there is a cycle!
  return visitedCount !== milestones.length;
}

/**
 * Reconciles and builds deterministic edges from prerequisite declarations.
 */
export function buildEdgesFromMilestones(milestones: RoadmapMilestone[]): RoadmapEdge[] {
  const edges: RoadmapEdge[] = [];
  const edgeSet = new Set<string>();

  for (const m of milestones) {
    for (const prereqId of m.prerequisiteIds) {
      const edgeId = `e-${prereqId}-${m.id}`;
      if (!edgeSet.has(edgeId)) {
        edgeSet.add(edgeId);
        edges.push({
          id: edgeId,
          source: prereqId,
          target: m.id,
        });
      }
    }
  }

  return edges;
}

/**
 * Complete validator and sanitizer that guarantees DAG properties, duration sanity,
 * and valid edge mappings.
 */
export function validateAndSanitizeRoadmap(
  raw: unknown,
  source: 'live_ai' | 'cached_fallback' = 'live_ai'
): { success: true; data: CareerRoadmap } | { success: false; errors: string[] } {
  const parseResult = rawCareerRoadmapSchema.safeParse(raw);
  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }

  const roadmapData = parseResult.data;

  // 1. Validate Prerequisite IDs
  const prereqCheck = validatePrerequisiteIds(roadmapData.milestones as RoadmapMilestone[]);
  if (!prereqCheck.valid) {
    return {
      success: false,
      errors: prereqCheck.missingPrereqs,
    };
  }

  // 2. Cycle Detection
  const hasCycle = detectGraphCycles(roadmapData.milestones as RoadmapMilestone[]);
  if (hasCycle) {
    return {
      success: false,
      errors: ['Circular dependency detected in milestone graph. Graph must be a Directed Acyclic Graph.'],
    };
  }

  // 3. Ensure edges are constructed deterministically
  const deterministicEdges = buildEdgesFromMilestones(roadmapData.milestones as RoadmapMilestone[]);

  // 4. Set initial availability based on prerequisites
  const milestonesWithInitialStatus = roadmapData.milestones.map((m) => {
    const isAvailable = m.prerequisiteIds.length === 0;
    return {
      ...m,
      status: m.isKnown ? 'completed' : isAvailable ? 'available' : 'locked',
    };
  });

  // 5. Total hours & weeks recalculation
  const totalHours = milestonesWithInitialStatus.reduce((acc, m) => acc + m.estimatedHours, 0);
  const weekly = Math.max(5, roadmapData.weeklyCommitmentHours);
  const calculatedWeeks = Math.ceil(totalHours / weekly);

  const sanitized: CareerRoadmap = {
    id: roadmapData.id || `rf-${Date.now()}`,
    targetRole: roadmapData.targetRole,
    targetCompanyType: roadmapData.targetCompanyType,
    experienceLevel: roadmapData.experienceLevel,
    weeklyCommitmentHours: roadmapData.weeklyCommitmentHours,
    totalEstimatedWeeks: calculatedWeeks,
    source,
    phases: roadmapData.phases,
    intermediateRoles: roadmapData.intermediateRoles,
    milestones: milestonesWithInitialStatus as RoadmapMilestone[],
    edges: deterministicEdges,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    data: sanitized,
  };
}
