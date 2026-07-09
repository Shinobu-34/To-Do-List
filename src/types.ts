// ── Core Data Types ──

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;        // ISO date string YYYY-MM-DD
  priority: PriorityLevel;
  category: string;
  isCompleted: boolean;
  createdAt: string;       // ISO timestamp
  completedAt?: string;    // ISO timestamp
  penalized?: boolean;     // True if XP penalty applied
}

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
}

export type ActiveFilter = 'ALL' | 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'DASHBOARD' | 'MARKET';

export type SortMode = 'DATE' | 'PRIORITY';

export interface ToastData {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  exiting?: boolean;
}
