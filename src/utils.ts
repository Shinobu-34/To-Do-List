import type { Task } from './types';

// ── UUID v4 generator ──
export function generateId(): string {
  return crypto.randomUUID();
}

// ── Date helpers ──
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayISO();
}

export function isOverdue(dateStr: string): boolean {
  return dateStr < getTodayISO();
}

export function isUpcoming(dateStr: string): boolean {
  return dateStr > getTodayISO();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(getTodayISO() + 'T00:00:00');
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

// ── LocalStorage ──
const STORAGE_KEY = 'taskdo_tasks';
const THEME_KEY = 'taskdo_theme';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Task[];
    }
  } catch {
    // corrupted data — fall through to defaults
  }
  return getDefaultTasks();
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // quota exceeded — silent fail
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore
  }
  // System preference fallback
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

// ── Mock data ──
function getDefaultTasks(): Task[] {
  const today = getTodayISO();
  const tomorrow = offsetDate(today, 1);
  const nextWeek = offsetDate(today, 7);
  const yesterday = offsetDate(today, -1);

  return [
    {
      id: generateId(),
      title: 'Design landing page wireframes',
      description: 'Create low-fidelity wireframes for the new marketing landing page. Include hero section, features grid, and CTA.',
      dueDate: today,
      priority: 'HIGH',
      category: 'Work',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Morning run — 5K',
      description: 'Lace up and hit the park trail. Target pace: 5:30/km.',
      dueDate: today,
      priority: 'MEDIUM',
      category: 'Fitness',
      isCompleted: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Read "Atomic Habits" Chapter 4',
      description: 'Focus on the section about habit stacking and implementation intentions.',
      dueDate: tomorrow,
      priority: 'LOW',
      category: 'Personal',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Prepare quarterly OKRs presentation',
      description: 'Compile team metrics, highlight achievements, and set new objectives for Q3.',
      dueDate: nextWeek,
      priority: 'HIGH',
      category: 'Work',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Grocery shopping',
      description: 'Avocados, eggs, oat milk, chicken breast, spinach, and dark chocolate.',
      dueDate: tomorrow,
      priority: 'MEDIUM',
      category: 'Personal',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Review pull request #247',
      description: 'Check the auth refactor branch for edge cases and add inline comments.',
      dueDate: yesterday,
      priority: 'HIGH',
      category: 'Work',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: 'Yoga session',
      description: '30-minute evening flow to decompress after work.',
      dueDate: nextWeek,
      priority: 'LOW',
      category: 'Fitness',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function offsetDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ── Priority helpers ──
export const PRIORITY_CONFIG = {
  HIGH: { label: 'High', color: 'text-rose-500', bg: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-500/10', dot: 'bg-rose-500', rank: 0 },
  MEDIUM: { label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500', rank: 1 },
  LOW: { label: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-500', rank: 2 },
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Work: 'bg-blue-500',
  Personal: 'bg-violet-500',
  Fitness: 'bg-emerald-500',
  Health: 'bg-rose-500',
  Finance: 'bg-amber-500',
  Learning: 'bg-cyan-500',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-500';
}

// ── Default categories ──
export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Fitness', 'Health', 'Finance', 'Learning'];
