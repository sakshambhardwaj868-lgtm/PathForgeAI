import { useEffect } from 'react';
import { RoadmapPromptBar } from './components/common/RoadmapPromptBar';
import { SharedRoadmapHeader } from './components/share/SharedRoadmapHeader';
import { SharedLinkErrorView } from './components/share/SharedLinkErrorView';
import { CareerGraphCanvas } from './components/graph/CareerGraphCanvas';
import { LoadingState } from './components/common/LoadingState';
import { EmptyState } from './components/common/EmptyState';
import { ErrorState } from './components/common/ErrorState';
import { AuthModal } from './components/auth/AuthModal';
import { MyRoadmapsDashboard } from './components/dashboard/MyRoadmapsDashboard';
import { useRoadmapStore } from './store/useRoadmapStore';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const isLoading = useRoadmapStore((s) => s.isLoading);
  const error = useRoadmapStore((s) => s.error);
  const isReadOnly = useRoadmapStore((s) => s.isReadOnly);
  const shareError = useRoadmapStore((s) => s.shareError);
  const currentView = useRoadmapStore((s) => s.currentView);
  const setCurrentView = useRoadmapStore((s) => s.setCurrentView);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);
  const retryLastGeneration = useRoadmapStore((s) => s.retryLastGeneration);
  const loadSharedRoadmap = useRoadmapStore((s) => s.loadSharedRoadmap);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Automatically check authentication session and load initial or shared roadmap on mount
  useEffect(() => {
    // 1. Check for shared roadmap URL: /share/:token or ?share=:token
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    let shareToken: string | null = null;

    if (pathname.startsWith('/share/')) {
      const parts = pathname.replace('/share/', '').split('/');
      shareToken = parts[0]?.trim() || null;
    } else if (searchParams.get('share')) {
      shareToken = searchParams.get('share')?.trim() || null;
    }

    if (shareToken) {
      loadSharedRoadmap(shareToken);
      return;
    }

    // 2. Check for dashboard view in pathname or query
    if (pathname === '/dashboard' || searchParams.get('view') === 'dashboard') {
      setCurrentView('dashboard');
    }

    // 3. Otherwise initialize user session & default starter roadmap
    checkAuth();

    if (!roadmap) {
      generateRoadmap({
        targetRole: 'Full Stack Developer at a Climate Tech Startup',
        targetCompanyType: 'Clean Energy Series-A',
        experienceLevel: 'Beginner',
        weeklyCommitmentHours: 15,
      });
    }
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-obsidian-950 text-slate-100 overflow-hidden font-sans">
      {/* Authentication Modal */}
      <AuthModal />

      {/* Header Bar: Shared Read-Only Header OR Interactive Creator Header */}
      {isReadOnly ? <SharedRoadmapHeader /> : <RoadmapPromptBar />}

      {/* Main Viewport: Dashboard View OR Interactive Graph Canvas View */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {currentView === 'dashboard' ? (
          <MyRoadmapsDashboard onBackToSearch={() => setCurrentView('graph')} />
        ) : isLoading ? (
          <LoadingState />
        ) : shareError ? (
          <SharedLinkErrorView message={shareError} />
        ) : error && !roadmap ? (
          <ErrorState
            message={error}
            onRetry={retryLastGeneration}
          />
        ) : !roadmap ? (
          <EmptyState />
        ) : (
          <CareerGraphCanvas />
        )}
      </main>
    </div>
  );
}
