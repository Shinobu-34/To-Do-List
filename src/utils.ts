import type { Task, UserStats } from './types';

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
const STATS_KEY = 'taskdo_stats';

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.xp === 'number' && typeof parsed.level === 'number' && typeof parsed.coins === 'number') {
        return parsed as UserStats;
      }
    }
  } catch {
    // corrupted data
  }
  return { xp: 0, level: 1, coins: 0 };
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // quota exceeded — silent fail
  }
}

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

export function getSpaceIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('work') || lower.includes('office') || lower.includes('job')) return '💼';
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout') || lower.includes('health')) return '🏋️';
  if (lower.includes('home') || lower.includes('house') || lower.includes('chore')) return '🏠';
  if (lower.includes('study') || lower.includes('learn') || lower.includes('school')) return '📚';
  if (lower.includes('code') || lower.includes('programming') || lower.includes('dev')) return '💻';
  if (lower.includes('finance') || lower.includes('money') || lower.includes('budget')) return '💰';
  if (lower.includes('grocery') || lower.includes('food') || lower.includes('shop')) return '🛒';
  if (lower.includes('travel') || lower.includes('trip') || lower.includes('vacation')) return '✈️';
  if (lower.includes('social') || lower.includes('friend') || lower.includes('family') || lower.includes('party')) return '🎉';
  return '📁';
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-500';
}

// ── Default categories ──
export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Fitness', 'Health', 'Finance', 'Learning'];
