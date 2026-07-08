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
}

export type ActiveFilter = 'ALL' | 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'DASHBOARD';

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
