import { useEffect, useRef } from 'react';

interface UseAutoRefreshProps {
  callback: () => void;
  interval: number; // in milliseconds
  enabled: boolean;
}

export const useAutoRefresh = ({ callback, interval, enabled }: UseAutoRefreshProps) => {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
};