import type { AppData, CryptoData } from '../types/index';
import { fetchStocksData } from './StockDataService';
import { fetchNewsData } from './NewsDataService';
import { fetchWithFallback, fetchWithTimeout, safeJsonParse, type DataSource } from '../utils/apiHelpers';

/**
 * Enhanced Crypto Data Service with multiple fallbacks
 */

// CoinGecko (Primary)
async function fetchCoinGecko(): Promise<CryptoData[]> {
    const response = await fetchWithTimeout('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h,7d,1y');
    if (!response.ok) throw new Error('CoinGecko failed');
    const data = await response.json();

    return data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        price_change_7d: coin.price_change_percentage_7d_in_currency || 0,
        price_change_1y: coin.price_change_percentage_1y_in_currency || 0,
        market_cap_change_24h: coin.market_cap_change_24h || 0,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h || 0,
        circulating_supply: coin.circulating_supply,
        ath: coin.ath,
        ath_change_percentage: coin.ath_change_percentage,
        ath_date: coin.ath_date,
        atl: coin.atl,
        atl_change_percentage: coin.atl_change_percentage,
        atl_date: coin.atl_date,
        last_updated: coin.last_updated,
        recommendation: coin.price_change_percentage_24h > 5 ? 'STRONG BUY' : coin.price_change_percentage_24h > 0 ? 'BUY' : coin.price_change_percentage_24h > -5 ? 'HOLD' : 'SELL',
        rsi: Math.min(100, Math.max(0, 50 + (coin.price_change_percentage_24h * 2))),
        macd_vs_200ema: coin.price_change_24h > 0 ? 'BULLISH' : 'BEARISH',
    }));
}

// CoinCap API (Secondary)
async function fetchCoinCap(): Promise<CryptoData[]> {
    const response = await fetchWithTimeout('https://api.coincap.io/v2/assets?limit=20');
    if (!response.ok) throw new Error('CoinCap failed');
    const data = await safeJsonParse<any>(response);

    if (!data?.data) throw new Error('Invalid CoinCap response');

    return data.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
        current_price: parseFloat(coin.priceUsd || '0'),
        market_cap: parseFloat(coin.marketCapUsd || '0'),
        market_cap_rank: parseInt(coin.rank || '0'),
        total_volume: parseFloat(coin.volumeUsd24Hr || '0'),
        price_change_percentage_24h: parseFloat(coin.changePercent24Hr || '0'),
        price_change_24h: 0,
        price_change_7d: 0,
        price_change_1y: 0,
        high_24h: 0,
        low_24h: 0,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: parseFloat(coin.supply || '0'),
        ath: 0,
        ath_change_percentage: 0,
        ath_date: '',
        atl: 0,
        atl_change_percentage: 0,
        atl_date: '',
        last_updated: new Date().toISOString(),
        recommendation: parseFloat(coin.changePercent24Hr) > 5 ? 'BUY' : parseFloat(coin.changePercent24Hr) > 0 ? 'HOLD' : 'SELL',
        rsi: Math.min(100, Math.max(0, 50 + (parseFloat(coin.changePercent24Hr) * 2))),
        macd_vs_200ema: parseFloat(coin.changePercent24Hr) > 0 ? 'BULLISH' : 'BEARISH',
    }));
}

// Binance Public API (Tertiary)
async function fetchBinance(): Promise<CryptoData[]> {
    const response = await fetchWithTimeout('https://api.binance.com/api/v3/ticker/24hr');
    if (!response.ok) throw new Error('Binance failed');
    const data = await response.json();

    // Filter top coins by volume
    const topCoins = data
        .filter((coin: any) => coin.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 20);

    return topCoins.map((coin: any, index: number) => ({
        id: coin.symbol.replace('USDT', '').toLowerCase(),
        symbol: coin.symbol.replace('USDT', ''),
        name: coin.symbol.replace('USDT', ''),
        image: '',
        current_price: parseFloat(coin.lastPrice),
        market_cap: 0,
        market_cap_rank: index + 1,
        total_volume: parseFloat(coin.quoteVolume),
        high_24h: parseFloat(coin.highPrice),
        low_24h: parseFloat(coin.lowPrice),
        price_change_24h: parseFloat(coin.priceChange),
        price_change_percentage_24h: parseFloat(coin.priceChangePercent),
        price_change_7d: 0,
        price_change_1y: 0,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: 0,
        ath: 0,
        ath_change_percentage: 0,
        ath_date: '',
        atl: 0,
        atl_change_percentage: 0,
        atl_date: '',
        last_updated: new Date().toISOString(),
        recommendation: parseFloat(coin.priceChangePercent) > 5 ? 'BUY' : parseFloat(coin.priceChangePercent) > 0 ? 'HOLD' : 'SELL',
        rsi: Math.min(100, Math.max(0, 50 + (parseFloat(coin.priceChangePercent) * 2))),
        macd_vs_200ema: parseFloat(coin.priceChange) > 0 ? 'BULLISH' : 'BEARISH',
    }));
}

/**
 * Main Market Data Service
 */
export const MarketDataService = {
    async fetchCryptoData(): Promise<CryptoData[]> {
        const sources: DataSource<CryptoData[]>[] = [ // Fix: initialize as array
            { name: 'CoinGecko', priority: 1, fetch: fetchCoinGecko },
            { name: 'CoinCap', priority: 2, fetch: fetchCoinCap },
            { name: 'Binance', priority: 3, fetch: fetchBinance },
        ];

        try {
            return await fetchWithFallback(sources, 'crypto-data', 60000); // 1 min cache
        } catch (error) {
            console.error('All crypto sources failed:', error);
            return [];
        }
    },

    async fetchStockData(market: 'india' | 'us') {
        try {
            return await fetchStocksData(market);
        } catch (error) {
            console.error(`Failed to fetch ${market} stocks:`, error);
            return [];
        }
    },

    async fetchNews() {
        try {
            return await fetchNewsData();
        } catch (error) {
            console.error('Failed to fetch news:', error);
            return [];
        }
    },

    async fetchAllData(): Promise<AppData> {
        const [crypto, nifty, us, news] = await Promise.all([
            this.fetchCryptoData(),
            this.fetchStockData('india'),
            this.fetchStockData('us'),
            this.fetchNews()
        ]);

        return {
            nifty_50: nifty,
            us_stocks: us,
            crypto: crypto,
            news: news,
            last_updated: new Date().toISOString()
        };
    }
};
