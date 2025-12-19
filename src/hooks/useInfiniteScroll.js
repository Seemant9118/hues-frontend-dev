// hooks/useInfiniteScroll.js
import { useCallback, useRef } from 'react';

export function useInfiniteScroll(onLoadMore, enabled) {
  const observerRef = useRef(null);

  const setNodeRef = useCallback(
    (node) => {
      if (!enabled) return;

      // cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        },
        { rootMargin: '200px' },
      );

      observerRef.current.observe(node);
    },
    [enabled, onLoadMore],
  );

  return setNodeRef; // 👈 callback ref (NOT a number, NOT an object ref)
}
