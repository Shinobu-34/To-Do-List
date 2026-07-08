import type { ActiveFilter } from '../types';

interface EmptyStateProps {
  activeFilter: ActiveFilter;
  searchQuery: string;
}

const MESSAGES: Record<ActiveFilter, { title: string; subtitle: string }> = {
  ALL: {
    title: 'All caught up!',
    subtitle: 'Time to vibe. Add a new task to get started.',
  },
  TODAY: {
    title: 'Nothing due today',
    subtitle: 'Enjoy your free day, or plan something new.',
  },
  UPCOMING: {
    title: 'No upcoming tasks',
    subtitle: 'Your future looks clear. Plan ahead!',
  },
  COMPLETED: {
    title: 'No completed tasks yet',
    subtitle: 'Start checking things off your list!',
  },
};

export default function EmptyState({ activeFilter, searchQuery }: EmptyStateProps) {
  const isSearchEmpty = searchQuery.trim().length > 0;
  const msg = MESSAGES[activeFilter];

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {/* SVG Illustration */}
      <svg
        width="160"
        height="140"
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-80"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="80" cy="70" r="56" className="fill-gray-100 dark:fill-white/5" />
        <circle cx="80" cy="70" r="40" className="fill-gray-50 dark:fill-white/[0.02]" />

        {/* Clipboard body */}
        <rect x="52" y="38" width="56" height="72" rx="6" className="fill-white dark:fill-surface-dark-card stroke-gray-200 dark:stroke-white/10" strokeWidth="1.5" />

        {/* Clipboard clip */}
        <rect x="68" y="32" width="24" height="12" rx="4" className="fill-brand-500/20 stroke-brand-500" strokeWidth="1.5" />
        <circle cx="80" cy="38" r="2" className="fill-brand-500" />

        {/* Lines on clipboard */}
        <rect x="62" y="56" width="36" height="3" rx="1.5" className="fill-gray-200 dark:fill-white/10" />
        <rect x="62" y="64" width="28" height="3" rx="1.5" className="fill-gray-200 dark:fill-white/10" />
        <rect x="62" y="72" width="32" height="3" rx="1.5" className="fill-gray-200 dark:fill-white/10" />
        <rect x="62" y="80" width="20" height="3" rx="1.5" className="fill-gray-200 dark:fill-white/10" />

        {/* Checkmark overlay */}
        {!isSearchEmpty && activeFilter !== 'COMPLETED' && (
          <g transform="translate(88, 82)">
            <circle cx="12" cy="12" r="14" className="fill-brand-500 dark:fill-brand-600" />
            <path
              d="M7 12.5L10.5 16L17 9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Search icon overlay when searching */}
        {isSearchEmpty && (
          <g transform="translate(86, 80)">
            <circle cx="12" cy="10" r="8" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" fill="none" />
            <line x1="18" y1="16" x2="24" y2="22" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Decorative dots */}
        <circle cx="28" cy="50" r="3" className="fill-brand-200 dark:fill-brand-500/20" />
        <circle cx="136" cy="45" r="2" className="fill-purple-200 dark:fill-purple-500/20" />
        <circle cx="130" cy="90" r="4" className="fill-amber-200 dark:fill-amber-500/20" />
        <circle cx="32" cy="95" r="2.5" className="fill-emerald-200 dark:fill-emerald-500/20" />
      </svg>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {isSearchEmpty ? 'No results found' : msg.title}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs">
        {isSearchEmpty
          ? `No tasks match "${searchQuery}". Try a different search term.`
          : msg.subtitle}
      </p>
    </div>
  );
}
