import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import { MilestoneNode } from './MilestoneNode';
import { GraphToolbar } from './GraphToolbar';
import { NodeDetailPanel } from './NodeDetailPanel';
import { GraphLegend } from '../common/GraphLegend';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { RoadmapMilestone } from '../../types/roadmap';

const InnerCareerGraphCanvas: React.FC = () => {
  const nodes = useRoadmapStore((s) => s.nodes);
  const edges = useRoadmapStore((s) => s.edges);
  const selectMilestone = useRoadmapStore((s) => s.selectMilestone);

  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      milestoneNode: MilestoneNode,
    }),
    []
  );

  // Automatically fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectMilestone(node.id);
    },
    [selectMilestone]
  );

  const onPaneClick = useCallback(() => {
    // Keep selection or deselect
  }, []);

  // Custom node color function for MiniMap
  const getNodeColor = useCallback((node: Node) => {
    const milestone = (node.data as any)?.milestone as RoadmapMilestone | undefined;
    if (!milestone) return '#334155';

    switch (milestone.status) {
      case 'completed':
        return '#10b981'; // emerald-500
      case 'completed_with_warning':
        return '#f59e0b'; // amber-500
      case 'available':
        return '#06b6d4'; // cyan-500
      case 'locked':
      default:
        return '#475569'; // slate-600
    }
  }, []);

  return (
    <div className="relative w-full h-full flex flex-row overflow-hidden bg-obsidian-950">
      {/* React Flow Graph Area */}
      <div className="relative flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          minZoom={0.2}
          maxZoom={2.0}
          proOptions={{ hideAttribution: true }}
          className="bg-obsidian-950"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#1e293b"
          />

          {showMinimap && (
            <MiniMap
              nodeColor={getNodeColor}
              nodeStrokeWidth={2}
              zoomable
              pannable
              position="bottom-right"
              className="!m-4 !border !border-obsidian-800 !bg-obsidian-900/90 !rounded-xl !overflow-hidden"
            />
          )}

          <GraphToolbar
            showMinimap={showMinimap}
            setShowMinimap={setShowMinimap}
            showLegend={showLegend}
            setShowLegend={setShowLegend}
          />

          {showLegend && <GraphLegend onClose={() => setShowLegend(false)} />}
        </ReactFlow>
      </div>

      {/* Interactive Detail Inspector Panel */}
      <NodeDetailPanel />
    </div>
  );
};

export const CareerGraphCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <InnerCareerGraphCanvas />
    </ReactFlowProvider>
  );
};
