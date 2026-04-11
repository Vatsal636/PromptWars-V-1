// ─── Custom hook for polling AI API endpoints ───

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAIPollingOptions<T> {
  url: string;
  interval?: number;  // ms, default 3000
  enabled?: boolean;
}

interface UseAIPollingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => void;
}

export function useAIPolling<T>({ url, interval = 3000, enabled = true }: UseAIPollingOptions<T>): UseAIPollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (mountedRef.current) {
        setData(json);
        setError(null);
        setLastUpdate(new Date());
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Polling interval
    const timer = setInterval(fetchData, interval);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchData, interval, enabled]);

  return { data, loading, error, lastUpdate, refresh: fetchData };
}
