import type { ReactNode } from 'react';

/**
 * Quiet decorative fills for the empty space around page headers and
 * hero/empty-state cards: soft color orbs at the edges plus an optional
 * oversized ghost icon. Everything is aria-hidden, pointer-events-none,
 * and sits behind content (parent needs `relative overflow-hidden`).
 * Deliberately static — no animation, no attention-grabbing.
 */
export function HeaderDecor({ icon }: { icon?: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="accent-orb accent-orb-sky -top-16 -right-10 h-56 w-56" />
      <div className="accent-orb accent-orb-indigo -bottom-20 -left-12 h-52 w-52" />
      {icon && (
        <div className="ghost-icon -right-4 -bottom-6 sm:right-8 sm:bottom-4">{icon}</div>
      )}
    </div>
  );
}
