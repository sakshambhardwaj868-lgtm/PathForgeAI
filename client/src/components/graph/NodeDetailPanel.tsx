import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Github,
  BookOpen,
  ExternalLink,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link2,
  CheckSquare,
  Square,
  ShieldCheck,
  Target,
  Wrench,
  BookMarked,
  Code2,
  BrainCircuit,
  FileCheck,
  Check,
  Flame,
  ListTodo,
  Lock,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { sanitizeResource } from '../../utils/resourceSanitizer';

type DetailTab = 'all' | 'curriculum' | 'practice' | 'quiz' | 'resources';

export const NodeDetailPanel: React.FC = () => {
  const selectedMilestoneId = useRoadmapStore((s) => s.selectedMilestoneId);
  const selectMilestone = useRoadmapStore((s) => s.selectMilestone);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const toggleMilestoneKnown = useRoadmapStore((s) => s.toggleMilestoneKnown);
  const isReadOnly = useRoadmapStore((s) => s.isReadOnly);

  const [activeTab, setActiveTab] = useState<DetailTab>('all');
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [completedDeliverables, setCompletedDeliverables] = useState<Record<string, boolean>>({});
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [completedCriteria, setCompletedCriteria] = useState<Record<string, boolean>>({});
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [showExerciseHints, setShowExerciseHints] = useState<Record<string, boolean>>({});

  // Keyboard accessibility: Escape key closes the drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectMilestone(null);
      }
    },
    [selectMilestone]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!roadmap || !selectedMilestoneId) {
    return null;
  }

  const milestone = roadmap.milestones.find((m) => m.id === selectedMilestoneId);
  if (!milestone) return null;

  // Find parent phase title if available
  const phase = roadmap.phases?.find((p) => p.id === milestone.phaseId);

  // Find prerequisite milestones
  const prerequisites = (milestone.prerequisiteIds || [])
    .map((prereqId) => roadmap.milestones.find((m) => m.id === prereqId))
    .filter(Boolean);

  const toggleAnswerVisibility = (idx: number) => {
    setShowAnswer((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleDeliverableCheck = (delivKey: string) => {
    setCompletedDeliverables((prev) => ({
      ...prev,
      [delivKey]: !prev[delivKey],
    }));
  };

  const toggleLessonCheck = (lessonKey: string) => {
    setCompletedLessons((prev) => ({
      ...prev,
      [lessonKey]: !prev[lessonKey],
    }));
  };

  const toggleCriteriaCheck = (critKey: string) => {
    setCompletedCriteria((prev) => ({
      ...prev,
      [critKey]: !prev[critKey],
    }));
  };

  const toggleHintVisibility = (exId: string) => {
    setShowExerciseHints((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const actionableData = milestone.actionableData;
  const weekendProject = actionableData?.weekendProject;
  const curatedResources = actionableData?.curatedResources || [];
  const interviewChallenges = actionableData?.interviewChallenges || [];
  const learningObjectives = actionableData?.learningObjectives || [];
  const learningOutcomes = actionableData?.learningOutcomes || learningObjectives;
  const whyItMatters = actionableData?.whyItMatters;
  const difficultyLevel = actionableData?.difficultyLevel || 'Intermediate';
  const topics = actionableData?.topics || [];
  const lessons = actionableData?.lessons || [];
  const practicalExercises = actionableData?.practicalExercises || [];
  const quizQuestions = actionableData?.quizQuestions || [];
  const completionCriteria = actionableData?.completionCriteria || [];

  const showCurriculum = activeTab === 'all' || activeTab === 'curriculum';
  const showPractice = activeTab === 'all' || activeTab === 'practice';
  const showQuiz = activeTab === 'all' || activeTab === 'quiz';
  const showResources = activeTab === 'all' || activeTab === 'resources';

  return (
    <>
      {/* Mobile Backdrop Overlay (visible only on screens < md) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        onClick={() => selectMilestone(null)}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Milestone Details: ${milestone.title}`}
        className="fixed inset-y-0 right-0 z-50 md:relative md:inset-auto md:z-20 w-full sm:w-[500px] lg:w-[560px] bg-obsidian-900/95 border-l border-obsidian-800 backdrop-blur-xl h-full flex flex-col shadow-2xl transition-all duration-300 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-950/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {milestone.category.replace('-', ' ')}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800">
              {difficultyLevel}
            </span>
            {phase && (
              <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-obsidian-800 border border-obsidian-700 hidden sm:inline">
                {phase.title}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {milestone.estimatedHours} hrs
            </span>
          </div>

          <button
            onClick={() => selectMilestone(null)}
            aria-label="Close milestone drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 py-2 border-b border-obsidian-800/80 bg-obsidian-950/40 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
          >
            All Content
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            Curriculum ({lessons.length})
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'practice'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Project & Exercises
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Quiz & Interview ({quizQuestions.length + interviewChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'resources'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Resources
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
          {/* Milestone Title & Completion Status Header Card */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white leading-tight">
              {milestone.title}
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-800 shadow-sm">
              <div className="flex items-center gap-2 text-xs">
                {milestone.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Completed Milestone</span>
                  </>
                ) : milestone.status === 'completed_with_warning' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-semibold">Completed (Dependency Gap)</span>
                  </>
                ) : milestone.status === 'available' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 font-semibold">Ready to Learn</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 font-medium">Locked (Prerequisites Pending)</span>
                  </>
                )}
              </div>

              {isReadOnly ? (
                <span
                  title="Milestone progress editing is disabled in shared read-only view"
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-obsidian-850 border border-obsidian-750 text-slate-400 flex items-center gap-1.5 shadow-sm"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  Read-Only Link
                </span>
              ) : (
                <button
                  onClick={() => toggleMilestoneKnown(milestone.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all shadow-sm ${
                    milestone.isKnown
                      ? 'bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                  }`}
                >
                  {milestone.isKnown ? 'Mark as Incomplete' : 'Mark as Known'}
                </button>
              )}
            </div>

            {milestone.status === 'completed_with_warning' && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200/90 flex items-start gap-2.5 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300 block">
                    Prerequisite Dependency Gap:
                  </span>
                  You marked this milestone as completed, but one or more of its declared prerequisites are not yet completed.
                  Your completed work is safely preserved! Review and acquire the open prerequisites below to close the gap.
                </div>
              </div>
            )}
          </div>

          {/* Section: Why This Skill Matters */}
          {whyItMatters && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-obsidian-950 border border-cyan-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                Why This Skill Matters
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {whyItMatters}
              </p>
            </div>
          )}

          {/* SECTION: CURRICULUM (Outcomes, Topics & Step-by-Step Lessons) */}
          {showCurriculum && (
            <div className="space-y-6">
              {/* Learning Outcomes */}
              {learningOutcomes.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    Key Learning Outcomes ({learningOutcomes.length})
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {learningOutcomes.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 bg-obsidian-950/60 p-2.5 rounded-lg border border-obsidian-800/80 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Core Topics & Subtopics */}
              {topics.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Syllabus Topics & Core Subtopics
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 rounded-xl bg-obsidian-950/80 border border-obsidian-800 space-y-2"
                      >
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {topic.title}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {topic.subtopics.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-obsidian-900 text-slate-300 border border-obsidian-800"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Lessons */}
              {lessons.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
                      Step-by-Step Lessons ({lessons.length})
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {Object.keys(completedLessons).filter((k) => k.startsWith(`${milestone.id}-`)).length} / {lessons.length} complete
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {lessons.map((lesson, lIdx) => {
                      const lessonKey = `${milestone.id}-lesson-${lesson.id || lIdx}`;
                      const isDone = !!completedLessons[lessonKey];

                      return (
                        <div
                          key={lesson.id || lIdx}
                          className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-800/80'
                              : 'bg-obsidian-950/90 border-obsidian-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                                  Lesson {lIdx + 1}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  ~{lesson.durationMinutes || 45} mins
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white">
                                {lesson.title}
                              </h4>
                            </div>

                            <button
                              onClick={() => toggleLessonCheck(lessonKey)}
                              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                                isDone
                                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                                  : 'bg-obsidian-900 text-slate-400 hover:text-white border-obsidian-800'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Done
                                </>
                              ) : (
                                <>Mark Studied</>
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed bg-obsidian-900/60 p-2.5 rounded-lg border border-obsidian-800/60">
                            {lesson.explanation}
                          </p>

                          {/* Actionable Study Steps */}
                          {lesson.studySteps?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <ListTodo className="w-3 h-3 text-cyan-400" />
                                Actionable Study Steps
                              </span>
                              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                                {lesson.studySteps.map((step, sIdx) => (
                                  <li key={sIdx} className="leading-snug">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Practice Activity */}
                          {lesson.practiceActivity && (
                            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-900/40 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                                <Code2 className="w-3 h-3" />
                                Hands-On Practice Activity
                              </span>
                              <p className="text-slate-200 leading-snug">
                                {lesson.practiceActivity}
                              </p>
                            </div>
                          )}

                          {/* Completion Criterion */}
                          {lesson.completionCriteria && (
                            <div className="p-2 rounded-lg bg-obsidian-900/80 border border-obsidian-800 flex items-start gap-2 text-[11px] text-emerald-300/90">
                              <FileCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-emerald-300">
                                  Proof of Mastery:
                                </span>{' '}
                                {lesson.completionCriteria}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: PRACTICE & PROJECT */}
          {showPractice && (
            <div className="space-y-6">
              {/* Practical Exercises */}
              {practicalExercises.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    Practical Hands-On Exercises ({practicalExercises.length})
                  </h3>

                  <div className="space-y-3">
                    {practicalExercises.map((ex, exIdx) => {
                      const exId = ex.id || `ex-${exIdx}`;
                      const showHint = !!showExerciseHints[exId];

                      return (
                        <div
                          key={exId}
                          className="p-3.5 rounded-xl bg-obsidian-950/80 border border-obsidian-800 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-white text-xs">
                              {ex.title}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-obsidian-900 text-purple-300 border border-purple-900/60">
                              {ex.difficulty || 'Intermediate'}
                            </span>
                          </div>

                          <p className="text-slate-300 leading-relaxed">
                            {ex.instructions}
                          </p>

                          {ex.hints && ex.hints.length > 0 && (
                            <div>
                              <button
                                onClick={() => toggleHintVisibility(exId)}
                                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {showHint ? 'Hide Hint' : 'View Practice Hint'}
                              </button>
                              {showHint && (
                                <ul className="mt-1.5 p-2 rounded-lg bg-obsidian-900 border border-obsidian-800 space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                                  {ex.hints.map((h, hIdx) => (
                                    <li key={hIdx}>{h}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {ex.solutionOverview && showHint && (
                            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-200">
                              <span className="font-semibold text-emerald-300">Solution Approach: </span>
                              {ex.solutionOverview}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actionable Weekend Project Guidance */}
              {weekendProject && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-obsidian-900 to-obsidian-950 border border-cyan-900/40 shadow-lg space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Actionable Weekend Project
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                      ~{weekendProject.estimatedHours} hrs effort
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {weekendProject.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {weekendProject.description}
                    </p>
                  </div>

                  {/* Step-by-Step Implementation Tasks */}
                  {weekendProject.tasks && weekendProject.tasks.length > 0 && (
                    <div className="pt-2 border-t border-obsidian-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                        Implementation Tasks
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300 pl-1">
                        {weekendProject.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="leading-snug">{task}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Step-by-Step Deliverables with interactive checklist */}
                  {weekendProject.deliverables?.length > 0 && (
                    <div className="pt-2 border-t border-obsidian-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                        Step-by-Step Deliverables
                      </span>
                      <div className="space-y-1.5">
                        {weekendProject.deliverables.map((deliv, i) => {
                          const delivKey = `${milestone.id}-deliv-${i}`;
                          const isDone = !!completedDeliverables[delivKey];
                          return (
                            <div
                              key={i}
                              onClick={() => toggleDeliverableCheck(delivKey)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all text-xs select-none ${
                                isDone
                                  ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-200 line-through opacity-80'
                                  : 'bg-obsidian-950/80 hover:bg-obsidian-850 border-obsidian-800 text-slate-200'
                              }`}
                            >
                              <span className="mt-0.5 flex-shrink-0 text-cyan-400">
                                {isDone ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </span>
                              <span className="leading-snug">{deliv}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Explicit Acceptance Criteria */}
                  {weekendProject.acceptanceCriteria && weekendProject.acceptanceCriteria.length > 0 && (
                    <div className="pt-2 border-t border-obsidian-800 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Project Acceptance Criteria
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {weekendProject.acceptanceCriteria.map((crit, cIdx) => (
                          <li key={cIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION: QUIZ & INTERVIEW PREP */}
          {showQuiz && (
            <div className="space-y-6">
              {/* Interactive Knowledge-Check Quiz */}
              {quizQuestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                    Knowledge-Check Quiz ({quizQuestions.length})
                  </h3>

                  <div className="space-y-3.5">
                    {quizQuestions.map((quiz, qIdx) => {
                      const selectedOpt = selectedQuizAnswers[qIdx];
                      const isAnswered = selectedOpt !== undefined;

                      return (
                        <div
                          key={qIdx}
                          className="p-3.5 rounded-xl bg-obsidian-950/90 border border-obsidian-800 space-y-3 text-xs"
                        >
                          <h4 className="font-bold text-white text-xs leading-snug">
                            {qIdx + 1}. {quiz.question}
                          </h4>

                          <div className="space-y-1.5">
                            {quiz.options.map((opt, optIdx) => {
                              const isSelected = selectedOpt === optIdx;
                              const isCorrect = quiz.correctAnswerIndex === optIdx;

                              let optClass = 'bg-obsidian-900 border-obsidian-800 text-slate-300 hover:bg-obsidian-850';
                              if (isAnswered) {
                                if (isCorrect) {
                                  optClass = 'bg-emerald-950/60 border-emerald-700 text-emerald-200 font-semibold';
                                } else if (isSelected && !isCorrect) {
                                  optClass = 'bg-rose-950/60 border-rose-700 text-rose-200';
                                } else {
                                  optClass = 'bg-obsidian-900/40 border-obsidian-800/40 text-slate-500 opacity-60';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  className={`w-full p-2.5 rounded-lg border text-left transition-all text-xs flex items-start gap-2 ${optClass}`}
                                >
                                  <span className="font-mono font-bold text-[10px] mt-0.5 text-slate-400">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="leading-snug">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {isAnswered && (
                            <div className="p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-800 text-[11px] leading-relaxed">
                              <span className="font-semibold text-cyan-300 block mb-0.5">
                                {selectedOpt === quiz.correctAnswerIndex ? '✓ Correct Answer!' : '✗ Explanation:'}
                              </span>
                              <span className="text-slate-300">{quiz.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Interview Preparation */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Technical Interview Challenges ({interviewChallenges.length})
                </h3>

                {interviewChallenges.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-obsidian-950/60 p-3 rounded-xl border border-obsidian-800">
                    No interview challenges for this foundational node.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {interviewChallenges.map((item, idx) => {
                      const isOpen = !!showAnswer[idx];
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-obsidian-950/80 border border-obsidian-800 space-y-2.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-200 leading-snug">
                              {item.question}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0 font-bold ${
                                item.difficulty === 'Easy'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : item.difficulty === 'Medium'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleAnswerVisibility(idx)}
                            className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors focus:outline-none"
                          >
                            {isOpen ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                Hide Evaluation Answer
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                Reveal Model Answer & Rubric
                              </>
                            )}
                          </button>

                          {isOpen && (
                            <div className="p-3 rounded-lg bg-obsidian-900 border border-cyan-900/40 text-slate-300 text-xs leading-relaxed space-y-2">
                              <div>
                                <span className="font-bold text-cyan-300 block mb-1">
                                  Principal Engineer Model Answer:
                                </span>
                                {item.idealAnswerKey}
                              </div>
                              {item.explanation && (
                                <p className="text-[11px] text-slate-400 border-t border-obsidian-800 pt-1.5">
                                  <span className="font-semibold text-slate-300">Context: </span>
                                  {item.explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: RESOURCES & CRITERIA */}
          {showResources && (
            <div className="space-y-6">
              {/* Curated Resources */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Curated Official Resources ({curatedResources.length})
                </h3>

                {curatedResources.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-obsidian-950/60 p-3 rounded-xl border border-obsidian-800">
                    No specific resources declared for this node.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {curatedResources.map((res, i) => {
                      const sanitized = sanitizeResource(res);
                      return (
                        <a
                          key={i}
                          href={sanitized.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start justify-between p-3 rounded-xl bg-obsidian-950/90 hover:bg-obsidian-850 border border-obsidian-800 hover:border-cyan-800/80 transition-all text-xs group"
                        >
                          <div className="space-y-1 pr-3">
                            <div className="flex items-center gap-2">
                              {sanitized.isCuratedSearch ? (
                                <Github className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                              ) : (
                                <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                              )}
                              <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {res.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {res.description}
                            </p>
                            <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-900 text-slate-400 border border-obsidian-800">
                              {sanitized.badgeLabel}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Prerequisites & Dependency Tree */}
              <div className="p-4 rounded-xl bg-obsidian-950/60 border border-obsidian-800 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  Prerequisite Dependencies ({prerequisites.length})
                </h3>
                {prerequisites.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-obsidian-900/60 p-2.5 rounded-lg border border-obsidian-800">
                    Root Foundation: No prerequisites required for this skill.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {prerequisites.map((p) => p && (
                      <div
                        key={p.id}
                        onClick={() => selectMilestone(p.id)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-800 cursor-pointer text-xs transition-colors group"
                      >
                        <span className="text-slate-200 group-hover:text-cyan-300 font-medium truncate">
                          {p.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            p.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestone Completion Readiness Criteria */}
              {completionCriteria.length > 0 && (
                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-emerald-900/40 space-y-2.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Milestone Completion Criteria Checklist
                  </span>
                  <div className="space-y-1.5">
                    {completionCriteria.map((crit, cIdx) => {
                      const critKey = `${milestone.id}-crit-${cIdx}`;
                      const isDone = !!completedCriteria[critKey];
                      return (
                        <div
                          key={cIdx}
                          onClick={() => toggleCriteriaCheck(critKey)}
                          className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all select-none ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-700 text-emerald-200 line-through'
                              : 'bg-obsidian-900 border-obsidian-800 text-slate-300 hover:bg-obsidian-850'
                          }`}
                        >
                          <span className="mt-0.5 flex-shrink-0 text-emerald-400">
                            {isDone ? (
                              <CheckSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </span>
                          <span className="leading-snug">{crit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
