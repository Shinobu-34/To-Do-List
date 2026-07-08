import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  label: string;
  compact?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  icon,
  label,
  compact = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1.5 rounded-lg
          transition-all duration-200 cursor-pointer
          border border-transparent
          ${compact
            ? 'px-2 py-1 text-xs'
            : 'px-3 py-1.5 text-sm'
          }
          bg-gray-50 dark:bg-white/5
          hover:bg-gray-100 dark:hover:bg-white/10
          text-gray-700 dark:text-gray-300
          ${open ? 'ring-2 ring-brand-500/30 border-brand-400 dark:border-brand-500/40' : 'hover:border-gray-200 dark:hover:border-white/10'}
        `}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
        <span className="truncate">{selected?.label || value}</span>
        <ChevronDown
          size={compact ? 12 : 14}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`
          absolute top-full left-0 mt-1.5 z-50 min-w-[160px]
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40
          overflow-hidden
          transition-all duration-150 ease-out origin-top
          ${open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
          }
        `}
        role="listbox"
        aria-label={label}
      >
        <div className="py-1.5">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-100
                  ${isSelected
                    ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span className="flex-1 text-left truncate">{option.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
