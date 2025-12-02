import { useEffect, useRef } from 'react';

interface AutoRefreshOptions {
    enabled: boolean;
    interval: number; // in milliseconds
    onRefresh: () => void | Promise<void>;
    tabVisible?: boolean;
}

/**
 * Hook for automatic data refresh with tab visibility detection
 * @param options Configuration for auto-refresh behavior
 */
export function useAutoRefresh({ enabled, interval, onRefresh, tabVisible = true }: AutoRefreshOptions) {
    const intervalRef = useRef<number | null>(null);
    const lastRefreshRef = useRef<number>(Date.now());

    useEffect(() => {
        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Only setup if enabled and tab is visible
        if (!enabled || !tabVisible) {
            return;
        }

        // Initial refresh if it's been more than the interval since last refresh
        if (Date.now() - lastRefreshRef.current > interval) {
            onRefresh();
            lastRefreshRef.current = Date.now();
        }

        // Setup interval
        intervalRef.current = setInterval(() => {
            onRefresh();
            lastRefreshRef.current = Date.now();
        }, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, onRefresh, tabVisible]);

    // Pause/resume on visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pause refresh when tab is hidden
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else if (enabled && tabVisible) {
                // Resume refresh when tab becomes visible
                // Refresh immediately if it's been more than the interval
                if (Date.now() - lastRefreshRef.current > interval) {
                    onRefresh();
                    lastRefreshRef.current = Date.now();
                }

                intervalRef.current = setInterval(() => {
                    onRefresh();
                    lastRefreshRef.current = Date.now();
                }, interval);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, interval, onRefresh, tabVisible]);
}
