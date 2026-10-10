import React from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

export const RoadmapProgressHUD: React.FC = () => {
  const metrics = useRoadmapStore((s) => s.metrics);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const resetAllProgress = useRoadmapStore((s) => s.resetAllProgress);

  if (!roadmap || metrics.totalMilestones === 0) return null;

  return (
    <div
      aria-label="Dynamic Progress and Timeline HUD"
      className="absolute top-4 right-4 z-10 max-w-sm sm:max-w-md p-3.5 rounded-2xl bg-obsidian-900/90 border border-obsidian-800 backdrop-blur-xl shadow-2xl text-slate-200 space-y-2.5 transition-all duration-300"
    >
      {/* Top Row: Overall Completion & Quick Reset */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Roadmap Progress
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {metrics.completionPercentage}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {metrics.completedCount} of {metrics.totalMilestones} skills acquired
            </p>
          </div>
        </div>

        {metrics.completedCount > 0 && (
          <button
            onClick={resetAllProgress}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-800 transition-colors"
            title="Reset all milestone progress"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-obsidian-950 rounded-full overflow-hidden p-0.5 border border-obsidian-800/80">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-sm shadow-cyan-500/50"
          style={{ width: `${Math.max(4, metrics.completionPercentage)}%` }}
        />
      </div>

      {/* Dynamic Metrics Row: Remaining Hours & Adjusted Timeline */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-obsidian-800/80 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-obsidian-950/60 border border-obsidian-800">
          <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Remaining Effort
            </span>
            <span className="font-mono font-bold text-slate-200 text-xs">
              {metrics.remainingHours} hrs{' '}
              <span className="text-[10px] text-slate-500 font-normal">
                ({metrics.completedHours}h done)
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-obsidian-950/60 border border-obsidian-800">
          <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Study Timeline
            </span>
            <span className="font-mono font-bold text-slate-200 text-xs">
              {metrics.remainingWeeks} wks{' '}
              <span className="text-[10px] text-slate-500 font-normal">
                (@{roadmap.weeklyCommitmentHours}h/wk)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Gap Warning Banner (when downstream nodes were completed without upstream prereqs) */}
      {metrics.warningGapCount > 0 && (
        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/60 text-[11px] text-amber-200/90 flex items-start gap-2 leading-tight">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">
              Prerequisite Gap ({metrics.warningGapCount}):
            </span>{' '}
            Completed work is preserved! Complete open prerequisites to remove gap warnings.
          </div>
        </div>
      )}

      {/* All Complete Celebration Banner */}
      {metrics.completionPercentage === 100 && (
        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-[11px] text-emerald-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">
            All milestones completed! You are production-ready for {roadmap.targetRole}.
          </span>
        </div>
      )}
    </div>
  );
};
