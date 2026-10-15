import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Folder,
  Trash2,
  Play,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Search,
  RotateCcw,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  Lock,
  X,
  Share2,
} from 'lucide-react';
import { useAuthStore, SavedRoadmapSummary } from '../../store/useAuthStore';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { ShareModal } from '../share/ShareModal';

interface MyRoadmapsDashboardProps {
  onBackToSearch?: () => void;
}

export const MyRoadmapsDashboard: React.FC<MyRoadmapsDashboardProps> = ({ onBackToSearch }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const savedRoadmaps = useAuthStore((s) => s.savedRoadmaps);
  const isFetchingRoadmaps = useAuthStore((s) => s.isFetchingRoadmaps);
  const fetchRoadmapsError = useAuthStore((s) => s.fetchRoadmapsError);
  const isDeletingRoadmapId = useAuthStore((s) => s.isDeletingRoadmapId);
  const deleteError = useAuthStore((s) => s.deleteError);
  const fetchSavedRoadmaps = useAuthStore((s) => s.fetchSavedRoadmaps);
  const fetchRoadmapById = useAuthStore((s) => s.fetchRoadmapById);
  const deleteSavedRoadmap = useAuthStore((s) => s.deleteSavedRoadmap);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  const setRoadmap = useRoadmapStore((s) => s.setRoadmap);
  const setCurrentView = useRoadmapStore((s) => s.setCurrentView);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [openingRoadmapId, setOpeningRoadmapId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [roadmapToDelete, setRoadmapToDelete] = useState<SavedRoadmapSummary | null>(null);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedRoadmaps();
    }
  }, [isAuthenticated]);

  const handleBack = () => {
    if (onBackToSearch) {
      onBackToSearch();
    } else {
      setCurrentView('graph');
    }
  };

  const handleOpenRoadmap = async (item: SavedRoadmapSummary) => {
    const targetId = item.roadmapId || item._id;
    if (!targetId) return;

    setOpeningRoadmapId(targetId);
    setOpenError(null);

    try {
      const fullRoadmap = await fetchRoadmapById(targetId);
      if (fullRoadmap) {
        setRoadmap(fullRoadmap);
        setCurrentView('graph');
      } else {
        setOpenError(`Could not load saved roadmap "${item.targetRole}". Please retry.`);
      }
    } catch {
      setOpenError('Failed to retrieve roadmap data from server.');
    } finally {
      setOpeningRoadmapId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roadmapToDelete) return;
    const targetId = roadmapToDelete.roadmapId || roadmapToDelete._id;
    if (!targetId) return;

    setDeleteModalError(null);
    const success = await deleteSavedRoadmap(targetId);
    if (success) {
      setRoadmapToDelete(null);
    } else {
      setDeleteModalError(deleteError || 'Failed to delete roadmap from cloud. Please try again.');
    }
  };

  const filteredRoadmaps = useMemo(() => {
    return savedRoadmaps.filter((rm) => {
      const matchesSearch =
        rm.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.targetCompanyType?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel =
        levelFilter === 'All' ||
        rm.experienceLevel.toLowerCase() === levelFilter.toLowerCase();
      return matchesSearch && matchesLevel;
    });
  }, [savedRoadmaps, searchQuery, levelFilter]);

  // Format timestamp helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  // 1. Unauthenticated View
  if (!isAuthenticated) {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto bg-obsidian-950 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-obsidian-900 border border-obsidian-800 rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-5 shadow-lg shadow-cyan-950/50">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Sign in or create a free PathForge AI account to view your saved roadmaps, sync milestone progress to MongoDB Atlas, and access career skill trees from any device.
          </p>

          <div className="w-full flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-all cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Career Search</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-obsidian-950 flex flex-col font-sans">
      {/* Top Banner / Dashboard Navigation Header */}
      <div className="border-b border-obsidian-800 bg-obsidian-900/80 backdrop-blur px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Career Graph Canvas"
            aria-label="Back to Career Graph Canvas"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg font-bold text-white">My Roadmaps Dashboard</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {savedRoadmaps.length} Saved
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cloud-persisted career paths for <span className="text-slate-300 font-medium">{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Top Controls: Search, Filter, Refresh, Return */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search within roadmaps */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter saved roadmaps..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-obsidian-950 border border-obsidian-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-obsidian-950 border border-obsidian-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={() => fetchSavedRoadmaps()}
            disabled={isFetchingRoadmaps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-xs text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh saved roadmaps from MongoDB Atlas"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isFetchingRoadmaps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Return to Canvas Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Graph Canvas</span>
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Error notification banner if open failed */}
        {openError && (
          <div role="alert" className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{openError}</span>
            </div>
            <button onClick={() => setOpenError(null)} className="text-rose-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error banner if fetching roadmaps failed */}
        {fetchRoadmapsError && (
          <div role="alert" className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-950/60 border border-amber-800 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{fetchRoadmapsError}</span>
            </div>
            <button
              onClick={() => fetchSavedRoadmaps()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-900/80 hover:bg-amber-800 text-amber-100 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 2. Loading Skeleton View */}
        {isFetchingRoadmaps && savedRoadmaps.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="dashboard-loading-skeleton">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-obsidian-900/70 border border-obsidian-800 rounded-2xl p-5 flex flex-col gap-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-obsidian-800 rounded-md" />
                  <div className="h-5 w-16 bg-obsidian-800 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-obsidian-800 rounded-md" />
                <div className="h-4 w-1/2 bg-obsidian-800 rounded-md" />
                <div className="h-2 w-full bg-obsidian-800 rounded-full mt-2" />
                <div className="flex justify-between pt-2">
                  <div className="h-8 w-28 bg-obsidian-800 rounded-xl" />
                  <div className="h-8 w-8 bg-obsidian-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : savedRoadmaps.length === 0 ? (
          /* 3. Empty State View (No saved roadmaps) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-obsidian-900/40 border border-obsidian-800/80 rounded-2xl my-8">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-950/50">
              <Folder className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Saved Roadmaps Yet</h2>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
              You haven't saved any career roadmaps to your cloud account yet. Search any dream job in the prompt bar, then click <span className="text-cyan-400 font-semibold">"Save to Cloud"</span> to keep your milestone progress backed up.
            </p>

            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Start Career Search</span>
            </button>

            {/* Quick Suggestions for Empty State */}
            <div className="mt-8 pt-6 border-t border-obsidian-800/80 w-full max-w-lg">
              <span className="text-[11px] font-medium text-slate-400 mb-3 block">
                Or quickly explore a popular career roadmap:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { title: 'Climate Tech Full Stack', role: 'Full Stack Developer at a Climate Tech Startup' },
                  { title: 'Fintech UI/UX Designer', role: 'Fintech Mobile & Web UI/UX Designer' },
                  { title: 'Generative AI Engineer', role: 'Generative AI Systems Engineer' },
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={async () => {
                      await generateRoadmap({
                        targetRole: s.role,
                        targetCompanyType: 'Tech Company',
                        experienceLevel: 'Beginner',
                        weeklyCommitmentHours: 15,
                      });
                      setCurrentView('graph');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-800 hover:border-obsidian-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          /* 4. Filtered Empty State (Query returned zero results) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-obsidian-900/40 border border-obsidian-800 rounded-2xl my-8">
            <Search className="w-10 h-10 text-slate-500 mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No matching roadmaps</h3>
            <p className="text-xs text-slate-400 mb-4">
              No saved roadmaps match your query "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setLevelFilter('All');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* 5. Roadmap Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoadmaps.map((item) => {
              const targetId = item.roadmapId || (item._id as string);
              const isOpening = openingRoadmapId === targetId;
              const isDeleting = isDeletingRoadmapId === targetId;
              const percent = item.completionPercentage || 0;
              const totalMilestones = item.milestonesCount || (item.milestones?.length ?? 0);
              const completedCount = item.completedMilestonesCount ?? 0;

              return (
                <div
                  key={targetId}
                  className="bg-obsidian-900/90 hover:bg-obsidian-900 border border-obsidian-800 hover:border-cyan-800/60 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg shadow-obsidian-950 transition-all group"
                >
                  {/* Card Top: Badges & Delete Action */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Experience Level Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          item.experienceLevel === 'Advanced'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : item.experienceLevel === 'Intermediate'
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {item.experienceLevel}
                      </span>

                      {/* Source Badge */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-obsidian-950 text-slate-400 border border-obsidian-800">
                        {item.source === 'live_ai' ? 'Live AI' : 'Verified Fallback'}
                      </span>
                    </div>

                    {/* Delete Roadmap Button */}
                    <button
                      onClick={() => setRoadmapToDelete(item)}
                      disabled={isDeleting}
                      title="Delete saved roadmap"
                      aria-label={`Delete ${item.targetRole}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Body: Title, Company & Time Commitment */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {item.targetRole}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {item.targetCompanyType || 'Tech Industry'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {item.weeklyCommitmentHours || 15} hrs/wk
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        ~{item.totalEstimatedWeeks || 12} weeks
                      </span>
                    </div>
                  </div>

                  {/* Card Progress Section */}
                  <div className="bg-obsidian-950/60 border border-obsidian-800/80 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium">Progress</span>
                      <span className="font-semibold text-cyan-400">{percent}% Complete</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                      <span>{completedCount} of {totalMilestones} milestones done</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        {formatDate(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenRoadmap(item)}
                      disabled={isOpening}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                      aria-label={`Open ${item.targetRole}`}
                    >
                      <Play className={`w-3.5 h-3.5 fill-current ${isOpening ? 'animate-spin' : ''}`} />
                      <span>{isOpening ? 'Opening...' : 'Open Roadmap'}</span>
                    </button>

                    <button
                      onClick={async () => {
                        const loaded = await fetchRoadmapById(targetId);
                        if (loaded) {
                          setRoadmap(loaded);
                          setIsShareModalOpen(true);
                        }
                      }}
                      title="Share this roadmap"
                      aria-label={`Share ${item.targetRole}`}
                      className="p-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {roadmapToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Saved Roadmap?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">"{roadmapToDelete.targetRole}"</span>? It will be removed from your cloud account and all milestone progress will be lost.
            </p>

            {deleteModalError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {deleteModalError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRoadmapToDelete(null);
                  setDeleteModalError(null);
                }}
                disabled={Boolean(isDeletingRoadmapId)}
                className="px-4 py-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(isDeletingRoadmapId)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingRoadmapId ? 'Deleting...' : 'Delete Roadmap'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal Integration */}
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
};
