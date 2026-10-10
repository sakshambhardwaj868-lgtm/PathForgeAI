import React from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowDownUp,
  ArrowLeftRight,
  Map as MapIcon,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

interface GraphToolbarProps {
  showMinimap: boolean;
  setShowMinimap: (show: boolean | ((prev: boolean) => boolean)) => void;
  showLegend: boolean;
  setShowLegend: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  showMinimap,
  setShowMinimap,
  showLegend,
  setShowLegend,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const layoutDirection = useRoadmapStore((s) => s.layoutDirection);
  const setLayoutDirection = useRoadmapStore((s) => s.setLayoutDirection);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const setRoadmap = useRoadmapStore((s) => s.setRoadmap);

  const toggleDirection = () => {
    const nextDir = layoutDirection === 'TB' ? 'LR' : 'TB';
    setLayoutDirection(nextDir);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  };

  const handleResetLayout = () => {
    if (roadmap) {
      setRoadmap(roadmap);
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 50);
    }
  };

  return (
    <div
      aria-label="Graph Canvas Controls"
      className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-obsidian-900/90 border border-obsidian-800 backdrop-blur-md shadow-xl text-slate-300"
    >
      {/* Zoom In */}
      <button
        onClick={() => zoomIn({ duration: 300 })}
        className="p-2 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={() => zoomOut({ duration: 300 })}
        className="p-2 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Fit View */}
      <button
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        className="p-2 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
        title="Fit Graph to View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-obsidian-800 mx-0.5" />

      {/* Toggle Layout Direction TB vs LR */}
      <button
        onClick={toggleDirection}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          layoutDirection === 'LR'
            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            : 'hover:bg-obsidian-800 hover:text-white'
        }`}
        title={`Current Layout: ${layoutDirection === 'TB' ? 'Top-to-Bottom' : 'Left-to-Right'}`}
      >
        {layoutDirection === 'TB' ? (
          <>
            <ArrowDownUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Vertical (TB)</span>
          </>
        ) : (
          <>
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Horizontal (LR)</span>
          </>
        )}
      </button>

      {/* Re-align / Reset Graph */}
      <button
        onClick={handleResetLayout}
        className="p-2 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
        title="Re-run Dagre Auto-Layout"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-obsidian-800 mx-0.5" />

      {/* Toggle Minimap */}
      <button
        onClick={() => setShowMinimap((prev) => !prev)}
        className={`p-2 rounded-lg transition-colors ${
          showMinimap
            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800'
            : 'hover:bg-obsidian-800 hover:text-white'
        }`}
        title="Toggle Minimap"
      >
        <MapIcon className="w-4 h-4" />
      </button>

      {/* Toggle Legend */}
      <button
        onClick={() => setShowLegend((prev) => !prev)}
        className={`p-2 rounded-lg transition-colors ${
          showLegend
            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800'
            : 'hover:bg-obsidian-800 hover:text-white'
        }`}
        title="Toggle Graph Legend"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
