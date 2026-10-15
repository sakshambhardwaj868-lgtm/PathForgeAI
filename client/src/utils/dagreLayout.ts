import dagre from 'dagre';
import { Node, Edge, MarkerType, Position } from '@xyflow/react';
import { CareerRoadmap, RoadmapMilestone, RoadmapEdge } from '../types/roadmap';

export interface LayoutOptions {
  direction?: 'TB' | 'LR';
  nodeWidth?: number;
  nodeHeight?: number;
}

export interface StageGroupInfo {
  phaseId: string;
  title: string;
  description?: string;
  order: number;
  milestoneIds: string[];
  totalHours: number;
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
  isActive: boolean;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    centerX: number;
    centerY: number;
  };
}

export interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
  stageGroups?: StageGroupInfo[];
}

const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 165;

/**
 * Transforms roadmap milestones and edges into positioned React Flow nodes and edges using Dagre DAG layout.
 * Organizes skills into progressive stages with improved spacing, alignment, and edge routing.
 */
export function getLayoutedRoadmap(
  roadmap: CareerRoadmap | null | undefined,
  options: LayoutOptions = {}
): LayoutedElements {
  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length === 0) {
    return { nodes: [], edges: [], stageGroups: [] };
  }

  const direction = options.direction || 'TB';
  const nodeWidth = options.nodeWidth || DEFAULT_NODE_WIDTH;
  const nodeHeight = options.nodeHeight || DEFAULT_NODE_HEIGHT;
  const isHorizontal = direction === 'LR';

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 90, // Generous cross-rank separation between parallel skills
    ranksep: 130, // Distance between progressive tiers and stages
    align: 'UL',
    marginx: 50,
    marginy: 50,
  });

  // Collect valid milestone IDs for boundary validation
  const validMilestoneIds = new Set(roadmap.milestones.map((m) => m.id));

  // 1. Add nodes to Dagre graph
  roadmap.milestones.forEach((milestone) => {
    dagreGraph.setNode(milestone.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  // 2. Add edges to Dagre graph (derive from edges array or directly from milestone prerequisiteIds)
  const rawEdges: RoadmapEdge[] =
    roadmap.edges && roadmap.edges.length > 0
      ? roadmap.edges
      : roadmap.milestones.flatMap((m) =>
          (m.prerequisiteIds || []).map((pId) => ({
            id: `edge-${pId}-${m.id}`,
            source: pId,
            target: m.id,
          }))
        );

  const validEdges = rawEdges.filter(
    (edge) => validMilestoneIds.has(edge.source) && validMilestoneIds.has(edge.target)
  );

  validEdges.forEach((edge) => {
    try {
      dagreGraph.setEdge(edge.source, edge.target);
    } catch {
      // Ignore any malformed edge declarations
    }
  });

  // 3. Compute layout coordinates
  try {
    dagre.layout(dagreGraph);
  } catch (layoutErr) {
    console.error('[dagreLayout] Dagre calculation error, falling back to sequential grid:', layoutErr);
  }

  // Map milestones and phases for fast lookup
  const milestoneMap = new Map<string, RoadmapMilestone>();
  roadmap.milestones.forEach((m) => milestoneMap.set(m.id, m));

  const phaseMap = new Map<string, { title: string; order: number; description?: string }>();
  if (Array.isArray(roadmap.phases)) {
    roadmap.phases.forEach((p) => phaseMap.set(p.id, { title: p.title, order: p.order, description: p.description }));
  }

  // 4. Transform into React Flow Node objects
  const targetPosition = isHorizontal ? Position.Left : Position.Top;
  const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

  const nodes: Node[] = roadmap.milestones.map((milestone, idx) => {
    let x = idx * (nodeWidth + 60);
    let y = 100;

    try {
      const nodeWithPosition = dagreGraph.node(milestone.id);
      if (nodeWithPosition && typeof nodeWithPosition.x === 'number' && typeof nodeWithPosition.y === 'number') {
        // Dagre centers nodes; adjust to top-left coordinate for React Flow
        x = nodeWithPosition.x - nodeWidth / 2;
        y = nodeWithPosition.y - nodeHeight / 2;
      }
    } catch {
      // Keep fallback coordinates
    }

    const phaseInfo = phaseMap.get(milestone.phaseId);

    return {
      id: milestone.id,
      type: 'milestoneNode',
      position: { x, y },
      data: {
        milestone,
        targetPosition,
        sourcePosition,
        phaseTitle: phaseInfo?.title,
        stageOrder: phaseInfo?.order,
      },
      targetPosition,
      sourcePosition,
    };
  });

  // 5. Transform into React Flow Edge objects with smart semantic routing
  const edges: Edge[] = validEdges.map((edge) => {
    const sourceMilestone = milestoneMap.get(edge.source);
    const targetMilestone = milestoneMap.get(edge.target);

    const isWarning =
      edge.isWarningGap ||
      (targetMilestone?.status === 'completed_with_warning' && sourceMilestone && !sourceMilestone.isKnown);
    const isCompleted = !isWarning && !!sourceMilestone?.isKnown && !!targetMilestone?.isKnown;
    const isTargetAvailable = targetMilestone?.status === 'available' || targetMilestone?.status === 'in_progress';
    const isTargetInProgress = targetMilestone?.status === 'in_progress';

    let strokeColor = '#334155'; // default slate-700 for locked
    let animated = false;
    let strokeWidth = 2;

    if (isWarning) {
      strokeColor = '#f59e0b'; // amber-500
      strokeWidth = 2.5;
    } else if (isCompleted) {
      strokeColor = '#10b981'; // emerald-500
      strokeWidth = 2.5;
    } else if (isTargetInProgress) {
      strokeColor = '#38bdf8'; // sky-400
      strokeWidth = 3;
      animated = true;
    } else if (isTargetAvailable) {
      strokeColor = '#06b6d4'; // cyan-500
      strokeWidth = 2.5;
      animated = true;
    }

    return {
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated,
      pathOptions: {
        borderRadius: 16,
      },
      style: {
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray: isWarning ? '6 4' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 18,
        height: 18,
      },
    };
  });

  // 6. Compute Stage Groups breakdown for journey ribbon and stage organization
  const phaseList =
    Array.isArray(roadmap.phases) && roadmap.phases.length > 0
      ? [...roadmap.phases].sort((a, b) => a.order - b.order)
      : [
          { id: 'foundation', title: 'Foundations', description: 'Essential core principles and prerequisites', order: 1 },
          { id: 'core-skill', title: 'Core Skills', description: 'Primary engineering frameworks and architecture', order: 2 },
          { id: 'tooling', title: 'Tooling & Systems', description: 'Tooling, infrastructure, and workflows', order: 3 },
          { id: 'capstone', title: 'Capstone & Projects', description: 'Production-grade hands-on deliverables', order: 4 },
          { id: 'career-prep', title: 'Career Readiness', description: 'Interview mastery and domain readiness', order: 5 },
        ];

  const stageGroups: StageGroupInfo[] = phaseList
    .map((phase) => {
      const phaseMilestones = roadmap.milestones.filter(
        (m) => m.phaseId === phase.id || (!roadmap.phases?.length && m.category === phase.id)
      );

      if (phaseMilestones.length === 0) return null;

      const milestoneIds = phaseMilestones.map((m) => m.id);
      const totalHours = phaseMilestones.reduce((acc, m) => acc + (Number(m.estimatedHours) || 0), 0);
      const completedCount = phaseMilestones.filter((m) => m.isKnown).length;
      const totalCount = phaseMilestones.length;
      const isCompleted = completedCount === totalCount;
      const isActive = phaseMilestones.some((m) => m.status === 'available' || m.status === 'in_progress');

      // Compute bounding coordinates
      const stageNodePositions = nodes
        .filter((n) => milestoneIds.includes(n.id))
        .map((n) => n.position);

      let bounds: StageGroupInfo['bounds'];
      if (stageNodePositions.length > 0) {
        const minX = Math.min(...stageNodePositions.map((p) => p.x));
        const maxX = Math.max(...stageNodePositions.map((p) => p.x + nodeWidth));
        const minY = Math.min(...stageNodePositions.map((p) => p.y));
        const maxY = Math.max(...stageNodePositions.map((p) => p.y + nodeHeight));
        bounds = {
          minX,
          maxX,
          minY,
          maxY,
          centerX: (minX + maxX) / 2,
          centerY: (minY + maxY) / 2,
        };
      }

      return {
        phaseId: phase.id,
        title: phase.title,
        description: phase.description,
        order: phase.order,
        milestoneIds,
        totalHours,
        completedCount,
        totalCount,
        isCompleted,
        isActive,
        bounds,
      };
    })
    .filter(Boolean) as StageGroupInfo[];

  return { nodes, edges, stageGroups };
}
