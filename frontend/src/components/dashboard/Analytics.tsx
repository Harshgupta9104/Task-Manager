import type { CSSProperties } from 'react';
import type { TaskStats } from '../../types/task';

interface AnalyticsProps {
  stats: TaskStats;
}

function BarChart({
  data,
  max,
}: {
  data: { label: string; value: number; color: string }[];
  max: number;
}) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16 text-right">{item.label}</span>
          <div className="flex-1 h-7 bg-white/50 dark:bg-white/5 rounded-lg overflow-hidden ring-1 ring-inset ring-gray-900/5 dark:ring-white/10">
            <div
              className={`h-full ${item.color} rounded-lg animate-bar-grow flex items-center shadow-sm`}
              style={{
                width: max > 0 ? `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)}%` : '0%',
                animationDelay: `${120 + i * 140}ms`,
              }}
            >
              {item.value > 0 && (
                <span className="text-xs font-semibold text-white px-2">{item.value}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-white/50 dark:text-white/10"
          />
          {/* Completed arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#donutGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            className="animate-donut drop-shadow-[0_0_6px_rgba(14,165,233,0.5)]"
            style={{ '--donut-circ': `${circumference}px`, '--donut-offset': `${offset}px` } as CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(pct)}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">done</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" />
          Completed ({completed})
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/50 dark:bg-white/10 ring-1 ring-inset ring-gray-900/10 dark:ring-white/20" />
          Pending ({total - completed})
        </div>
      </div>
    </div>
  );
}

export function Analytics({ stats }: AnalyticsProps) {
  const maxPriority = Math.max(stats.high, stats.medium, stats.low, 1);

  const priorityData = [
    { label: 'High', value: stats.high, color: 'bg-gradient-to-r from-red-500 to-rose-400' },
    { label: 'Medium', value: stats.medium, color: 'bg-gradient-to-r from-amber-400 to-orange-400' },
    { label: 'Low', value: stats.low, color: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">Completion Overview</h3>
        <DonutChart completed={stats.completed} total={stats.total} />
      </div>

      {/* Priority distribution */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">Priority Distribution</h3>
        {stats.total === 0 ? (
          <div className="flex items-center justify-center h-28 text-sm text-gray-400 dark:text-gray-500">
            No tasks yet
          </div>
        ) : (
          <BarChart data={priorityData} max={maxPriority} />
        )}
      </div>
    </div>
  );
}