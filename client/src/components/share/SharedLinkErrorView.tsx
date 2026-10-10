import React from 'react';
import { ShieldAlert, Compass } from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

interface SharedLinkErrorViewProps {
  message: string;
}

export const SharedLinkErrorView: React.FC<SharedLinkErrorViewProps> = ({ message }) => {
  const exitSharedView = useRoadmapStore((s) => s.exitSharedView);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  const handleReturnHome = () => {
    exitSharedView();
    if (window.history?.pushState) {
      window.history.pushState({}, '', '/');
    } else {
      window.location.href = '/';
    }

    generateRoadmap({
      targetRole: 'Full Stack Developer at a Climate Tech Startup',
      targetCompanyType: 'Clean Energy Series-A',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-obsidian-950 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-obsidian-900 border border-obsidian-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Share Link Unavailable</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {message || 'This roadmap share link is invalid, expired, or was revoked by its owner.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-slate-400 text-left space-y-1">
          <div className="font-semibold text-slate-300">Why might this happen?</div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400">
            <li>The creator set an expiration window that has passed.</li>
            <li>The creator revoked the public link from their dashboard.</li>
            <li>The share URL token was incomplete or modified.</li>
          </ul>
        </div>

        <button
          onClick={handleReturnHome}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50"
        >
          <Compass className="w-4 h-4" />
          <span>Explore PathForge AI Interactive Builder</span>
        </button>
      </div>
    </div>
  );
};
