import { useState, useMemo } from 'react';
import type { Task } from '../types';
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
  const [activeRingSegment, setActiveRingSegment] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  // 2. Category Donut Data with Priority Colors
  const donutData = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const categoryHighestPriority: Record<string, 'HIGH' | 'MEDIUM' | 'LOW'> = {};
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let totalCompleted = 0;

    const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    tasks.forEach((t) => {
      if (t.isCompleted) {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
        totalCompleted++;

        if (t.priority === 'HIGH') highCount++;
        else if (t.priority === 'MEDIUM') mediumCount++;
        else if (t.priority === 'LOW') lowCount++;

        const currentPrio = categoryHighestPriority[t.category];
        if (!currentPrio || rank[t.priority] > rank[currentPrio]) {
          categoryHighestPriority[t.category] = t.priority;
        }
      }
    });

    const priorityColors: Record<string, string> = { HIGH: '#f43f5e', MEDIUM: '#eab308', LOW: '#10b981' };
    const priorityClasses: Record<string, string> = { HIGH: 'bg-rose-500', MEDIUM: 'bg-amber-500', LOW: 'bg-emerald-500' };

    // Legend data (Categories)
    const legendSegments: { label: string; value: number; colorClass: string; percentage: number }[] = [];
    
    Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).forEach(([cat, val]) => {
      const percentage = (val / totalCompleted) * 100;
      const prio = categoryHighestPriority[cat] || 'LOW';
      
      legendSegments.push({
        label: cat,
        value: val,
        percentage,
        colorClass: priorityClasses[prio],
      });
    });

    // Ring data (Priorities)
    const rawRingData = [
      { name: 'High', value: highCount, color: '#f43f5e' },
      { name: 'Medium', value: mediumCount, color: '#eab308' },
      { name: 'Low', value: lowCount, color: '#10b981' }
    ].filter(d => d.value > 0);

    const ringSegments: { name: string; value: number; percentage: number; offset: number; hexColor: string }[] = [];
    let cumulativeOffset = 0;
    
    rawRingData.forEach(d => {
      const percentage = (d.value / totalCompleted) * 100;
      ringSegments.push({
        name: d.name,
        value: d.value,
        percentage,
        offset: cumulativeOffset,
        hexColor: d.color
      });
      cumulativeOffset += percentage;
    });

    return { legendSegments, ringSegments, totalCompleted };
  }, [tasks]);

  // Tooltip & Dots Coordinates
  const hoverData = hoverIndex !== null ? chartData[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? (hoverIndex / (chartData.length - 1)) * 600 : 0;
  const hoverCompletedY = hoverData ? 200 - (hoverData.completed / maxTasks) * 160 : 200;
  const hoverFailedY = hoverData ? 200 - (hoverData.failed / maxTasks) * 160 : 200;

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
              const completedY = 200 - (d.completed / maxTasks) * 160;
              const failedY = 200 - (d.failed / maxTasks) * 160;

              return (
                <g key={d.date} className="group">
                  <text x={x} y="225" textAnchor="middle" className="text-xs fill-gray-500 dark:fill-gray-400 font-medium">
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Active Hover Dots (Fluid) */}
            <circle 
              cx={hoverX} cy={hoverCompletedY} r="6" 
              fill="#0f172a" stroke="#10b981" strokeWidth="2" 
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none" 
              style={{ opacity: hoverIndex !== null ? 1 : 0, transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)' }} 
            />
            <circle 
              cx={hoverX} cy={hoverFailedY} r="6" 
              fill="#0f172a" stroke="#f43f5e" strokeWidth="2" 
              className="drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none" 
              style={{ opacity: hoverIndex !== null ? 1 : 0, transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)' }} 
            />
          </svg>

          {/* Invisible Overlay for precise hover detection without blocking SVG layout */}
          <div className="absolute inset-0 flex items-end h-[200px]" onMouseLeave={() => setHoverIndex(null)}>
            {chartData.map((d, i) => (
              <div 
                key={d.date}
                className="flex-1 h-full relative cursor-crosshair group"
                onMouseEnter={() => setHoverIndex(i)}
              />
            ))}
          </div>

          {/* Tooltip Overlay (Fluid) */}
          <div 
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{ 
              left: `calc(${(hoverIndex !== null ? (hoverIndex / (chartData.length - 1)) * 100 : 0)}%)`,
              opacity: hoverIndex !== null ? 1 : 0,
              transition: 'all 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max">
              {hoverData && (
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 shadow-2xl">
                  <div className="text-xs text-gray-400 mb-1.5 text-center font-medium">
                    {new Date(hoverData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      🎯 {hoverData.completed}
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                      ⚠️ {hoverData.failed}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Vertical Highlight Line */}
            <div className="absolute top-[40px] bottom-[40px] left-1/2 -translate-x-1/2 w-[1px] bg-white/10" />
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
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div 
              className="relative w-40 h-40 mb-6"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }}
              onMouseLeave={() => setActiveRingSegment(null)}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="12" />
                {donutData.ringSegments.map((seg) => {
                  const circumference = 2 * Math.PI * 40;
                  const dashValue = (seg.percentage / 100) * circumference;
                  const offsetValue = (seg.offset / 100) * circumference;
                  const isActive = activeRingSegment === seg.name;
                  return (
                    <circle 
                      key={seg.name}
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke={seg.hexColor}
                      strokeWidth={isActive ? "14" : "12"}
                      strokeDasharray={`${dashValue} ${circumference}`}
                      strokeDashoffset={-offsetValue}
                      className="transition-all duration-300 ease-out cursor-pointer"
                      onMouseEnter={() => setActiveRingSegment(seg.name)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{donutData.totalCompleted}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Total</span>
              </div>

              {/* Custom Hover Tooltip */}
              <div 
                className={`absolute bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-xl p-3 shadow-2xl transition-all duration-150 pointer-events-none z-50 w-max ${activeRingSegment ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{ 
                  left: tooltipPos.x + 15, 
                  top: tooltipPos.y + 15 
                }}
              >
                {activeRingSegment && (() => {
                  const seg = donutData.ringSegments.find(s => s.name === activeRingSegment);
                  if (!seg) return null;
                  const emoji = seg.name === 'High' ? '🔴' : seg.name === 'Medium' ? '🟡' : '🟢';
                  return (
                    <>
                      <div className="font-bold text-sm text-white whitespace-nowrap mb-1">
                        {emoji} {seg.name} Priority
                      </div>
                      <div className="text-xs text-slate-300 whitespace-nowrap">
                        ✨ {seg.value} Task{seg.value === 1 ? '' : 's'} Completed
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {donutData.legendSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${seg.colorClass}`} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{seg.label}</span>
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
