import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const base = 'TaskFlow';
    document.title = title ? `${title} — ${base}` : base;
  }, [title]);
}
