import React, { useState } from 'react';
import { Sparkles, Compass, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { SkillLevel } from '../../types/roadmap';

const PRESETS = [
  {
    role: 'Full Stack Developer at a Climate Tech Startup',
    company: 'Clean Energy & Carbon Analytics',
    level: 'Beginner' as SkillLevel,
    hours: 15,
  },
  {
    role: 'Fintech Mobile & Web UI/UX Designer',
    company: 'Neo-bank & Payment Infrastructure',
    level: 'Intermediate' as SkillLevel,
    hours: 20,
  },
  {
    role: 'Generative AI Systems Engineer',
    company: 'Autonomous Agent Platform',
    level: 'Advanced' as SkillLevel,
    hours: 25,
  },
];

export const RoadmapPromptBar: React.FC = () => {
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const isLoading = useRoadmapStore((s) => s.isLoading);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  const [role, setRole] = useState<string>('Full Stack Developer at a Climate Tech Startup');
  const [company, setCompany] = useState<string>('Clean Energy Series-A');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [hours, setHours] = useState<number>(15);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!role.trim() || isLoading) return;

    await generateRoadmap({
      targetRole: role.trim(),
      targetCompanyType: company.trim() || 'Tech Company',
      experienceLevel: level,
      weeklyCommitmentHours: hours,
    });
  };

  const handleSelectPreset = async (preset: typeof PRESETS[0]) => {
    setRole(preset.role);
    setCompany(preset.company);
    setLevel(preset.level);
    setHours(preset.hours);

    await generateRoadmap({
      targetRole: preset.role,
      targetCompanyType: preset.company,
      experienceLevel: preset.level,
      weeklyCommitmentHours: preset.hours,
    });
  };

  return (
    <div
      aria-label="Roadmap Generation Header"
      className="border-b border-obsidian-800 bg-obsidian-900/90 backdrop-blur-md px-4 py-3 flex flex-col gap-2.5"
    >
      {/* Top Row: Title, Presets, and Active Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-800/80 rounded-lg text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              PathForge AI
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Phase 3 Interactive Canvas
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Reverse-Engineered Career Graph &bull; DAG Auto-Layout with Dagre
            </p>
          </div>
        </div>

        {/* Quick Target Role Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(p)}
              disabled={isLoading}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                roadmap?.targetRole === p.role
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm font-semibold'
                  : 'bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border-obsidian-800'
              }`}
            >
              {p.role.split(' at ')[0].split(' Engineer')[0]}
            </button>
          ))}
        </div>

        {/* Source Badge if loaded */}
        {roadmap && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] border ${
                roadmap.source === 'live_ai'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Source: {roadmap.source === 'live_ai' ? 'Live Gemini 3.8' : 'Verified Fallback'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Dynamic Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex-1 min-w-[260px] relative">
          <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Enter dream job (e.g. Distributed Systems Engineer)"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Level selector */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as SkillLevel)}
          className="px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Hours selector */}
        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value={10}>10 hrs/wk</option>
          <option value={15}>15 hrs/wk</option>
          <option value={20}>20 hrs/wk</option>
          <option value={30}>30 hrs/wk</option>
        </select>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !role.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-obsidian-800 disabled:text-slate-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-all"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing...' : 'Synthesize Roadmap'}</span>
        </button>
      </form>
    </div>
  );
};
