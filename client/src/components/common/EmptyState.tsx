import React from 'react';
import { GitBranch, Sparkles } from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

export const EmptyState: React.FC = () => {
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  const handleQuickStart = async () => {
    await generateRoadmap({
      targetRole: 'Full Stack Developer at a Climate Tech Startup',
      targetCompanyType: 'Clean Energy Series-A',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center bg-obsidian-950">
      <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-6 shadow-lg shadow-cyan-950/50">
        <GitBranch className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        No Career Graph Loaded
      </h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
        Enter your target dream job above or pick a featured preset to generate an interactive Directed Acyclic Graph (DAG) with auto-layout and milestone projects.
      </p>

      <button
        onClick={handleQuickStart}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition-all hover:scale-105"
      >
        <Sparkles className="w-4 h-4" />
        Explore Sample Career Roadmap
      </button>
    </div>
  );
};
