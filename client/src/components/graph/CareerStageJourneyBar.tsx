import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { CheckCircle2, Clock, Flame, ChevronRight, Layers } from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { StageGroupInfo } from '../../utils/dagreLayout';

export const CareerStageJourneyBar: React.FC = () => {
  const stageGroups = useRoadmapStore((s) => s.stageGroups);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const { fitBounds } = useReactFlow();

  if (!stageGroups || stageGroups.length === 0) {
    return null;
  }

  const handleStageClick = (stage: StageGroupInfo) => {
    if (stage.bounds) {
      const width = Math.max(stage.bounds.maxX - stage.bounds.minX + 160, 400);
      const height = Math.max(stage.bounds.maxY - stage.bounds.minY + 160, 300);
      const x = stage.bounds.minX - 80;
      const y = stage.bounds.minY - 80;

      fitBounds({ x, y, width, height }, { duration: 600, padding: 0.15 });
    }
  };

  return (
    <div
      role="region"
      aria-label="Career Journey Stages"
      className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto max-w-6xl w-full flex items-center gap-2 overflow-x-auto p-2 rounded-2xl bg-obsidian-950/85 backdrop-blur-md border border-obsidian-800/80 shadow-2xl shadow-obsidian-950/80 scrollbar-thin scrollbar-thumb-obsidian-700">
        <div className="flex items-center gap-2 pl-2 pr-3 border-r border-obsidian-800 flex-shrink-0">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Career Journey
            </span>
            <span className="text-xs font-bold text-white max-w-[140px] truncate" title={roadmap?.targetRole}>
              {roadmap?.targetRole || 'Roadmap'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-nowrap py-0.5">
          {stageGroups.map((stage, idx) => {
            const isLast = idx === stageGroups.length - 1;

            return (
              <React.Fragment key={stage.phaseId || `stage-${stage.order}-${idx}`}>
                <button
                  type="button"
                  aria-label={`Focus on ${stage.title}`}
                  onClick={() => handleStageClick(stage)}
                  title={`Focus on ${stage.title} (${stage.completedCount}/${stage.totalCount} completed, ${stage.totalHours} hrs)`}
                  className={`group relative flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    stage.isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800/70 hover:border-emerald-500 shadow-sm shadow-emerald-950/40'
                      : stage.isActive
                      ? 'bg-cyan-950/40 border-cyan-700/80 hover:border-cyan-400 ring-1 ring-cyan-500/30 shadow-sm shadow-cyan-950/40'
                      : 'bg-obsidian-900/60 border-obsidian-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className="flex-shrink-0">
                    {stage.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : stage.isActive ? (
                      <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-400">
                        {stage.order}
                      </div>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Stage {stage.order}
                      </span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        {stage.totalHours}h
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                        {stage.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border font-medium ${
                          stage.isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : stage.isActive
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {stage.completedCount}/{stage.totalCount}
                      </span>
                    </div>
                  </div>
                </button>

                {!isLast && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
