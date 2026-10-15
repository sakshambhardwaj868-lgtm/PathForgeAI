import React from 'react';
import { Lock, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Flame } from 'lucide-react';

interface GraphLegendProps {
  onClose: () => void;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ onClose }) => {
  return (
    <div
      aria-label="DAG Topology Guide"
      className="absolute bottom-4 left-4 z-10 p-4 rounded-xl bg-obsidian-900/95 border border-obsidian-800 backdrop-blur-md shadow-2xl max-w-xs text-xs text-slate-300 space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-obsidian-800">
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Graph Topology Legend
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-1"
        >
          &times;
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
            <Lock className="w-3 h-3 text-slate-500" />
          </span>
          <div>
            <span className="font-semibold text-slate-200 block">Locked</span>
            <span className="text-[10px] text-slate-400">Prerequisites pending</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </span>
          <div>
            <span className="font-semibold text-cyan-300 block">Ready to Learn</span>
            <span className="text-[10px] text-slate-400">Prerequisites satisfied</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded bg-sky-950 border border-sky-800 flex items-center justify-center flex-shrink-0">
            <Flame className="w-3 h-3 text-sky-400" />
          </span>
          <div>
            <span className="font-semibold text-sky-300 block">In Progress</span>
            <span className="text-[10px] text-slate-400">Currently being learned</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </span>
          <div>
            <span className="font-semibold text-emerald-300 block">Completed</span>
            <span className="text-[10px] text-slate-400">Verified acquired skill</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded bg-amber-950 border border-amber-800 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          </span>
          <div>
            <span className="font-semibold text-amber-300 block">Gap Warning</span>
            <span className="text-[10px] text-slate-400">Completed despite open prereq</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1 border-t border-obsidian-800/80">
          <span className="text-cyan-400 flex items-center justify-center flex-shrink-0 font-mono text-[10px]">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-semibold text-slate-200 block">Prerequisite Edge</span>
            <span className="text-[10px] text-slate-400">Directed DAG dependency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
