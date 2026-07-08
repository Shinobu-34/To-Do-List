import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task, ActiveFilter, SortMode, ToastData } from './types';
import {
  loadTasks,
  saveTasks,
  loadTheme,
  saveTheme,
  generateId,
  getTodayISO,
  isToday,
  isOverdue,
  isUpcoming,
} from './utils';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import FocusCards from './components/FocusCards';
import TaskList from './components/TaskList';
import Toast from './components/Toast';

export default function App() {
  // ── Hydration-safe state init ──
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('DATE');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // ── Client-side mount: load from localStorage ──
  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
    const loadedTheme = loadTheme();
    setTheme(loadedTheme);
    setMounted(true);
  }, []);

  // ── Persist tasks on change ──
  useEffect(() => {
    if (mounted) {
      saveTasks(tasks);
    }
  }, [tasks, mounted]);

  // ── Apply theme class to <html> ──
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (mounted) {
      saveTheme(theme);
    }
  }, [theme, mounted]);

  // ── Toast helpers ──
  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 5000);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === toastId ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 300);
  }, []);

  // ── Task CRUD ──
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast({ message: `"${newTask.title}" added` });
  }, [addToast]);

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    let deletedTask: Task | undefined;
    setTasks((prev) => {
      deletedTask = prev.find((t) => t.id === taskId);
      return prev.filter((t) => t.id !== taskId);
    });
    if (deletedTask) {
      const restored = { ...deletedTask };
      addToast({
        message: `"${restored.title}" deleted`,
        action: {
          label: 'Undo',
          onClick: () => {
            setTasks((prev) => [restored, ...prev]);
          },
        },
      });
    }
  }, [addToast]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  // ── Derived: categories from tasks ──
  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return Array.from(cats).sort();
  }, [tasks]);

  // ── Derived: filter counts ──
  const filterCounts = useMemo(() => {
    const active = tasks.filter((t) => !t.isCompleted);
    return {
      ALL: tasks.length,
      TODAY: active.filter((t) => isToday(t.dueDate)).length,
      UPCOMING: active.filter((t) => isUpcoming(t.dueDate)).length,
      COMPLETED: tasks.filter((t) => t.isCompleted).length,
    };
  }, [tasks]);

  // ── Derived: filtered + searched + sorted tasks ──
  const visibleTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply active filter
    switch (activeFilter) {
      case 'TODAY':
        filtered = filtered.filter((t) => !t.isCompleted && isToday(t.dueDate));
        break;
      case 'UPCOMING':
        filtered = filtered.filter((t) => !t.isCompleted && isUpcoming(t.dueDate));
        break;
      case 'COMPLETED':
        filtered = filtered.filter((t) => t.isCompleted);
        break;
      case 'ALL':
      default:
        filtered = filtered.filter((t) => !t.isCompleted);
        break;
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortMode === 'PRIORITY') {
        const prioOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const diff = prioOrder[a.priority] - prioOrder[b.priority];
        if (diff !== 0) return diff;
        return a.dueDate.localeCompare(b.dueDate);
      }
      // DATE sort
      return a.dueDate.localeCompare(b.dueDate);
    });

    return filtered;
  }, [tasks, activeFilter, selectedCategory, searchQuery, sortMode]);

  // ── Derived: group tasks by section ──
  const groupedTasks = useMemo(() => {
    if (activeFilter === 'COMPLETED') {
      return [{ label: 'Completed', tasks: visibleTasks }];
    }
    if (activeFilter === 'UPCOMING') {
      return [{ label: 'Upcoming', tasks: visibleTasks }];
    }

    const overdue: Task[] = [];
    const today: Task[] = [];
    const later: Task[] = [];
    const todayISO = getTodayISO();

    for (const task of visibleTasks) {
      if (isOverdue(task.dueDate)) {
        overdue.push(task);
      } else if (task.dueDate === todayISO) {
        today.push(task);
      } else {
        later.push(task);
      }
    }

    const groups: { label: string; tasks: Task[] }[] = [];
    if (overdue.length > 0) groups.push({ label: 'Overdue', tasks: overdue });
    if (today.length > 0) groups.push({ label: 'Today', tasks: today });
    if (later.length > 0) groups.push({ label: 'Later', tasks: later });
    return groups;
  }, [visibleTasks, activeFilter]);

  // ── Progress ──
  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.isCompleted).length / tasks.length) * 100);
  }, [tasks]);

  // ── Toggle theme ──
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // ── Don't render until mounted (hydration guard) ──
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark transition-colors">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f);
          setSelectedCategory(null);
          setSidebarOpen(false);
        }}
        filterCounts={filterCounts}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat === selectedCategory ? null : cat);
          setSidebarOpen(false);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-[260px]">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          progress={progress}
          totalTasks={tasks.length}
          completedTasks={tasks.filter((t) => t.isCompleted).length}
          onMenuClick={() => setSidebarOpen(true)}
          sortMode={sortMode}
          onSortChange={setSortMode}
        />

        <section className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 max-w-4xl w-full mx-auto">
          <FocusCards tasks={tasks} onComplete={(id) => toggleTask(id)} />
          <TaskForm onAddTask={addTask} categories={categories} />

          <TaskList
            groupedTasks={groupedTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
          />
        </section>
      </main>

      {/* Toast container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
}
