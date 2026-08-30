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
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 w-16 text-right">{item.label}</span>
          <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-lg transition-all duration-700 ease-out flex items-center`}
              style={{ width: max > 0 ? `${Math.max((item.value / max) * 100, item.value > 0 ? 8 : 0)}%` : '0%' }}
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
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Completed arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(pct)}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">done</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          Completed ({completed})
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200 dark:bg-gray-600" />
          Pending ({total - completed})
        </div>
      </div>
    </div>
  );
}

export function Analytics({ stats }: AnalyticsProps) {
  const maxPriority = Math.max(stats.high, stats.medium, stats.low, 1);

  const priorityData = [
    { label: 'High', value: stats.high, color: 'bg-red-500' },
    { label: 'Medium', value: stats.medium, color: 'bg-amber-400' },
    { label: 'Low', value: stats.low, color: 'bg-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut chart */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-5">Completion Overview</h3>
        <DonutChart completed={stats.completed} total={stats.total} />
      </div>

      {/* Priority distribution */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
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
