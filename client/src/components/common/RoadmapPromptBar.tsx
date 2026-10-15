import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  Zap,
  ShieldCheck,
  Cloud,
  CloudUpload,
  LogIn,
  LogOut,
  User as UserIcon,
  Folder,
  Check,
  Share2,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SkillLevel } from '../../types/roadmap';
import { ShareModal } from '../share/ShareModal';

const PRESETS = [
  {
    role: 'Full Stack Developer at a Climate Tech Startup',
    company: 'Clean Energy & Carbon Analytics',
    level: 'Beginner' as SkillLevel,
    hours: 15,
    label: 'Climate Tech Full Stack',
  },
  {
    role: 'Fintech Mobile & Web UI/UX Designer',
    company: 'Neo-bank & Payment Infrastructure',
    level: 'Intermediate' as SkillLevel,
    hours: 20,
    label: 'Fintech UI/UX Designer',
  },
  {
    role: 'Generative AI Systems Engineer',
    company: 'Autonomous Agent Platform',
    level: 'Advanced' as SkillLevel,
    hours: 25,
    label: 'Generative AI Engineer',
  },
];

export const RoadmapPromptBar: React.FC = () => {
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const isLoading = useRoadmapStore((s) => s.isLoading);
  const storeError = useRoadmapStore((s) => s.error);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);
  const isReadOnly = useRoadmapStore((s) => s.isReadOnly);
  const setWeeklyCommitmentHours = useRoadmapStore((s) => s.setWeeklyCommitmentHours);
  const currentView = useRoadmapStore((s) => s.currentView);
  const setCurrentView = useRoadmapStore((s) => s.setCurrentView);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isSavingToCloud = useAuthStore((s) => s.isSavingToCloud);
  const lastSavedAt = useAuthStore((s) => s.lastSavedAt);
  const savedRoadmaps = useAuthStore((s) => s.savedRoadmaps);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);
  const saveRoadmapToCloud = useAuthStore((s) => s.saveRoadmapToCloud);

  const [role, setRole] = useState<string>(roadmap?.targetRole || '');
  const [company, setCompany] = useState<string>('Innovative Tech Company');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [hours, setHours] = useState<number>(15);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Synchronize input fields when an active or saved roadmap changes
  useEffect(() => {
    if (roadmap?.targetRole && roadmap.targetRole !== role) {
      setRole(roadmap.targetRole);
    }
    if (roadmap?.weeklyCommitmentHours && roadmap.weeklyCommitmentHours !== hours) {
      setHours(roadmap.weeklyCommitmentHours);
    }
    if (roadmap?.experienceLevel && roadmap.experienceLevel !== level) {
      setLevel(roadmap.experienceLevel);
    }
  }, [roadmap?.targetRole, roadmap?.weeklyCommitmentHours, roadmap?.experienceLevel]);

  const validateInput = (inputRole: string): string | null => {
    const trimmed = inputRole.trim();
    if (!trimmed) {
      return 'Please enter a career goal (minimum 3 characters).';
    }
    if (trimmed.length < 3) {
      return 'Career goal must be at least 3 characters long.';
    }
    if (trimmed.length > 100) {
      return 'Career goal must not exceed 100 characters.';
    }
    return null;
  };

  const executeSearch = async (targetRole: string, targetCompany: string, targetLevel: SkillLevel, targetHours: number) => {
    if (isLoading) return;

    const error = validateInput(targetRole);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    await generateRoadmap({
      targetRole: targetRole.trim(),
      targetCompanyType: targetCompany.trim() || 'Innovative Tech Company',
      experienceLevel: targetLevel,
      weeklyCommitmentHours: targetHours,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeSearch(role, company, level, hours);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = async (preset: typeof PRESETS[0]) => {
    setRole(preset.role);
    setCompany(preset.company);
    setLevel(preset.level);
    setHours(preset.hours);
    setValidationError(null);

    await executeSearch(preset.role, preset.company, preset.level, preset.hours);
  };

  const activeErrorMessage = validationError || (storeError && roadmap ? storeError : null);

  return (
    <div
      aria-label="Roadmap Generation Header"
      className="border-b border-obsidian-800 bg-obsidian-900/95 backdrop-blur-md px-4 py-3 flex flex-col gap-3 z-30"
    >
      {/* Top Row: App Title, Status Badges & Cloud/Auth Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-800/80 rounded-xl text-cyan-400 shadow-sm shadow-cyan-950">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              PathForge AI
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Phase 10 My Roadmaps
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Reverse-Engineered Career Graph &bull; Universal Live AI Career Roadmaps
            </p>
          </div>
        </div>

        {/* Right Action Tools: Source Badge, Cloud Save, Share, Auth */}
        <div className="flex items-center gap-2">
          {/* Source Badge if loaded */}
          {roadmap && (
            <span
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] border ${
                roadmap.source === 'live_ai'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Source:{' '}
              {roadmap.source === 'live_ai'
                ? roadmap.modelUsed
                  ? `Live AI (${roadmap.modelUsed})`
                  : 'Live Gemini AI'
                : 'Verified Fallback'}
            </span>
          )}

          {/* Cloud Save Action */}
          {roadmap && (
            <button
              onClick={() => saveRoadmapToCloud(roadmap)}
              disabled={isSavingToCloud}
              title={isAuthenticated ? 'Save current roadmap to MongoDB Atlas' : 'Log in to persist to cloud'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-xs text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingToCloud ? (
                <CloudUpload className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ) : lastSavedAt ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline">
                {isSavingToCloud ? 'Saving...' : lastSavedAt ? `Saved (${lastSavedAt})` : 'Save to Cloud'}
              </span>
            </button>
          )}

          {/* Share Action */}
          {roadmap && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              title="Generate secure shareable link for this roadmap"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* Navigation Toggle: Graph Canvas vs My Roadmaps Dashboard */}
          <button
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'graph' : 'dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                : 'bg-obsidian-950 hover:bg-obsidian-800 border-obsidian-700 text-slate-200'
            }`}
            title={
              isAuthenticated
                ? 'View and manage your saved career roadmaps'
                : 'Sign in to access your saved roadmaps'
            }
            aria-label="My Roadmaps"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-medium">My Roadmaps</span>
            {isAuthenticated && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {savedRoadmaps.length}
              </span>
            )}
          </button>

          {/* User Authentication Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-medium"
                title={`Logged in as ${user.email}`}
              >
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[100px] truncate">{user.name || user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-obsidian-800 transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Universal Career Search Input & Primary Controls */}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* Prominent Career Search Input */}
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search any career, e.g. Data Scientist, Cloud Architect, Cybersecurity Engineer"
            aria-label="Search any career, e.g. Data Scientist, Cloud Architect, Cybersecurity Engineer"
            maxLength={100}
            disabled={isLoading}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-obsidian-950 border border-obsidian-700 hover:border-obsidian-600 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 shadow-inner transition-all disabled:opacity-60"
          />
          {role.trim().length > 0 && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setRole('');
                if (validationError) setValidationError(null);
              }}
              aria-label="Clear career input"
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Experience Level & Hours Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Level selector */}
          <select
            value={level}
            aria-label="Experience Level"
            disabled={isLoading}
            onChange={(e) => setLevel(e.target.value as SkillLevel)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-obsidian-950 border border-obsidian-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-60 transition-colors"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Hours selector */}
          <select
            value={hours}
            aria-label="Weekly Study Commitment"
            disabled={isLoading}
            onChange={(e) => {
              const newHours = Number(e.target.value);
              setHours(newHours);
              if (roadmap && !isReadOnly) {
                setWeeklyCommitmentHours(newHours);
              }
            }}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-obsidian-950 border border-obsidian-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-60 transition-colors"
          >
            <option value={10}>10 hrs/wk</option>
            <option value={15}>15 hrs/wk</option>
            <option value={20}>20 hrs/wk</option>
            <option value={30}>30 hrs/wk</option>
          </select>

          {/* Prominent Generate Roadmap CTA Button */}
          <button
            type="submit"
            aria-label="Generate Roadmap"
            disabled={isLoading || !role.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-obsidian-800 disabled:to-obsidian-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-cyan-950/60 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-300' : 'text-cyan-200'}`} />
            <span>{isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}</span>
          </button>
        </div>
      </form>

      {/* Quick Suggestions & Optional Presets Row */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Quick Suggestions:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map((p, idx) => {
            const isSelected = roadmap?.targetRole === p.role;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                disabled={isLoading}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm font-semibold'
                    : 'bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border-obsidian-800 hover:border-obsidian-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Feedback & Error State with Retry */}
      {activeErrorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{activeErrorMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || !role.trim()}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="p-1 rounded-md text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Share Roadmap Modal */}
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
};
