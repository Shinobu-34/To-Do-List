import type { Task, ActiveFilter } from '../types';
import TaskItem from './TaskItem';
import EmptyState from './EmptyState';

interface TaskListProps {
  groupedTasks: { label: string; tasks: Task[] }[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onPlay?: (task: Task) => void;
  activeFilter: ActiveFilter;
  searchQuery: string;
}

export default function TaskList({
  groupedTasks,
  onToggle,
  onDelete,
  onUpdate,
  onPlay,
  activeFilter,
  searchQuery,
}: TaskListProps) {
  const isEmpty = groupedTasks.length === 0 || groupedTasks.every((g) => g.tasks.length === 0);

  if (isEmpty) {
    return <EmptyState activeFilter={activeFilter} searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {groupedTasks.map((group) => (
        <section key={group.label} aria-label={`${group.label} tasks`}>
          {/* Group header */}
          <div className="flex items-center gap-3 mb-3">
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                group.label === 'Overdue'
                  ? 'text-rose-500'
                  : group.label === 'Today'
                  ? 'text-brand-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {group.label}
            </h2>
            <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            <span className="text-xs tabular-nums font-semibold text-gray-400 dark:text-gray-500">
              {group.tasks.length}
            </span>
          </div>

          {/* Task cards */}
          <div className="space-y-2">
            {group.tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onPlay={onPlay}
                index={index}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
