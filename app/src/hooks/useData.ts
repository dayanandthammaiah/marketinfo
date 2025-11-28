import { useState, useEffect } from 'react';
import type { AppData } from '../types/index';

export const useData = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/latest_data.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const json = await response.json();
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
