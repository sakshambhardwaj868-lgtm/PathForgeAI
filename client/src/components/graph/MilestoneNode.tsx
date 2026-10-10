import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RoadmapMilestone, NodeStatus, MilestoneCategory } from '../../types/roadmap';
import { useRoadmapStore } from '../../store/useRoadmapStore';

interface MilestoneNodeData {
  milestone: RoadmapMilestone;
  targetPosition: Position;
  sourcePosition: Position;
}

export const MilestoneNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as MilestoneNodeData;
  const milestone = nodeData?.milestone;
  const targetPosition = nodeData?.targetPosition || Position.Top;
  const sourcePosition = nodeData?.sourcePosition || Position.Bottom;

  const selectedMilestoneId = useRoadmapStore((s) => s.selectedMilestoneId);
  const selectMilestone = useRoadmapStore((s) => s.selectMilestone);

  if (!milestone) {
    return (
      <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200">
        Invalid Node Data
      </div>
    );
  }

  const isSelected = selectedMilestoneId === milestone.id;

  // Status visual configurations
  const getStatusConfig = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          containerClass: 'border-emerald-500/70 bg-emerald-950/20 shadow-emerald-950/50',
          badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800',
        };
      case 'completed_with_warning':
        return {
          label: 'Gap Warning',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          containerClass: 'border-amber-500/70 bg-amber-950/20 shadow-amber-950/50',
          badgeClass: 'bg-amber-950 text-amber-400 border-amber-800',
        };
      case 'available':
        return {
          label: 'Ready to Learn',
          icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
          containerClass: 'border-cyan-500/60 bg-cyan-950/15 shadow-cyan-950/40 hover:border-cyan-400',
          badgeClass: 'bg-cyan-950 text-cyan-400 border-cyan-800',
        };
      case 'locked':
      default:
        return {
          label: 'Locked',
          icon: <Lock className="w-3.5 h-3.5 text-slate-500" />,
          containerClass: 'border-slate-800 bg-obsidian-900/90 opacity-75 hover:opacity-100',
          badgeClass: 'bg-slate-900 text-slate-400 border-slate-800',
        };
    }
  };

  const getCategoryBadgeClass = (category: MilestoneCategory) => {
    switch (category) {
      case 'foundation':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'core-skill':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'tooling':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80';
      case 'capstone':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'career-prep':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const statusConfig = getStatusConfig(milestone.status);

  return (
    <div
      onClick={() => selectMilestone(milestone.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          selectMilestone(milestone.id);
        }
      }}
      className={`relative w-[280px] p-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer text-left select-none ${
        statusConfig.containerClass
      } ${
        isSelected
          ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-500/20 scale-[1.02]'
          : 'hover:shadow-xl hover:translate-y-[-2px]'
      }`}
    >
      {/* Dependency Input Handle */}
      <Handle
        type="target"
        position={targetPosition}
        className="!w-3 !h-3 !bg-slate-600 !border-2 !border-slate-900 transition-colors hover:!bg-cyan-400"
      />

      {/* Header: Category and Status Pill */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
            milestone.category
          )}`}
        >
          {milestone.category.replace('-', ' ')}
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Milestone Title */}
      <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors">
        {milestone.title}
      </h3>

      {/* Weekend Project Preview */}
      {milestone.actionableData?.weekendProject?.title && (
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2.5 truncate">
          <Layers className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span className="truncate italic">
            Project: {milestone.actionableData.weekendProject.title}
          </span>
        </div>
      )}

      {/* Footer Info: Estimated Hours & Prerequisites count */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          {milestone.estimatedHours} hrs
        </span>

        <span className="text-[10px] text-slate-500">
          {milestone.prerequisiteIds?.length === 0
            ? 'Root Foundation'
            : `${milestone.prerequisiteIds.length} prereq${
                milestone.prerequisiteIds.length > 1 ? 's' : ''
              }`}
        </span>
      </div>

      {/* Dependency Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900 transition-colors hover:!bg-cyan-300"
      />
    </div>
  );
};
