import { Search, Menu, ArrowUpDown } from 'lucide-react';
import type { SortMode } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  onMenuClick: () => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  progress,
  totalTasks,
  completedTasks,
  onMenuClick,
  sortMode,
  onSortChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center gap-3 py-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 relative group">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500
                         group-focus-within:text-brand-500 transition-colors"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                         bg-gray-50 dark:bg-white/5
                         border border-transparent
                         focus:border-brand-300 dark:focus:border-brand-500/30
                         focus:bg-white dark:focus:bg-white/10
                         text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         transition-all duration-200 outline-none"
              aria-label="Search tasks"
            />
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => onSortChange(sortMode === 'DATE' ? 'PRIORITY' : 'DATE')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
                       bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10
                       text-gray-600 dark:text-gray-400 transition-all duration-200
                       border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            aria-label={`Sort by ${sortMode === 'DATE' ? 'priority' : 'date'}`}
          >
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">
              {sortMode === 'DATE' ? 'Date' : 'Priority'}
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Daily Progress
            </span>
            <span className="text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-300">
              {completedTasks}/{totalTasks} tasks · {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progress}% of tasks completed`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
