import { useState, useMemo } from 'react';
import type { Task } from '../types';
import { getTodayISO, isOverdue, getCategoryColor, formatDate } from '../utils';
import ProductivityChart from './ProductivityChart';

interface DashboardProps {
  tasks: Task[];
}

type TimeFilter = 'ALL' | 'WEEK' | 'MONTH' | 'FAILED';

export default function Dashboard({ tasks }: DashboardProps) {
  const [filter, setFilter] = useState<TimeFilter>('ALL');
  const [hoveredCell, setHoveredCell] = useState<{ date: string, completed: number, total: number, x: number, y: number } | null>(null);

  const todayISO = getTodayISO();

  // Derived Analytics
  const { vibeScore, matrixTasks, streakMap } = useMemo(() => {
    let score = 0;
    const map = new Map<string, { total: number; completed: number; failed: number }>();

    // Setup last 35 days for streak map
    const today = new Date();
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      map.set(iso, { total: 0, completed: 0, failed: 0 });
    }

    // Process tasks
    tasks.forEach((t) => {
      const isFailed = !t.isCompleted && isOverdue(t.dueDate);
      const wasCompletedLate = t.isCompleted && t.completedAt && t.completedAt > t.dueDate;
      const wasCompletedOnTime = t.isCompleted && (!t.completedAt || t.completedAt <= t.dueDate);

      if (wasCompletedOnTime) score += 10;
      if (isFailed || wasCompletedLate) score -= 5;

      // Map by due date for streak map
      if (map.has(t.dueDate)) {
        const stats = map.get(t.dueDate)!;
        stats.total++;
        if (t.isCompleted) stats.completed++;
        if (isFailed) stats.failed++;
      }
    });

    // Generate Streak Grid Array
    const streakArray = Array.from(map.entries()).map(([date, stats]) => {
      let status: 'empty' | 'perfect' | 'failed' | 'partial' = 'empty';
      if (stats.total > 0) {
        if (stats.failed > 0) status = 'failed';
        else if (stats.completed === stats.total) status = 'perfect';
        else status = 'partial';
      }
      return { date, status, ...stats };
    });

    // Filter tasks for the matrix
    let filtered = [...tasks].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    
    if (filter === 'FAILED') {
      filtered = filtered.filter(t => !t.isCompleted && isOverdue(t.dueDate));
    } else if (filter === 'WEEK') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekIso = weekAgo.toISOString().split('T')[0];
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);
      const weekAheadIso = weekAhead.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.dueDate >= weekIso && t.dueDate <= weekAheadIso);
    } else if (filter === 'MONTH') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthIso = monthAgo.toISOString().split('T')[0];
      const monthAhead = new Date();
      monthAhead.setMonth(monthAhead.getMonth() + 1);
      const monthAheadIso = monthAhead.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.dueDate >= monthIso && t.dueDate <= monthAheadIso);
    }

    return { vibeScore: Math.max(0, score), matrixTasks: filtered, streakMap: streakArray };
  }, [tasks, filter, todayISO]);

  return (
    <div className="animate-fade-in pb-8">
      {/* Visual Analytics Graph Banner */}
      <ProductivityChart streakMap={streakMap} tasks={tasks} />

      {/* Top Metrics Row */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        
        {/* Vibe Score Card */}
        <div className="flex-1 bg-white/50 dark:bg-surface-dark-card/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            {/* Circular Progress Ring Background */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="8" fill="none" />
              <circle 
                cx="48" cy="48" r="40" 
                className="stroke-brand-500 transition-all duration-1000 ease-out" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * Math.min(vibeScore, 100)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{vibeScore}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <span role="img" aria-label="sparkles">✨</span> Vibe Score
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              +10 for on-time finishes, -5 for missed deadlines. Keep it up!
            </p>
          </div>
        </div>

        {/* Streak Heatmap Card */}
        <div className="flex-1 bg-white/50 dark:bg-surface-dark-card/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">35-Day Consistency Heatmap</h3>
          <div className="flex flex-wrap gap-1.5 relative">
            {streakMap.map((day) => {
              let bg = "bg-slate-800/30 border border-slate-700/20";
              let glow = "";
              if (day.total > 0) {
                const percent = (day.completed / day.total) * 100;
                if (day.status === 'failed' || percent === 0) {
                   bg = "bg-rose-500/80";
                   glow = "hover:shadow-[0_0_12px_rgba(244,63,94,0.4)]";
                } else if (percent === 100) {
                   bg = "bg-emerald-500";
                   glow = "hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]";
                } else if (percent >= 50) {
                   bg = "bg-emerald-600/60";
                   glow = "hover:shadow-[0_0_12px_rgba(5,150,105,0.4)]";
                } else {
                   bg = "bg-slate-700";
                   glow = "hover:shadow-[0_0_12px_rgba(51,65,85,0.4)]";
                }
              }
              
              return (
                <div 
                  key={day.date}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCell({ date: day.date, completed: day.completed, total: day.total, x: rect.left + rect.width / 2, y: rect.top - 8 });
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-[14px] h-[14px] rounded-[4px] transition-all duration-200 ease-out hover:scale-125 hover:z-10 cursor-pointer ${bg} ${glow}`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Accountability Matrix */}
      <div className="bg-white/80 dark:bg-surface-dark-card/90 backdrop-blur-2xl rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden">
        
        {/* Matrix Header / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800/60">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 sm:mb-0">
            📊 The Accountability Matrix
          </h2>
          <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
            {(['ALL', 'WEEK', 'MONTH', 'FAILED'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${filter === f 
                    ? 'bg-white dark:bg-surface-dark-elevated text-brand-600 dark:text-brand-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}
                `}
              >
                {f === 'ALL' ? 'All Time' : f === 'WEEK' ? 'This Week' : f === 'MONTH' ? 'This Month' : 'Failures'}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-slate-800/60">Task Name</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-slate-800/60">Category</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-slate-800/60">Due Date</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-slate-800/60">Completed At</th>
                <th className="px-6 py-4 font-semibold border-b border-gray-100 dark:border-slate-800/60 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
              {matrixTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No data available for this filter.
                  </td>
                </tr>
              ) : (
                matrixTasks.map((task) => {
                  const isFailed = !task.isCompleted && isOverdue(task.dueDate);
                  
                  return (
                    <tr 
                      key={task.id} 
                      className={`
                        transition-colors hover:bg-gray-50 dark:hover:bg-white/5
                        ${isFailed ? 'bg-rose-50 dark:bg-rose-950/20 border-l-4 border-l-rose-500' : 'border-l-4 border-l-transparent'}
                      `}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                        {task.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`} />
                          {task.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {task.completedAt ? formatDate(task.completedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isFailed ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                            🔴 Overdue / Failed
                          </span>
                        ) : task.isCompleted ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                            ✅ Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap Custom Tooltip Portal */}
      {hoveredCell && (
        <div 
          className="fixed z-50 -translate-x-1/2 -translate-y-full bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl shadow-black/60 pointer-events-none animate-fade-in"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <div className="text-sm font-medium text-white mb-1">
            📅 {new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs text-slate-300">
            {hoveredCell.total === 0 ? (
              <span className="text-slate-500">No tasks scheduled</span>
            ) : (
              <span>🎯 {hoveredCell.completed} / {hoveredCell.total} Tasks Completed ({Math.round((hoveredCell.completed / hoveredCell.total) * 100)}%)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
