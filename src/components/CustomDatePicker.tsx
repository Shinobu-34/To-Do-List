import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label: string;
  compact?: boolean;
}

interface DayCell {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  iso: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustomDatePicker({ value, onChange, label, compact = false }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar navigation state
  const selectedDate = new Date(value + 'T00:00:00');
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    const d = new Date(value + 'T00:00:00');
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

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

  // Build calendar grid
  const todayISO = toISO(new Date());

  const days: DayCell[] = useMemo(() => {
    const result: DayCell[] = [];
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun

    // Fill leading days from previous month
    const prevMonthLast = new Date(viewYear, viewMonth, 0);
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i);
      const iso = toISO(d);
      result.push({
        date: d,
        day: prevMonthLast.getDate() - i,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        isSelected: iso === value,
        iso,
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(viewYear, viewMonth, day);
      const iso = toISO(d);
      result.push({
        date: d,
        day,
        isCurrentMonth: true,
        isToday: iso === todayISO,
        isSelected: iso === value,
        iso,
      });
    }

    // Fill trailing days to complete the grid (always 42 cells = 6 rows)
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      const iso = toISO(d);
      result.push({
        date: d,
        day: i,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        isSelected: iso === value,
        iso,
      });
    }

    return result;
  }, [viewYear, viewMonth, value, todayISO]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    onChange(toISO(now));
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
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
      >
        <Calendar size={compact ? 12 : 14} className="text-gray-400 shrink-0" />
        <span className="truncate">{formatDisplayDate(value)}</span>
      </button>

      {/* Calendar panel */}
      <div
        className={`
          absolute top-full left-0 mt-1.5 z-50 w-[280px]
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
      >
        {/* Month/year header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-2">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="h-8 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 px-2 pb-2">
          {days.map((cell, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(cell.iso);
                setOpen(false);
              }}
              className={`
                h-8 w-full rounded-lg text-xs font-medium
                flex items-center justify-center
                transition-all duration-150 relative
                ${!cell.isCurrentMonth
                  ? 'text-gray-300 dark:text-gray-600'
                  : cell.isSelected
                    ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/25'
                    : cell.isToday
                      ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold ring-1 ring-brand-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }
              `}
              aria-label={`Select ${cell.iso}`}
              aria-pressed={cell.isSelected}
            >
              {cell.day}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
