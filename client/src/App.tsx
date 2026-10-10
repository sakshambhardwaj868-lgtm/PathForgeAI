import { useEffect } from 'react';
import { RoadmapPromptBar } from './components/common/RoadmapPromptBar';
import { CareerGraphCanvas } from './components/graph/CareerGraphCanvas';
import { LoadingState } from './components/common/LoadingState';
import { EmptyState } from './components/common/EmptyState';
import { ErrorState } from './components/common/ErrorState';
import { useRoadmapStore } from './store/useRoadmapStore';

export default function App() {
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const isLoading = useRoadmapStore((s) => s.isLoading);
  const error = useRoadmapStore((s) => s.error);
  const generateRoadmap = useRoadmapStore((s) => s.generateRoadmap);

  // Automatically load initial roadmap on mount
  useEffect(() => {
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
      {/* Dynamic Header & Generation Control Bar */}
      <RoadmapPromptBar />

      {/* Main Interactive Graph Viewport */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {isLoading ? (
          <LoadingState />
        ) : error && !roadmap ? (
          <ErrorState
            message={error}
            onRetry={() =>
              generateRoadmap({
                targetRole: 'Full Stack Developer at a Climate Tech Startup',
                targetCompanyType: 'Clean Energy Series-A',
                experienceLevel: 'Beginner',
                weeklyCommitmentHours: 15,
              })
            }
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
