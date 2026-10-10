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
  Award,
} from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { sanitizeResource } from '../../utils/resourceSanitizer';

export const NodeDetailPanel: React.FC = () => {
  const selectedMilestoneId = useRoadmapStore((s) => s.selectedMilestoneId);
  const selectMilestone = useRoadmapStore((s) => s.selectMilestone);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const toggleMilestoneKnown = useRoadmapStore((s) => s.toggleMilestoneKnown);

  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [completedDeliverables, setCompletedDeliverables] = useState<Record<string, boolean>>({});

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

  const actionableData = milestone.actionableData;
  const weekendProject = actionableData?.weekendProject;
  const curatedResources = actionableData?.curatedResources || [];
  const interviewChallenges = actionableData?.interviewChallenges || [];
  const learningObjectives = actionableData?.learningObjectives || [];

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
        className="fixed inset-y-0 right-0 z-50 md:relative md:inset-auto md:z-20 w-full sm:w-[480px] lg:w-[520px] bg-obsidian-900/95 border-l border-obsidian-800 backdrop-blur-xl h-full flex flex-col shadow-2xl transition-all duration-300 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-950/60 sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {milestone.category.replace('-', ' ')}
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

          {/* Section: Prerequisites & Dependency Tree */}
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

          {/* Section: Key Learning Objectives */}
          {learningObjectives.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Key Learning Objectives
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {learningObjectives.map((obj, i) => (
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

          {/* Section: Actionable Weekend Project Guidance */}
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

              {/* Step-by-Step Deliverables with interactive checklist */}
              {weekendProject.deliverables?.length > 0 && (
                <div className="pt-2 border-t border-obsidian-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
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

              {/* Portfolio Expected Outcome */}
              <div className="p-2.5 rounded-lg bg-obsidian-950/80 border border-cyan-900/30 flex items-start gap-2 text-[11px] text-cyan-200/90 leading-relaxed">
                <Award className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cyan-300 block">
                    Portfolio Deliverable:
                  </span>
                  Complete this sprint to showcase tangible production artifacts on your GitHub profile.
                </div>
              </div>
            </div>
          )}

          {/* Section: Learning Resources & Verified Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Curated Learning Resources ({curatedResources.length})
              </h3>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Verified Safe Links
              </span>
            </div>

            {curatedResources.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-obsidian-950/60 p-3 rounded-lg border border-obsidian-800">
                No specific resources declared for this node. Use standard industry documentation.
              </p>
            ) : (
              <div className="space-y-2.5">
                {curatedResources.map((res, i) => {
                  const sanitized = sanitizeResource(res);
                  return (
                    <a
                      key={i}
                      href={sanitized.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-obsidian-800 hover:border-cyan-500/50 transition-all text-xs group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="group-hover:text-cyan-300 text-white font-bold flex items-center gap-1.5 truncate">
                          {sanitized.isCuratedSearch ? (
                            <Github className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          )}
                          <span className="truncate">{sanitized.title}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                      </div>

                      <p className="text-slate-400 text-[11px] leading-snug mb-2">
                        {sanitized.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-obsidian-850 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded border font-semibold ${sanitized.badgeColorClass}`}
                        >
                          {sanitized.badgeLabel}
                        </span>
                        <span className="text-slate-400 font-mono truncate max-w-[200px]">
                          {sanitized.displayUrl}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Technical Interview Preparation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Technical Interview Preparation ({interviewChallenges.length})
            </h3>

            {interviewChallenges.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-obsidian-950/60 p-3 rounded-lg border border-obsidian-800">
                No interview challenges for this foundational node.
              </p>
            ) : (
              <div className="space-y-3">
                {interviewChallenges.map((ic, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Interview Challenge #{i + 1}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          ic.difficulty === 'Hard'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : ic.difficulty === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {ic.difficulty}
                      </span>
                    </div>

                    <p className="text-slate-200 font-medium leading-relaxed">
                      {ic.question}
                    </p>

                    <button
                      onClick={() => toggleAnswerVisibility(i)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      <span>
                        {showAnswer[i] ? 'Hide Evaluation Answer' : 'Reveal Model Answer & Rubric'}
                      </span>
                      {showAnswer[i] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {showAnswer[i] && (
                      <div className="p-3 rounded-lg bg-obsidian-900 border border-cyan-900/60 text-slate-300 text-[11px] leading-relaxed space-y-1.5">
                        <span className="font-semibold text-cyan-400 block">
                          Model Evaluation Rubric:
                        </span>
                        <p>{ic.idealAnswerKey}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
