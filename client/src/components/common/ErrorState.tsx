import React from 'react';
import { AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  const handleLoadFallback = async () => {
    await generateRoadmap({
      targetRole: 'Full Stack Developer at a Climate Tech Startup',
      targetCompanyType: 'Clean Energy Series-A',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });
  };

  return (
    <div
      role="alert"
      className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center bg-obsidian-950"
    >
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        Roadmap Generation Notice
      </h3>
      <p className="text-xs text-rose-300/80 max-w-md leading-relaxed mb-6 bg-rose-950/30 p-3 rounded-lg border border-rose-900/50">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-200 border border-obsidian-700 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Request
          </button>
        )}

        <button
          onClick={handleLoadFallback}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Load Verified Offline Fallback
        </button>
      </div>
    </div>
  );
};
