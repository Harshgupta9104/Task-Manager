import { useState, useCallback } from 'react';

const TOAST_DURATION = 4000;
const EXIT_ANIMATION_MS = 350;

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  leaving?: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    // Slide out before being removed
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    }, TOAST_DURATION - EXIT_ANIMATION_MS);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
