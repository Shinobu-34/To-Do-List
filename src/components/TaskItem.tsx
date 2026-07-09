import { useState } from 'react';
import { Check, Trash2, Calendar, ChevronDown, Pencil, Flag, Play } from 'lucide-react';
import type { Task, PriorityLevel } from '../types';
import { formatDate, isOverdue, PRIORITY_CONFIG, getCategoryColor, DEFAULT_CATEGORIES } from '../utils';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onPlay?: (task: Task) => void;
  index: number;
}

// Build priority options with colored dots
const PRIORITY_OPTIONS = [
  {
    value: 'HIGH',
    label: 'High',
    icon: <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40" />,
    textColor: 'text-rose-600 dark:text-rose-400',
    dotColor: 'bg-rose-500',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/40" />,
    textColor: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  {
    value: 'LOW',
    label: 'Low',
    icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />,
    textColor: 'text-emerald-600 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
];

// Build category options with colored dots
const CATEGORY_OPTIONS = DEFAULT_CATEGORIES.map((cat) => ({
  value: cat,
  label: cat,
  icon: <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)}`} />,
}));

export default function TaskItem({ task, onToggle, onDelete, onUpdate, onPlay, index }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editPriority, setEditPriority] = useState<PriorityLevel>(task.priority);
  const [editCategory, setEditCategory] = useState(task.category);

  const prioConfig = PRIORITY_CONFIG[task.priority];
  const overdue = !task.isCompleted && isOverdue(task.dueDate);
  const dateLabel = formatDate(task.dueDate);

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    onUpdate(task.id, {
      title: trimmedTitle,
      description: editDescription.trim() || undefined,
      dueDate: editDueDate,
      priority: editPriority,
      category: editCategory,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    setEditing(false);
  };

  return (
    <article
      className={`
        group bg-white dark:bg-surface-dark-card rounded-2xl
        border border-gray-100 dark:border-white/5
        hover:border-gray-200 dark:hover:border-white/10
        hover:shadow-md dark:hover:shadow-none
        transition-all duration-200 animate-slide-up
        ${task.isCompleted ? 'opacity-60' : ''}
      `}
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
            transition-all duration-200 cursor-pointer
            ${
              task.isCompleted
                ? 'bg-brand-500 border-brand-500 animate-check-pop'
                : 'border-gray-300 dark:border-gray-600 hover:border-brand-400 dark:hover:border-brand-400'
            }
          `}
          aria-label={`Mark "${task.title}" as ${task.isCompleted ? 'incomplete' : 'complete'}`}
        >
          {task.isCompleted && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            /* ── Edit mode ── */
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-white/5
                           border border-gray-200 dark:border-white/10 outline-none
                           focus:border-brand-400 dark:focus:border-brand-500/40
                           text-gray-900 dark:text-white transition-colors"
                aria-label="Edit title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-1.5 text-sm rounded-lg resize-none bg-gray-50 dark:bg-white/5
                           border border-gray-200 dark:border-white/10 outline-none
                           focus:border-brand-400 dark:focus:border-brand-500/40
                           text-gray-900 dark:text-white transition-colors"
                aria-label="Edit description"
              />
              <div className="flex flex-wrap items-center gap-2">
                {/* Custom Date Picker */}
                <CustomDatePicker
                  value={editDueDate}
                  onChange={setEditDueDate}
                  label="Edit due date"
                  compact
                />

                {/* Custom Priority Select */}
                <CustomSelect
                  value={editPriority}
                  onChange={(val) => setEditPriority(val as PriorityLevel)}
                  options={PRIORITY_OPTIONS}
                  icon={<Flag size={14} className={PRIORITY_CONFIG[editPriority].color} />}
                  label="Edit priority"
                  compact
                />

                {/* Custom Category Select */}
                <CustomSelect
                  value={editCategory}
                  onChange={setEditCategory}
                  options={CATEGORY_OPTIONS}
                  label="Edit category"
                  compact
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg
                             bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg
                             bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400
                             hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── Display mode ── */
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <h3
                  className={`text-sm font-medium leading-snug truncate
                    ${task.isCompleted ? 'task-title-completed text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}
                  `}
                >
                  {task.title}
                </h3>
              </div>

              {/* Meta row */}
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                {/* Due date chip */}
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md
                    ${overdue
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  <Calendar size={10} />
                  {dateLabel}
                </span>

                {/* Priority badge */}
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${prioConfig.bgLight} ${prioConfig.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${prioConfig.dot} ${task.priority === 'HIGH' ? 'priority-dot-high' : ''}`} />
                  {prioConfig.label}
                </span>

                {/* Category */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`} />
                  {task.category}
                </span>
              </div>

              {/* Expandable description */}
              {task.description && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 dark:text-gray-500
                             hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-expanded={expanded}
                >
                  <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? 'Hide details' : 'Show details'}
                </button>
              )}
              {expanded && task.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-4 animate-fade-in">
                  {task.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            {onPlay && !task.isCompleted && (
              <button
                onClick={() => onPlay(task)}
                className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10
                           text-brand-500/70 hover:text-brand-500 transition-colors"
                title="Start Focus Session"
              >
                <Play size={14} />
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5
                         text-gray-400 hover:text-brand-500 transition-colors"
              aria-label={`Edit "${task.title}"`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10
                         text-gray-400 hover:text-rose-500 transition-colors"
              aria-label={`Delete "${task.title}"`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
