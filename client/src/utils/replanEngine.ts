import {
  CareerRoadmap,
  RoadmapMilestone,
  RoadmapEdge,
  RoadmapProgressMetrics,
  NodeStatus,
} from '../types/roadmap';

export interface DynamicRoadmapResult {
  roadmap: CareerRoadmap;
  metrics: RoadmapProgressMetrics;
}

/**
 * Pure deterministic topological recalculation engine for PathForge AI.
 *
 * Enforces the non-destructive Phase 5 state model:
 * 1. For each milestone:
 *    - Evaluates prerequisite completion: all prerequisiteIds must have isKnown === true.
 *    - If prerequisites satisfied & isKnown === true  -> 'completed'
 *    - If prerequisites satisfied & isKnown === false -> 'available'
 *    - If prerequisites OPEN & isKnown === true       -> 'completed_with_warning' (WORK PRESERVED!)
 *    - If prerequisites OPEN & isKnown === false      -> 'locked'
 * 2. For each edge:
 *    - If target has status 'completed_with_warning' and source milestone is not known -> isWarningGap = true
 * 3. Dynamically re-estimates remaining study hours, remaining weeks, and progress percentage.
 */
export function recalculateRoadmapState(
  roadmap: CareerRoadmap | null | undefined
): DynamicRoadmapResult {
  const emptyMetrics: RoadmapProgressMetrics = {
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

  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length === 0) {
    return {
      roadmap: roadmap || ({ milestones: [], edges: [] } as unknown as CareerRoadmap),
      metrics: emptyMetrics,
    };
  }

  // 1. Build lookup map of milestones by ID
  const milestoneMap = new Map<string, RoadmapMilestone>();
  roadmap.milestones.forEach((m) => {
    milestoneMap.set(m.id, { ...m });
  });

  // 2. Determine node status for each milestone
  const updatedMilestones: RoadmapMilestone[] = roadmap.milestones.map((m) => {
    const isKnown = !!m.isKnown;
    const prereqIds = Array.isArray(m.prerequisiteIds)
      ? m.prerequisiteIds
      : Array.isArray((m as any).prerequisites)
      ? (m as any).prerequisites
      : [];

    // Check if all prerequisites are fulfilled
    let allPrereqsSatisfied = true;
    for (const prereqId of prereqIds) {
      const prereqNode = milestoneMap.get(prereqId);
      // If prerequisite is missing or NOT known, condition fails
      if (!prereqNode || !prereqNode.isKnown) {
        allPrereqsSatisfied = false;
        break;
      }
    }

    let status: NodeStatus;

    if (allPrereqsSatisfied) {
      status = isKnown ? 'completed' : m.status === 'in_progress' ? 'in_progress' : 'available';
    } else {
      // Prerequisites are incomplete:
      // If user marked this skill as known, PRESERVE work with a gap warning!
      // If not known, the milestone is locked.
      status = isKnown ? 'completed_with_warning' : 'locked';
    }

    return {
      ...m,
      isKnown,
      status,
    };
  });

  // Re-map updated milestones for edge evaluation
  const updatedMap = new Map<string, RoadmapMilestone>();
  updatedMilestones.forEach((m) => updatedMap.set(m.id, m));

  // 3. Update edge warning states
  const updatedEdges: RoadmapEdge[] = (roadmap.edges || []).map((edge) => {
    const sourceMilestone = updatedMap.get(edge.source);
    const targetMilestone = updatedMap.get(edge.target);

    const isWarningGap =
      targetMilestone?.status === 'completed_with_warning' &&
      sourceMilestone !== undefined &&
      !sourceMilestone.isKnown;

    return {
      ...edge,
      isWarningGap: !!isWarningGap,
    };
  });

  // 4. Calculate progress metrics and remaining effort
  const totalMilestones = updatedMilestones.length;
  const completedMilestones = updatedMilestones.filter((m) => m.isKnown);
  const completedCount = completedMilestones.length;
  const completionPercentage =
    totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  const totalHours = updatedMilestones.reduce((sum, m) => sum + (Number(m.estimatedHours) || 0), 0);
  const completedHours = completedMilestones.reduce(
    (sum, m) => sum + (Number(m.estimatedHours) || 0),
    0
  );
  const remainingHours = Math.max(0, totalHours - completedHours);

  const weeklyCommitmentHours = Number(roadmap.weeklyCommitmentHours) || 15;
  const totalWeeks = Math.ceil(totalHours / weeklyCommitmentHours);
  const remainingWeeks = Math.ceil(remainingHours / weeklyCommitmentHours);

  const warningGapCount = updatedMilestones.filter(
    (m) => m.status === 'completed_with_warning'
  ).length;

  const metrics: RoadmapProgressMetrics = {
    totalMilestones,
    completedCount,
    completionPercentage,
    totalHours,
    completedHours,
    remainingHours,
    totalWeeks,
    remainingWeeks,
    warningGapCount,
  };

  const updatedRoadmap: CareerRoadmap = {
    ...roadmap,
    milestones: updatedMilestones,
    edges: updatedEdges,
    totalEstimatedWeeks: remainingWeeks,
  };

  return {
    roadmap: updatedRoadmap,
    metrics,
  };
}
