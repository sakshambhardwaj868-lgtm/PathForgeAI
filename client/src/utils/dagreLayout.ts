import dagre from 'dagre';
import { Node, Edge, MarkerType, Position } from '@xyflow/react';
import { CareerRoadmap, RoadmapMilestone, RoadmapEdge } from '../types/roadmap';

export interface LayoutOptions {
  direction?: 'TB' | 'LR';
  nodeWidth?: number;
  nodeHeight?: number;
}

export interface LayoutedElements {
  nodes: Node[];
  edges: Edge[];
}

const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 140;

/**
 * Transforms roadmap milestones and edges into positioned React Flow nodes and edges using Dagre DAG layout.
 */
export function getLayoutedRoadmap(
  roadmap: CareerRoadmap | null | undefined,
  options: LayoutOptions = {}
): LayoutedElements {
  if (!roadmap || !Array.isArray(roadmap.milestones) || roadmap.milestones.length === 0) {
    return { nodes: [], edges: [] };
  }

  const direction = options.direction || 'TB';
  const nodeWidth = options.nodeWidth || DEFAULT_NODE_WIDTH;
  const nodeHeight = options.nodeHeight || DEFAULT_NODE_HEIGHT;
  const isHorizontal = direction === 'LR';

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80, // Horizontal/cross-rank separation
    ranksep: 100, // Distance between dependent tiers
    align: 'DL',
    marginx: 40,
    marginy: 40,
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

  // Map milestones by ID for fast lookup
  const milestoneMap = new Map<string, RoadmapMilestone>();
  roadmap.milestones.forEach((m) => milestoneMap.set(m.id, m));

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

    return {
      id: milestone.id,
      type: 'milestoneNode',
      position: { x, y },
      data: {
        milestone,
        targetPosition,
        sourcePosition,
      },
      targetPosition,
      sourcePosition,
    };
  });

  // 5. Transform into React Flow Edge objects
  const edges: Edge[] = validEdges.map((edge) => {
    const sourceMilestone = milestoneMap.get(edge.source);
    const targetMilestone = milestoneMap.get(edge.target);

    const isWarning =
      edge.isWarningGap ||
      (targetMilestone?.status === 'completed_with_warning' && sourceMilestone && !sourceMilestone.isKnown);
    const isCompleted = !isWarning && !!sourceMilestone?.isKnown && !!targetMilestone?.isKnown;
    const isTargetAvailable = targetMilestone?.status === 'available';

    let strokeColor = '#334155'; // default slate-700
    let animated = false;

    if (isWarning) {
      strokeColor = '#f59e0b'; // amber-500
    } else if (isCompleted) {
      strokeColor = '#10b981'; // emerald-500
    } else if (isTargetAvailable) {
      strokeColor = '#06b6d4'; // cyan-500
      animated = true;
    }

    return {
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated,
      style: {
        stroke: strokeColor,
        strokeWidth: isWarning || isTargetAvailable ? 2.5 : 2,
        strokeDasharray: isWarning ? '5 5' : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 16,
        height: 16,
      },
    };
  });

  return { nodes, edges };
}
