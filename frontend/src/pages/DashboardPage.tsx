import { useState, useEffect, useCallback } from 'react';
import { ListTodo, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentTasks } from '../components/dashboard/RecentTasks';
import { Analytics } from '../components/dashboard/Analytics';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { getTasks, getTaskStats } from '../services/api';
import type { Task, TaskStats } from '../types/task';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        getTaskStats(),
        getTasks({ limit: 5, skip: 0 }),
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [statsData, tasksData] = await Promise.all([
          getTaskStats(),
          getTasks({ limit: 5, skip: 0 }),
        ]);
        if (!ignore) {
          setStats(statsData);
          setRecentTasks(tasksData.tasks);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-8 text-center max-w-md">
          <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Failed to load dashboard</p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const completionPct = stats && stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-gradient">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your tasks and progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats?.total ?? 0}
          icon={<ListTodo className="h-5 w-5 text-sky-600" />}
          color="bg-sky-100"
          delayMs={0}
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? 0}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-100"
          delayMs={80}
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          color="bg-amber-100"
          delayMs={160}
        />
        <StatCard
          label="Completion Rate"
          value={completionPct}
          suffix="%"
          icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
          color="bg-violet-100"
          subtitle={stats && stats.total > 0 ? `${stats.completed} of ${stats.total} tasks` : 'No tasks yet'}
          delayMs={240}
        />
      </div>

      {/* Analytics */}
      {stats && stats.total > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <Analytics stats={stats} />
        </div>
      )}

      {/* Recent Tasks */}
      <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <RecentTasks tasks={recentTasks} />
      </div>
    </div>
  );
}
