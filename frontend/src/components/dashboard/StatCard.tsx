import type { ReactNode } from 'react';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
  subtitle?: string;
  suffix?: string;
  delayMs?: number;
}

export function StatCard({ label, value, icon, color, subtitle, suffix = '', delayMs = 0 }: StatCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <div
      className="glass rounded-2xl p-5 glass-hover hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-200 animate-fade-up"
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-200 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <p className="font-display text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight tabular-nums">
        {animatedValue}
        {suffix}
      </p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{subtitle}</p>}
    </div>
  );
}