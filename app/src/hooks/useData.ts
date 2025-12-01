import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppData } from '../types/index';
import { MarketDataService } from '../services/MarketDataService';

const CACHE_KEY = 'marketdata_cache_v2';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
    data: AppData;
    timestamp: number;
}

export const useData = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async (skipCache = false) => {
        try {
            // Check cache first (unless explicitly skipping)
            if (!skipCache) {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    try {
                        const { data: cachedData, timestamp }: CachedData = JSON.parse(cached);
                        const age = Date.now() - timestamp;

                        if (age < CACHE_TTL) {
                            setData(cachedData);
                            setLastUpdated(new Date(timestamp));
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.warn('Cache parse error:', e);
                    }
                }
            }

            // Cancel any ongoing requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            // Fetch data from service
            const json = await MarketDataService.fetchAllData();

            // Update state
            setData(json);
            const now = new Date();
            setLastUpdated(now);
            setError(null);

            // Update cache
            const cacheData: CachedData = {
                data: json,
                timestamp: now.getTime(),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return; // Request was cancelled, ignore
            }
            console.error("Fetch error:", err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        const now = Date.now();
        const lastRefresh = parseInt(localStorage.getItem('last_refresh_timestamp') || '0');

        // 60 seconds cooldown
        if (now - lastRefresh < 60000) {
            console.log('Refresh cooldown active');
            return;
        }

        setIsRefreshing(true);
        setError(null);
        localStorage.setItem('last_refresh_timestamp', now.toString());
        await fetchData(true); // Skip cache
    }, [fetchData]);

    useEffect(() => {
        fetchData();

        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData]);

    return { data, loading, error, lastUpdated, isRefreshing, refresh };
};
