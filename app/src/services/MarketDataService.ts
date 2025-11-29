import type { AppData } from '../types/index';

/**
 * Market Data Service - Hybrid Approach
 * 1. Try loading from static JSON (fastest, most reliable)
 * 2. Optionally enhance with live API data if available
 */
export const MarketDataService = {
    /**
     * Fetch all data - Hybrid approach
     * Loads static JSON immediately, can be enhanced with live data later
     */
    async fetchAllData(): Promise<AppData> {
        try {
            // Primary: Load from Python-generated JSON file (always works)
            const response = await fetch('/latest_data.json');

            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.statusText}`);
            }

            const data = await response.json();

            // Return the data immediately
            // TODO: Can enhance with live API data in background for crypto prices
            return {
                nifty_50: data.nifty_50 || [],
                us_stocks: data.us_stocks || [],
                crypto: data.crypto || [],
                news: data.news || [],
                last_updated: data.last_updated || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading market data:', error);

            // Fallback: Return empty structure
            return {
                nifty_50: [],
                us_stocks: [],
                crypto: [],
                news: [],
                last_updated: new Date().toISOString()
            };
        }
    },

    /**
     * Fetch live crypto prices (optional enhancement)
     * Can be called separately to update crypto prices in real-time
     */
    async fetchLiveCryptoPrices(): Promise<Array<{ symbol: string, price: number }>> {
        try {
            // Try CoinGecko
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,cardano,ripple,solana,polkadot,dogecoin,avalanche-2&vs_currencies=usd',
                { signal: AbortSignal.timeout(5000) }
            );

            if (response.ok) {
                const data = await response.json();
                return Object.entries(data).map(([id, prices]: [string, any]) => ({
                    symbol: id.toUpperCase(),
                    price: prices.usd
                }));
            }
        } catch (error) {
            console.warn('Live crypto prices unavailable:', error);
        }

        return [];
    }
};
