import React, { useState } from 'react';
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
} from 'lucide-react';
import { useRoadmapStore } from '../../store/useRoadmapStore';

export const NodeDetailPanel: React.FC = () => {
  const selectedMilestoneId = useRoadmapStore((s) => s.selectedMilestoneId);
  const selectMilestone = useRoadmapStore((s) => s.selectMilestone);
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const toggleMilestoneKnown = useRoadmapStore((s) => s.toggleMilestoneKnown);

  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});

  if (!roadmap || !selectedMilestoneId) {
    return null;
  }

  const milestone = roadmap.milestones.find((m) => m.id === selectedMilestoneId);
  if (!milestone) return null;

  // Find prerequisite milestone titles
  const prerequisites = milestone.prerequisiteIds
    .map((prereqId) => roadmap.milestones.find((m) => m.id === prereqId))
    .filter(Boolean);

  const toggleAnswerVisibility = (idx: number) => {
    setShowAnswer((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <aside
      aria-label="Milestone Inspector"
      className="w-full md:w-[420px] bg-obsidian-900/95 border-l border-obsidian-800 backdrop-blur-xl h-full flex flex-col z-20 shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            {milestone.category.replace('-', ' ')}
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {milestone.estimatedHours} hrs
          </span>
        </div>
        <button
          onClick={() => selectMilestone(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
        {/* Title & Status */}
        <div>
          <h2 className="text-lg font-bold text-white mb-2 leading-tight">
            {milestone.title}
          </h2>

          <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-lg bg-obsidian-950 border border-obsidian-800">
            <div className="flex items-center gap-2 text-xs">
              {milestone.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Completed</span>
                </>
              ) : milestone.status === 'completed_with_warning' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-medium">Completed (Gap Warning)</span>
                </>
              ) : milestone.status === 'available' ? (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 font-medium">Ready to Learn</span>
                </>
              ) : (
                <>
                  <span className="text-slate-400">Locked (Prerequisites pending)</span>
                </>
              )}
            </div>

            <button
              onClick={() => toggleMilestoneKnown(milestone.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all shadow-sm ${
                milestone.isKnown
                  ? 'bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
              }`}
            >
              {milestone.isKnown ? 'Mark as Incomplete' : 'Mark as Known'}
            </button>
          </div>
        </div>

        {/* Prerequisites Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            Prerequisites ({prerequisites.length})
          </h3>
          {prerequisites.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-obsidian-950/60 p-2.5 rounded-lg border border-obsidian-800">
              None. This is an initial foundation milestone.
            </p>
          ) : (
            <div className="space-y-1.5">
              {prerequisites.map((p) => p && (
                <div
                  key={p.id}
                  onClick={() => selectMilestone(p.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-800 cursor-pointer text-xs transition-colors"
                >
                  <span className="text-slate-200 truncate font-medium">{p.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      p.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Objectives */}
        {milestone.actionableData?.learningObjectives?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Key Learning Objectives
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {milestone.actionableData.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 bg-obsidian-950/40 p-2 rounded border border-obsidian-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weekend Project */}
        {milestone.actionableData?.weekendProject && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-obsidian-900 to-obsidian-950 border border-obsidian-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Layers className="w-4 h-4 text-cyan-400" />
                Actionable Weekend Project
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-obsidian-800 px-2 py-0.5 rounded">
                ~{milestone.actionableData.weekendProject.estimatedHours}h
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5">
              {milestone.actionableData.weekendProject.title}
            </h4>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {milestone.actionableData.weekendProject.description}
            </p>

            {milestone.actionableData.weekendProject.deliverables?.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Deliverables:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {milestone.actionableData.weekendProject.deliverables.map((deliv, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Curated Resources */}
        {milestone.actionableData?.curatedResources?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              Safe Resources & GitHub Queries
            </h3>
            <div className="space-y-2">
              {milestone.actionableData.curatedResources.map((res, i) => (
                <a
                  key={i}
                  href={res.searchQueryOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded-lg bg-obsidian-950 hover:bg-obsidian-800/80 border border-obsidian-800 hover:border-cyan-500/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between text-cyan-400 font-semibold mb-1">
                    <span className="group-hover:text-cyan-300 flex items-center gap-1.5">
                      {res.type === 'github_search' ? (
                        <Github className="w-3.5 h-3.5" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5" />
                      )}
                      {res.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] leading-snug">{res.description}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Technical Interview Challenge */}
        {milestone.actionableData?.interviewChallenges?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Technical Interview Challenge
            </h3>
            <div className="space-y-3">
              {milestone.actionableData.interviewChallenges.map((ic, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Question #{i + 1}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        ic.difficulty === 'Hard'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : ic.difficulty === 'Medium'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {ic.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium mb-2">{ic.question}</p>

                  <button
                    onClick={() => toggleAnswerVisibility(i)}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <span>{showAnswer[i] ? 'Hide Answer Key' : 'Reveal Ideal Answer Key'}</span>
                    {showAnswer[i] ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showAnswer[i] && (
                    <div className="mt-2.5 p-2.5 rounded bg-obsidian-900 border border-cyan-900/60 text-slate-300 text-[11px] leading-relaxed">
                      <span className="font-semibold text-cyan-400 block mb-1">
                        Model Evaluation Rubric:
                      </span>
                      {ic.idealAnswerKey}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
