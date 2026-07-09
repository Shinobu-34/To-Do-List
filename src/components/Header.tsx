import { useState } from 'react';
import { Search, Menu, ArrowUpDown, HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
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
  const [guideStep, setGuideStep] = useState<number | null>(null);

  const guideSteps = [
    { title: "🎮 The RPG Leveling System", desc: "Completing tasks awards XP and Coins based on priority. Beware: overdue tasks penalize your XP!" },
    { title: "⚡ Quick Wins Carousel", desc: "The top cards let you instantly tackle high-priority tasks. Click them to view randomized description reveal animations." },
    { title: "📈 The Accountability Matrix", desc: "The data spreadsheet and theme-adaptive consistency heatmap track your daily habits over time." },
    { title: "🛍️ Dopamine Market", desc: "Spend your hard-earned coins to unlock self-made real-world rewards and take a break." },
    { title: "📁 Smart Spaces", desc: "Create custom project domains that dynamically morph the layout's ambient accent glow and organize your life." }
  ];

  const handleNext = () => setGuideStep(prev => prev! < guideSteps.length ? prev! + 1 : null);
  const handlePrev = () => setGuideStep(prev => prev! > 1 ? prev! - 1 : 1);

  return (
    <>
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

          {/* Guide Button */}
          <button
            onClick={() => setGuideStep(1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
                       bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-800/70 
                       border border-transparent dark:border-slate-800/80 
                       text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <HelpCircle size={16} />
            <span className="hidden sm:inline">Take a Tour</span>
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

    {/* The Interactive Guide Modal */}
    {guideStep !== null && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setGuideStep(null)}>
        <div 
          className="bg-slate-900/95 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-brand-400">Step {guideStep} of 5</h3>
            <button onClick={() => setGuideStep(null)} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
          </div>
          
          <div className="min-h-[120px] transition-all duration-300 transform">
            <h2 className="text-xl font-bold text-white mb-2">{guideSteps[guideStep - 1].title}</h2>
            <p className="text-gray-300 leading-relaxed text-sm">{guideSteps[guideStep - 1].desc}</p>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => setGuideStep(null)}
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {guideStep > 1 && (
                <button 
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-1 shadow-lg shadow-brand-500/20 active:scale-95"
              >
                {guideStep === 5 ? "Let's Crush It! 🚀" : "Next"} 
                {guideStep !== 5 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
