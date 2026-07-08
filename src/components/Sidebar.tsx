import {
  LayoutDashboard,
  CalendarDays,
  CalendarClock,
  CircleCheckBig,
  Sun,
  Moon,
  Sparkles,
  Tag,
  X,
  LineChart,
} from 'lucide-react';
import type { ActiveFilter } from '../types';
import { getCategoryColor } from '../utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
  filterCounts: Record<ActiveFilter, number>;
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

interface NavItem {
  filter: ActiveFilter;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { filter: 'DASHBOARD', label: 'Dashboard', icon: <LineChart size={18} /> },
  { filter: 'ALL', label: 'All Tasks', icon: <LayoutDashboard size={18} /> },
  { filter: 'TODAY', label: 'Today', icon: <CalendarDays size={18} /> },
  { filter: 'UPCOMING', label: 'Upcoming', icon: <CalendarClock size={18} /> },
  { filter: 'COMPLETED', label: 'Completed', icon: <CircleCheckBig size={18} /> },
];

export default function Sidebar({
  isOpen,
  onClose,
  activeFilter,
  onFilterChange,
  filterCounts,
  categories,
  selectedCategory,
  onCategorySelect,
  theme,
  onToggleTheme,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-[260px]
        bg-white dark:bg-surface-dark-elevated
        border-r border-gray-100 dark:border-white/5
        flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-xl lg:shadow-none
      `}
      aria-label="Navigation sidebar"
    >
      {/* Brand */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Task-Do
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium -mt-0.5">
              Stay organized
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </header>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />

      {/* Navigation Filters */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Task filters">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Views
        </p>
        {NAV_ITEMS.map(({ filter, label, icon }) => {
          const isActive = activeFilter === filter && !selectedCategory;
          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full" />
              )}
              <span className={isActive ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}>
                {icon}
              </span>
              <span className="flex-1 text-left">{label}</span>
              <span
                className={`
                  text-xs tabular-nums px-2 py-0.5 rounded-full font-semibold
                  ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                  }
                `}
              >
                {filterCounts[filter]}
              </span>
            </button>
          );
        })}

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="pt-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Categories
            </p>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategorySelect(cat)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)}`} />
                  <span className="flex-1 text-left">{cat}</span>
                  <Tag size={14} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5
                     hover:text-gray-900 dark:hover:text-white transition-all duration-200"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300">
            <div
              className={`
                absolute top-0.5 w-5 h-5 rounded-full
                bg-white dark:bg-gray-200 shadow-sm
                transition-transform duration-300 ease-in-out
                flex items-center justify-center
                ${theme === 'dark' ? 'translate-x-[26px]' : 'translate-x-0.5'}
              `}
            >
              {theme === 'light' ? (
                <Sun size={12} className="text-amber-500" />
              ) : (
                <Moon size={12} className="text-indigo-500" />
              )}
            </div>
          </div>
          <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}
