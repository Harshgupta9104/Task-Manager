import { useEffect, useState } from 'react';

const TOAST_DURATION = 4000;
const EXIT_ANIMATION_MS = 350;

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  leaving?: boolean;
}

// Shared store. Toasts are raised in one place (e.g. a page or hook) but
// rendered in another (ToastContainer in Layout), so the list lives at
// module level instead of inside a component. Every useToast() consumer
// subscribes and sees the same list.
let toasts: Toast[] = [];
const listeners = new Set<(toasts: Toast[]) => void>();

function emit() {
  const snapshot = [...toasts];
  for (const listener of listeners) listener(snapshot);
}

function addToast(type: Toast['type'], message: string) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  emit();
  // Slide out before being removed
  setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
    emit();
  }, TOAST_DURATION - EXIT_ANIMATION_MS);
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, TOAST_DURATION);
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => {
      listeners.delete(setCurrentToasts);
    };
  }, []);

  return { toasts: currentToasts, addToast, removeToast };
}
