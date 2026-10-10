import React from 'react';
import { Sparkles, Network } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center bg-obsidian-950"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400 animate-pulse">
          <Network className="w-8 h-8 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        Synthesizing Career Skill Graph...
      </h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
        Reverse-engineering milestone dependencies, calculating topological layout, and verifying directed acyclic graph integrity.
      </p>

      {/* Progress animation line */}
      <div className="w-48 h-1 bg-obsidian-800 rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};
