import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Flag, FolderOpen } from 'lucide-react';
import type { Task, PriorityLevel } from '../types';
import { getTodayISO, DEFAULT_CATEGORIES, PRIORITY_CONFIG, getCategoryColor } from '../utils';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  categories: string[];
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

export default function TaskForm({ onAddTask, categories }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [category, setCategory] = useState('Personal');
  const [titleError, setTitleError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Merge categories — known defaults + user-defined
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories])).sort();

  // Build category options with colored dots
  const categoryOptions = allCategories.map((cat) => ({
    value: cat,
    label: cat,
    icon: <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)}`} />,
  }));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError(true);
      inputRef.current?.focus();
      return;
    }
    onAddTask({
      title: trimmed,
      description: description.trim() || undefined,
      dueDate,
      priority,
      category,
    });
    // Reset
    setTitle('');
    setDescription('');
    setDueDate(getTodayISO());
    setPriority('MEDIUM');
    setCategory('Personal');
    setTitleError(false);
    setShowOptions(false);
    inputRef.current?.focus();
  };

  // Clear error when user types
  useEffect(() => {
    if (title.trim()) setTitleError(false);
  }, [title]);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 mb-6 bg-white dark:bg-surface-dark-card rounded-2xl border border-gray-100 dark:border-white/5
                 shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300"
    >
      {/* Quick add row */}
      <div className="flex items-center gap-2 p-3">
        <button
          type="submit"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600
                     flex items-center justify-center text-white
                     shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30
                     hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
          aria-label="Add task"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="What needs to be done?"
          className={`
            flex-1 px-3 py-2 text-sm bg-transparent outline-none
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            border-b-2 transition-colors duration-200
            ${titleError ? 'border-rose-400 dark:border-rose-500' : 'border-transparent focus:border-brand-400 dark:focus:border-brand-500'}
          `}
          aria-label="Task title"
          aria-invalid={titleError}
        />
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${showOptions
              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-500'
              : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-gray-500'}
          `}
          aria-expanded={showOptions}
          aria-label="Toggle task options"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Validation message */}
      {titleError && (
        <p className="px-14 pb-1 text-xs text-rose-500 font-medium animate-fade-in" role="alert">
          Please enter a task title
        </p>
      )}

      {/* Expanded options */}
      {showOptions && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 dark:border-white/5 expand-enter">
          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            rows={2}
            className="w-full mt-3 px-3 py-2 text-sm rounded-xl resize-none
                       bg-gray-50 dark:bg-white/5
                       text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       border border-transparent focus:border-brand-300 dark:focus:border-brand-500/30
                       outline-none transition-all duration-200"
            aria-label="Task description"
          />

          {/* Options row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Due date — custom date picker */}
            <CustomDatePicker
              value={dueDate}
              onChange={setDueDate}
              label="Due date"
            />

            {/* Priority — custom select with colored dots */}
            <CustomSelect
              value={priority}
              onChange={(val) => setPriority(val as PriorityLevel)}
              options={PRIORITY_OPTIONS}
              icon={<Flag size={14} className={PRIORITY_CONFIG[priority].color} />}
              label="Priority level"
            />

            {/* Category — custom select with colored dots */}
            <CustomSelect
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              icon={<FolderOpen size={14} className="text-gray-400" />}
              label="Category"
            />
          </div>
        </div>
      )}
    </form>
  );
}
