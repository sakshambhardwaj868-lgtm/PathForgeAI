import React from 'react';
import { Compass, Eye, Sparkles, User, Calendar, ArrowRight } from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

export const SharedRoadmapHeader: React.FC = () => {
  const sharedMetadata = useRoadmapStore((s) => s.sharedMetadata);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const exitSharedView = useRoadmapStore((s) => s.exitSharedView);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  const handleCreateOwnRoadmap = () => {
    exitSharedView();
    if (window.history?.pushState) {
      window.history.pushState({}, '', '/');
    } else {
      window.location.href = '/';
    }

    // Load default starter roadmap
    generateRoadmap({
      targetRole: 'Full Stack Developer at a Climate Tech Startup',
      targetCompanyType: 'Clean Energy Series-A',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });
  };

  return (
    <header
      role="banner"
      aria-label="Shared Roadmap Read-Only Navigation Bar"
      className="border-b border-obsidian-800 bg-obsidian-900/95 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md"
    >
      {/* Left: Brand & Read-Only Badge */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-400">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">PathForge AI</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400" />
              Shared View &bull; Read-Only
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {roadmap?.targetRole || 'Career Roadmap'} &bull; {roadmap?.targetCompanyType || 'Target Company'}
          </p>
        </div>
      </div>

      {/* Middle: Owner Metadata */}
      <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-obsidian-950 border border-obsidian-800">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Created by <strong className="text-white">{sharedMetadata?.ownerName || 'Explorer'}</strong></span>
        </div>

        {sharedMetadata?.createdAt && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-obsidian-950 border border-obsidian-800 text-slate-400 text-[11px]">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Shared {new Date(sharedMetadata.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Right: CTA to create user's own roadmap */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateOwnRoadmap}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs transition-all shadow-md shadow-cyan-950/50 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Build Your Own Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
