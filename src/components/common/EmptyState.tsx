import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm ${
        compact ? 'p-6 space-y-2.5' : 'p-8 sm:p-12 space-y-3.5 my-4'
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 shadow-inner">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      
      <div className="space-y-1 max-w-md">
        <h3 className="text-sm sm:text-base font-bold text-slate-200">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};
