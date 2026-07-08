import { useState, useMemo } from 'react';
import type { Task } from '../types';
import { getCategoryColor } from '../utils';

interface StreakData {
  date: string;
  total: number;
  completed: number;
  failed: number;
}

interface ProductivityChartProps {
  streakMap: StreakData[];
  tasks: Task[];
}

export default function ProductivityChart({ streakMap, tasks }: ProductivityChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 1. Line Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    return streakMap.slice(-7);
  }, [streakMap]);

  const maxTasks = useMemo(() => {
    return Math.max(
      ...chartData.map((d) => Math.max(d.completed, d.failed)),
      1 // minimum scale
    );
  }, [chartData]);

  // Smooth SVG Path Generator
  const generatePath = (dataKey: 'completed' | 'failed') => {
    if (chartData.length === 0) return '';
    
    const points = chartData.map((d, i) => ({
      x: (i / (chartData.length - 1)) * 600,
      y: 200 - (d[dataKey] / maxTasks) * 160,
    }));

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const cx = (p1.x + p2.x) / 2;
      path += ` C ${cx},${p1.y} ${cx},${p2.y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const completedPath = useMemo(() => generatePath('completed'), [chartData, maxTasks]);
  const failedPath = useMemo(() => generatePath('failed'), [chartData, maxTasks]);

  // 2. Category Donut Data
  const donutData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    let totalCompleted = 0;

    tasks.forEach((t) => {
      if (t.isCompleted) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        totalCompleted++;
      }
    });

    const segments: { category: string; value: number; colorClass: string; percentage: number; offset: number }[] = [];
    let cumulativeOffset = 0;
    
    // Sort to keep consistent coloring order
    Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).forEach(([cat, val]) => {
      const percentage = (val / totalCompleted) * 100;
      segments.push({
        category: cat,
        value: val,
        percentage,
        offset: cumulativeOffset,
        colorClass: getCategoryColor(cat), // e.g. 'bg-blue-500' -> we need stroke color though, handled in SVG classes below or style mapping.
      });
      cumulativeOffset += percentage;
    });

    return { segments, totalCompleted };
  }, [tasks]);

  // Helper to get hex colors from category bg-classes for the SVG strokes
  const getColorHex = (catColor: string) => {
    if (catColor.includes('brand')) return '#8b5cf6'; // purple/brand
    if (catColor.includes('blue')) return '#3b82f6';
    if (catColor.includes('emerald')) return '#10b981';
    if (catColor.includes('rose')) return '#f43f5e';
    if (catColor.includes('amber')) return '#f59e0b';
    return '#64748b'; // slate fallback
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8 animate-fade-in">
      
      {/* LEFT COLUMN: 7-Day Area Chart (65%) */}
      <div className="w-full lg:w-[65%] bg-slate-900/40 dark:bg-surface-dark-card/80 backdrop-blur-md rounded-2xl p-6 border border-slate-800/60 shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Productivity Trends</h3>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              Completed
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              Overdue / Failed
            </div>
          </div>
        </div>

        <div className="relative w-full h-[240px]">
          <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
            <defs>
              <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Y-Axis Grid Lines */}
            <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" className="text-gray-200 dark:text-slate-800/50" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" className="text-gray-200 dark:text-slate-800/50" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="200" x2="600" y2="200" stroke="currentColor" className="text-gray-200 dark:text-slate-800/50" strokeWidth="1" />

            {/* Fills */}
            {completedPath && (
              <path d={`${completedPath} L 600,200 L 0,200 Z`} fill="url(#completedGrad)" className="transition-all duration-700 ease-out" />
            )}
            {failedPath && (
              <path d={`${failedPath} L 600,200 L 0,200 Z`} fill="url(#failedGrad)" className="transition-all duration-700 ease-out" />
            )}

            {/* Strokes */}
            <path d={completedPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-out drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            <path d={failedPath} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 ease-out drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]" />

            {/* Hover Points & X-Axis Labels */}
            {chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * 600;
              const dateObj = new Date(d.date);
              const label = i === chartData.length - 1 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <g key={d.date} className="group">
                  <text x={x} y="225" textAnchor="middle" className="text-xs fill-gray-500 dark:fill-gray-400 font-medium">
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Invisible Overlay for precise hover detection without blocking SVG layout */}
          <div className="absolute inset-0 flex items-end h-[200px]" onMouseLeave={() => setHoverIndex(null)}>
            {chartData.map((d, i) => (
              <div 
                key={d.date}
                className="flex-1 h-full relative cursor-crosshair group"
                onMouseEnter={() => setHoverIndex(i)}
              >
                {/* Tooltip */}
                {hoverIndex === i && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-max pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 shadow-2xl animate-fade-in">
                      <div className="text-xs text-gray-400 mb-1.5 text-center font-medium">
                        {new Date(d.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                          🎯 {d.completed}
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                          ⚠️ {d.failed}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Vertical Highlight Line */}
                {hoverIndex === i && (
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Category Donut (35%) */}
      <div className="w-full lg:w-[35%] bg-slate-900/40 dark:bg-surface-dark-card/80 backdrop-blur-md rounded-2xl p-6 border border-slate-800/60 shadow-xl flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Completed Categories</h3>
        
        {donutData.totalCompleted === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            No completed tasks yet.
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="12" />
                {donutData.segments.map((seg) => {
                  const circumference = 2 * Math.PI * 40;
                  const dashValue = (seg.percentage / 100) * circumference;
                  const offsetValue = (seg.offset / 100) * circumference;
                  return (
                    <circle 
                      key={seg.category}
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke={getColorHex(seg.colorClass)}
                      strokeWidth="12"
                      strokeDasharray={`${dashValue} ${circumference}`}
                      strokeDashoffset={-offsetValue}
                      className="transition-all duration-1000 ease-out"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{donutData.totalCompleted}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Total</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {donutData.segments.map((seg) => (
                <div key={seg.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${seg.colorClass}`} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{seg.category}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Math.round(seg.percentage)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
