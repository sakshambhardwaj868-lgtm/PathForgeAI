import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeDetailPanel } from '../components/graph/NodeDetailPanel';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { getClientOfflineFallback } from '../data/fallbackService';
import { CareerRoadmap } from '../types/roadmap';

describe('Phase 6.5 — Detailed Course Curriculum & Roadmap Depth (Frontend)', () => {
  beforeEach(() => {
    useRoadmapStore.getState().clearRoadmap();
  });

  it('loads the rich Full Stack Climate Tech fallback with 10+ milestones and structured curriculum', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    expect(fallback.milestones.length).toBeGreaterThanOrEqual(10);
    expect(fallback.edges.length).toBeGreaterThanOrEqual(10);

    // Verify root milestone has full curriculum
    const rootMs = fallback.milestones[0];
    expect(rootMs.actionableData.whyItMatters).toBeDefined();
    expect(rootMs.actionableData.difficultyLevel).toBe('Beginner');
    expect(rootMs.actionableData.topics?.length).toBeGreaterThanOrEqual(2);
    expect(rootMs.actionableData.lessons?.length).toBeGreaterThanOrEqual(2);
    expect(rootMs.actionableData.practicalExercises?.length).toBeGreaterThanOrEqual(1);
    expect(rootMs.actionableData.quizQuestions?.length).toBeGreaterThanOrEqual(1);
    expect(rootMs.actionableData.completionCriteria?.length).toBeGreaterThanOrEqual(2);

    // Verify lesson structure
    const lesson = rootMs.actionableData.lessons![0];
    expect(lesson.title).toBeDefined();
    expect(lesson.durationMinutes).toBeGreaterThan(0);
    expect(lesson.explanation).toBeDefined();
    expect(lesson.studySteps.length).toBeGreaterThan(0);
    expect(lesson.practiceActivity).toBeDefined();
    expect(lesson.completionCriteria).toBeDefined();
  });

  it('loads the rich FinTech UI/UX Designer fallback with 10+ milestones and domain-specific curriculum', () => {
    const fallback = getClientOfflineFallback('Fintech Mobile & Web UI/UX Designer');
    expect(fallback.milestones.length).toBeGreaterThanOrEqual(10);
    expect(fallback.targetRole).toContain('UI/UX');

    const firstMs = fallback.milestones[0];
    expect(firstMs.actionableData.whyItMatters).toContain('financial');
    expect(firstMs.actionableData.topics?.length).toBeGreaterThanOrEqual(2);
    expect(firstMs.actionableData.lessons?.length).toBeGreaterThanOrEqual(1);
    expect(firstMs.actionableData.weekendProject.tasks?.length).toBeGreaterThanOrEqual(3);
  });

  it('loads the rich Generative AI Systems fallback with 10+ milestones and deep technical curriculum', () => {
    const fallback = getClientOfflineFallback('Generative AI Systems Engineer');
    expect(fallback.milestones.length).toBeGreaterThanOrEqual(10);

    const firstMs = fallback.milestones[0];
    expect(firstMs.actionableData.whyItMatters).toBeDefined();
    expect(firstMs.actionableData.topics?.length).toBeGreaterThanOrEqual(2);
    expect(firstMs.actionableData.lessons?.length).toBeGreaterThanOrEqual(1);
    expect(firstMs.actionableData.quizQuestions?.length).toBeGreaterThanOrEqual(1);
  });

  it('renders curriculum tab, lessons, study steps, and practice activities in NodeDetailPanel', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);
    useRoadmapStore.getState().selectMilestone('ms-fs-1');

    render(<NodeDetailPanel />);

    // Check title and Why It Matters callout
    expect(screen.getByText('Modern Web Architecture & Semantic Layouts')).toBeInTheDocument();
    expect(screen.getByText('Why This Skill Matters')).toBeInTheDocument();

    // Check tab pills
    expect(screen.getByText(/Curriculum \(/i)).toBeInTheDocument();
    expect(screen.getByText('Project & Exercises')).toBeInTheDocument();
    expect(screen.getByText(/Quiz & Interview \(/i)).toBeInTheDocument();

    // Check lesson details
    expect(screen.getByText('Semantic Document Trees & Accessible Controls')).toBeInTheDocument();
    expect(screen.getByText(/~45 mins/i)).toBeInTheDocument();
    expect(screen.getAllByText('Actionable Study Steps').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hands-On Practice Activity').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Proof of Mastery:/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders interactive quiz questions with option selection and feedback explanations', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup');
    useRoadmapStore.getState().setRoadmap(fallback);
    useRoadmapStore.getState().selectMilestone('ms-fs-1');

    render(<NodeDetailPanel />);

    // Click Quiz & Interview tab
    const quizTab = screen.getByText(/Quiz & Interview/i);
    fireEvent.click(quizTab);

    // Verify quiz question is present
    expect(screen.getByText(/Which CSS Grid property creates a fluid grid/i)).toBeInTheDocument();

    // Select the correct option A
    const optA = screen.getByText(/repeat\(auto-fit, minmax\(250px, 1fr\)\)/i);
    fireEvent.click(optA);

    // Verify feedback explanation appears
    expect(screen.getByText(/✓ Correct Answer!/i)).toBeInTheDocument();
    expect(screen.getByText(/dynamically fills available row space/i)).toBeInTheDocument();
  });

  it('supports backwards compatibility with legacy roadmaps lacking curriculum fields', () => {
    const legacyRoadmap: CareerRoadmap = {
      id: 'legacy-roadmap-v1',
      targetRole: 'Legacy DevOps Engineer',
      targetCompanyType: 'Enterprise',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
      totalEstimatedWeeks: 10,
      source: 'cached_fallback',
      phases: [{ id: 'p1', title: 'Phase 1', description: 'Core', order: 1 }],
      intermediateRoles: [],
      milestones: [
        {
          id: 'ms-legacy-1',
          title: 'Linux Fundamentals',
          category: 'foundation',
          phaseId: 'p1',
          estimatedHours: 20,
          prerequisiteIds: [],
          status: 'available',
          isKnown: false,
          actionableData: {
            learningObjectives: ['Master bash scripting', 'Understand permissions'],
            weekendProject: {
              title: 'Automated Backup Script',
              description: 'Bash backup utility',
              deliverables: ['bash script'],
              estimatedHours: 8,
            },
            curatedResources: [
              {
                title: 'Bash Guide',
                type: 'documentation',
                searchQueryOrUrl: 'https://gnu.org/bash',
                description: 'Official bash manual',
              },
            ],
            interviewChallenges: [
              {
                question: 'What is the difference between hard and soft links in Linux?',
                idealAnswerKey: 'Hard links point directly to the inode; soft links point to the file path.',
                difficulty: 'Easy',
              },
            ],
          },
        },
      ],
      edges: [],
      createdAt: new Date().toISOString(),
    };

    useRoadmapStore.getState().setRoadmap(legacyRoadmap);
    useRoadmapStore.getState().selectMilestone('ms-legacy-1');

    render(<NodeDetailPanel />);

    // Legacy fields render without any runtime errors
    expect(screen.getByText('Linux Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Automated Backup Script')).toBeInTheDocument();
    expect(screen.getByText('Bash Guide')).toBeInTheDocument();
    expect(screen.getByText(/What is the difference between hard and soft links/i)).toBeInTheDocument();
  });

  it('calculates total roadmap hours and timeline accurately across 10+ milestones', () => {
    const fallback = getClientOfflineFallback('Full Stack Developer at a Climate Tech Startup', 15);
    useRoadmapStore.getState().setRoadmap(fallback);

    const metrics = useRoadmapStore.getState().metrics;
    const expectedSum = fallback.milestones.reduce((acc, m) => acc + m.estimatedHours, 0);

    expect(metrics.totalHours).toBe(expectedSum);
    expect(metrics.remainingHours).toBe(expectedSum);
    expect(metrics.totalWeeks).toBe(Math.ceil(expectedSum / 15));
    expect(metrics.completedCount).toBe(0);
    expect(metrics.completionPercentage).toBe(0);

    // Toggle 1 milestone complete
    useRoadmapStore.getState().toggleMilestoneKnown(fallback.milestones[0].id);
    const updated = useRoadmapStore.getState().metrics;

    expect(updated.completedCount).toBe(1);
    expect(updated.completedHours).toBe(fallback.milestones[0].estimatedHours);
    expect(updated.remainingHours).toBe(expectedSum - fallback.milestones[0].estimatedHours);
    expect(updated.remainingHours + updated.completedHours).toBe(updated.totalHours);
  });
});
