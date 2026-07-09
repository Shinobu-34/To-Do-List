import { useState, useMemo } from 'react';
import { Repeat, CheckCircle, Play } from 'lucide-react';
import type { Task } from '../types';
import { getTodayISO, isOverdue, PRIORITY_CONFIG } from '../utils';
import ConfettiButton from './ConfettiButton';

interface FocusCardsProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onPlay?: (task: Task) => void;
}

export default function FocusCards({ tasks, onComplete, onPlay }: FocusCardsProps) {
  const [skippedTaskIds, setSkippedTaskIds] = useState<Set<string>>(new Set());
  const [animatingOutId, setAnimatingOutId] = useState<string | null>(null);

  // Derive focus tasks
  const focusTasks = useMemo(() => {
    const todayISO = getTodayISO();
    
    // Filter out completed and skipped tasks
    let urgent = tasks.filter((t) => !t.isCompleted && !skippedTaskIds.has(t.id));

    // Filter to only those that are overdue, high priority, or due today
    urgent = urgent.filter((t) => 
      isOverdue(t.dueDate) || t.priority === 'HIGH' || t.dueDate === todayISO
    );

    // Sort by Overdue first, then High priority, then Due today
    urgent.sort((a, b) => {
      const aOverdue = isOverdue(a.dueDate);
      const bOverdue = isOverdue(b.dueDate);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;

      return a.dueDate.localeCompare(b.dueDate);
    });

    return urgent.slice(0, 3); // Max 3 cards
  }, [tasks, skippedTaskIds]);

  if (focusTasks.length === 0) return null;

  const handleSkip = (taskId: string) => {
    setSkippedTaskIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  };

  const handleCompleteClick = (taskId: string) => {
    setAnimatingOutId(taskId);
    // Wait for the animation to play before propagating upwards
    setTimeout(() => {
      onComplete(taskId);
      setAnimatingOutId(null);
    }, 400); // 400ms CSS transition
  };

  return (
    <div className="mb-8 animate-fade-in">
      <h2 className="text-sm font-semibold tracking-wide text-brand-500 mb-3 ml-1 flex items-center gap-2">
        <span role="img" aria-label="lightning">⚡</span> Quick Wins
      </h2>
      <div className="flex overflow-x-auto snap-x scrollbar-none gap-4 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {focusTasks.map((task) => {
          const isOverdueTask = isOverdue(task.dueDate);
          const isHigh = task.priority === 'HIGH';
          
          let badgeText = "🎯 Focus";
          if (isOverdueTask) badgeText = "⏰ Overdue!";
          else if (isHigh) badgeText = "🔥 Top Priority";
          else if (task.priority === 'LOW') badgeText = "✨ Easy Win";

          const isAnimatingOut = animatingOutId === task.id;
          const borderGlow = isHigh ? 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)] border-rose-500/30' : 'border-slate-700/50';

          return (
            <div
              key={task.id}
              className={`
                relative flex flex-col justify-between p-4 rounded-2xl snap-center shrink-0 min-w-[260px] max-w-[300px]
                bg-slate-800/60 dark:bg-surface-dark-card/80 backdrop-blur-md
                border ${borderGlow}
                transition-all duration-400 ease-out
                ${isAnimatingOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100'}
              `}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 self-start px-2 py-0.5 rounded-full">
                    {badgeText}
                  </span>
                  <h3 className={`text-base font-semibold text-white leading-tight ${isAnimatingOut ? 'line-through text-gray-500' : ''} transition-all duration-300`}>
                    {task.title}
                  </h3>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {onPlay && (
                    <button
                      type="button"
                      onClick={() => onPlay(task)}
                      className="p-1.5 text-brand-400 hover:text-white bg-white/5 hover:bg-brand-500 rounded-full transition-colors"
                      title="Start Focus Session"
                    >
                      <Play size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSkip(task.id)}
                    className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                    title="Vibe Shift (Skip)"
                  >
                    <Repeat size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[task.priority].bg}`} />
                  <span className="text-xs text-gray-300 font-medium">{PRIORITY_CONFIG[task.priority].label}</span>
                </div>
                
                {/* Complete Button */}
                <ConfettiButton onComplete={() => handleCompleteClick(task.id)}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:scale-110 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)] transition-all duration-200">
                    <CheckCircle size={18} strokeWidth={2.5} />
                  </div>
                </ConfettiButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
