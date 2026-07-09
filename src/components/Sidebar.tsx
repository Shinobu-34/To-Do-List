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
  ShoppingBag,
  Plus,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ActiveFilter, UserStats } from '../types';
import { getCategoryColor, getSpaceIcon } from '../utils';

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
  userStats: UserStats;
  onAddSpace?: (space: string) => void;
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
  userStats,
  onAddSpace,
}: SidebarProps) {
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isSpaceModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSpaceModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSpaceModalOpen) {
        setIsSpaceModalOpen(false);
        setNewSpaceName('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpaceModalOpen]);

  const handleCreateSpace = () => {
    const trimmed = newSpaceName.trim();
    if (trimmed && onAddSpace) {
      onAddSpace(trimmed);
    }
    setIsSpaceModalOpen(false);
    setNewSpaceName('');
  };

  const xpProgress = (userStats.xp % 1000) / 10; // since 1000 is max per level, 1000/10 = 100%
  return (
    <>
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
      {/* Brand & XP */}
      <header className="px-5 pt-6 pb-4 relative flex flex-col">
        <div className="flex items-center gap-2.5 mb-4">
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
        
        {/* Minimalist XP Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
              Level {userStats.level}
            </span>
            <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
              {userStats.xp} XP
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden absolute top-6 right-5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
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

        {/* Spaces Section */}
        {categories.length >= 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Spaces
              </p>
              <button 
                className="text-gray-400 hover:text-brand-500 transition-colors"
                title="Create Space"
                onClick={() => setIsSpaceModalOpen(true)}
              >
                <Plus size={14} />
              </button>
            </div>
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
                  <span className="text-lg leading-none w-5 text-center flex-shrink-0">{getSpaceIcon(cat)}</span>
                  <span className="flex-1 text-left">{cat}</span>
                  <Tag size={14} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-white/5 space-y-2">
        <button
          onClick={() => onFilterChange('MARKET')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${activeFilter === 'MARKET'
              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
          <span className={activeFilter === 'MARKET' ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}>
            <ShoppingBag size={18} />
          </span>
          <span>Dopamine Market</span>
        </button>

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

    {/* Custom Space Creation Modal */}
    {isSpaceModalOpen && (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => { setIsSpaceModalOpen(false); setNewSpaceName(''); }}
      >
        <div 
          className="bg-slate-900/90 backdrop-blur-xl max-w-md w-full p-6 mx-4 rounded-2xl border border-slate-800/80 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Create New Space</h3>
          <p className="text-sm text-slate-400 mb-4">Enter a name for your new organization space.</p>
          
          <input
            ref={inputRef}
            type="text"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSpace();
            }}
            placeholder="e.g. Side Hustle, Reading List..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => { setIsSpaceModalOpen(false); setNewSpaceName(''); }}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSpace}
              disabled={!newSpaceName.trim()}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-purple-950/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
