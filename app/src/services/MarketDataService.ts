import type { AppData, StockData, CryptoData, NewsItem } from '../types/index';

/**
 * Market Data Service - Hybrid Approach
 * 1. Try loading from static JSON (fastest, most reliable)
 * 2. Optionally enhance with live API data if available
 */
import { TechnicalAnalysis } from '../utils/TechnicalAnalysis';
import { fetchWithFallback, type DataSource } from '../utils/apiHelpers';
import { fetchNewsData } from './NewsDataService';

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/quote';

// List of symbols to fetch
const NIFTY_SYMBOLS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
    'LICI.NS', 'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'HCLTECH.NS',
    'MARUTI.NS', 'SUNPHARMA.NS', 'TITAN.NS', 'BAJFINANCE.NS', 'ULTRACEMCO.NS'
];

const US_SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK-B', 'V', 'JNJ'
];

export const MarketDataService = {
    /**
     * Fetch all data - Live from APIs
     */
    async fetchAllData(): Promise<AppData> {
        // 1) Try local static snapshot first (no CORS, fastest in dev)
        try {
            const res = await fetch('/latest_data.json', { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                // Expecting shape similar to AppData
                if (json && (json.nifty_50 || json.us_stocks || json.crypto || json.news)) {
                    return json as AppData;
                }
            }
        } catch (e) {
            console.warn('Static latest_data.json not available, falling back to live APIs');
        }

        // 2) Fallback to live APIs (may be blocked by CORS in browser)
        try {
            // Fetch stocks and crypto in parallel
            const [niftyData, usData, cryptoData] = await Promise.all([
                this.fetchStocks(NIFTY_SYMBOLS),
                this.fetchStocks(US_SYMBOLS),
                this.fetchCrypto()
            ]);

            // Fetch news separately to prevent it from failing the whole batch
            let newsData: NewsItem[] = [];
            try {
                newsData = await fetchNewsData();
            } catch (e) {
                console.warn('News fetch failed in MarketDataService, using empty array:', e);
                newsData = [];
            }

            return {
                nifty_50: niftyData,
                us_stocks: usData,
                crypto: cryptoData,
                news: newsData,
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching all data:', error);
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
     * Fetch Stock Data from Yahoo Finance
     */
    async fetchStocks(symbols: string[]): Promise<StockData[]> {
        try {
            // Chunk symbols to avoid URL length limits
            const chunks = [];
            for (let i = 0; i < symbols.length; i += 10) {
                chunks.push(symbols.slice(i, i + 10));
            }

            const results: StockData[] = [];

            for (const chunk of chunks) {
                const url = `${YAHOO_BASE_URL}?symbols=${chunk.join(',')}`;
                // Note: This might fail with CORS on web without a proxy. 
                // In a real app, use a backend proxy. For this demo, we hope for the best or use a CORS proxy if needed.
                // Using a public CORS proxy for demo purposes if direct fails is common, but let's try direct first.
                // If running in Capacitor, it should work.

                const response = await fetch(url);
                if (!response.ok) continue;

                const json = await response.json();
                const quotes = json.quoteResponse?.result || [];

                const mapped = quotes.map((q: any) => {
                    const price = q.regularMarketPrice || 0;
                    const change = q.regularMarketChange || 0;
                    const changePercent = q.regularMarketChangePercent || 0;

                    // Calculate simple recommendation based on technicals (mocked for now as we don't have full history here)
                    // In a real app, we'd fetch chart data to calc RSI.
                    const rsi = 30 + Math.random() * 40; // Mock RSI between 30-70 for demo
                    const { action, score } = TechnicalAnalysis.getRecommendation(price, rsi);

                    return {
                        symbol: q.symbol,
                        name: q.shortName || q.longName || q.symbol,
                        sector: 'Technology', // Yahoo quote doesn't always have sector, placeholder
                        industry: 'Consumer Electronics',
                        current_price: price,
                        change: change,
                        changePercent: changePercent,
                        volume: this.formatNumber(q.regularMarketVolume),
                        market_cap: this.formatNumber(q.marketCap),
                        pe_ratio: q.trailingPE || 0,
                        forward_pe: q.forwardPE || 0,
                        peg_ratio: q.pegRatio || 0,
                        price_to_book: q.priceToBook || 0,
                        roce: 15 + Math.random() * 10, // Mock
                        eps_growth: 10 + Math.random() * 5, // Mock
                        debt_to_equity: 0.5, // Mock
                        free_cashflow: 1000000000, // Mock
                        fcf_yield: 0.03, // Mock
                        operating_margins: 0.25, // Mock
                        ideal_range: `${(price * 0.9).toFixed(0)} - ${(price * 1.1).toFixed(0)}`,
                        price_6m_return: changePercent * 2, // Mock
                        debt_to_ebitda: 1.2,
                        ev_to_ebitda: 15,
                        ev_vs_sector: -5 + Math.random() * 10, // Mock
                        ebitda: 5000000000,
                        history: [], // Would need separate call
                        score: score,
                        recommendation: action,
                        reasons: action === 'BUY' ? ['Strong Momentum', 'Undervalued'] : ['Overbought', 'High Valuation'],
                        institutionalHolding: `${(40 + Math.random() * 40).toFixed(1)}%`,
                        rsi: parseFloat(rsi.toFixed(2)),
                        esg_score: 60 + Math.random() * 30, // Mock
                        earnings_quality: Math.random() > 0.5 ? 'High' : 'Medium', // Mock
                        rank: Math.floor(Math.random() * 100) + 1 // Mock
                    };
                });

                results.push(...mapped);
            }

            // Deduplicate by symbol
            console.log(`Fetched ${results.length} stocks. Deduplicating...`);
            const uniqueResults = Array.from(new Map(results.map(item => [item.symbol, item])).values());
            console.log(`Unique stocks: ${uniqueResults.length}`);
            return uniqueResults;
        } catch (error) {
            console.warn('Stock fetch failed:', error);
            return [];
        }
    },

    /**
     * Fetch crypto via multiple sources with fallback, caching, and rate-limiting + retry
     */
    async fetchCrypto(): Promise<CryptoData[]> {
        // Define sources for fallback
        const sources: DataSource<CryptoData[]>[] = [
            {
                name: 'CoinGecko',
                priority: 1,
                fetch: async () => {
                    // Implementation for CoinGecko would go here
                    // For now, returning empty to trigger fallback or use a mock
                    return [];
                }
            },
            {
                name: 'Binance',
                priority: 2,
                fetch: async () => {
                    return [];
                }
            }
        ];

        // Fallback to static data if live fetch fails
        sources.push({
            name: 'Static Fallback',
            priority: 3,
            fetch: async () => [
                {
                    id: 'bitcoin',
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    current_price: 65432.10,
                    price_change_percentage_24h: 2.5,
                    market_cap: 1200000000000,
                    volume_24h: 35000000000,
                    circulating_supply: 19000000,
                    total_supply: 21000000,
                    rank: 1,
                    sparkline_in_7d: { price: [] },
                    roi: 150,
                    ath: 73000,
                    ath_change_percentage: -10,
                    ath_date: '2024-03-14',
                    atl: 65,
                    atl_change_percentage: 100000,
                    atl_date: '2013-07-05',
                    last_updated: new Date().toISOString(),
                    price_change_24h: 1500,
                    market_cap_change_24h: 20000000000,
                    market_cap_change_percentage_24h: 1.8,
                    high_24h: 66000,
                    low_24h: 64000,
                    institutionalHolding: '45%',
                    rsi: 65,
                    dominance: 52,
                    recommendation: 'BUY',
                    score: 85,
                    sentiment: 'Bullish',
                    market_cap_rank: 1,
                    total_volume: 35000000000
                },
                {
                    id: 'ethereum',
                    symbol: 'ETH',
                    name: 'Ethereum',
                    current_price: 3456.78,
                    price_change_percentage_24h: 1.2,
                    market_cap: 400000000000,
                    volume_24h: 15000000000,
                    circulating_supply: 120000000,
                    total_supply: 120000000,
                    rank: 2,
                    sparkline_in_7d: { price: [] },
                    roi: 200,
                    ath: 4800,
                    ath_change_percentage: -28,
                    ath_date: '2021-11-10',
                    atl: 0.43,
                    atl_change_percentage: 800000,
                    atl_date: '2015-10-20',
                    last_updated: new Date().toISOString(),
                    price_change_24h: 40,
                    market_cap_change_24h: 5000000000,
                    market_cap_change_percentage_24h: 1.1,
                    high_24h: 3500,
                    low_24h: 3400,
                    institutionalHolding: '30%',
                    rsi: 58,
                    dominance: 18,
                    recommendation: 'HOLD',
                    score: 70,
                    sentiment: 'Neutral',
                    market_cap_rank: 2,
                    total_volume: 15000000000
                }
            ]
        });

        const cacheKey = 'crypto-data';

        try {
            const data = await fetchWithFallback<CryptoData[]>(sources, cacheKey, 300000); // 5 min cache
            // Deduplicate by symbol
            const uniqueData = Array.from(new Map(data.map(item => [item.symbol, item])).values());
            return uniqueData;
        } catch (e) {
            console.warn('All crypto sources failed:', e);
            return [];
        }
    },

    /**
     * Fetch News (Mock/RSS fallback)
     */
    async fetchNews(): Promise<NewsItem[]> {
        // For demo, we'll return static high-quality news to ensure it looks good
        // In production, use NewsAPI with a backend proxy to hide the key.
        return [
            {
                title: "Global Markets Rally as Inflation Data Shows Cooling Trend",
                link: "#",
                source: "Bloomberg",
                published: new Date().toISOString(),
                category: "Markets",
                summary: "Stocks across Asia and Europe surged today after the latest US inflation print came in lower than expected, fueling hopes of rate cuts.",
                image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1000"
            },
            {
                title: "Bitcoin Reclaims $65,000 Level Amid Institutional Inflows",
                link: "#",
                source: "CoinDesk",
                published: new Date(Date.now() - 3600000).toISOString(),
                category: "Cryptocurrency",
                summary: "The world's largest cryptocurrency saw renewed buying interest from ETFs, pushing the price back above key resistance levels.",
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1000"
            },
            {
                title: "Tech Giants Announce New AI Partnerships",
                link: "#",
                source: "TechCrunch",
                published: new Date(Date.now() - 7200000).toISOString(),
                category: "Technology",
                summary: "Leading tech firms are joining forces to establish new standards for artificial intelligence safety and development.",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000"
            },
            {
                title: "India's GDP Growth Forecast Upgraded by IMF",
                link: "#",
                source: "Economic Times",
                published: new Date(Date.now() - 10800000).toISOString(),
                category: "Economy",
                summary: "The International Monetary Fund has raised its growth projection for India, citing strong domestic demand and manufacturing output.",
                image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=1000"
            }
        ];
    },

    formatNumber(num: number): string {
        if (!num) return '0';
        if (num >= 1.0e+12) return (num / 1.0e+12).toFixed(2) + "T";
        if (num >= 1.0e+9) return (num / 1.0e+9).toFixed(2) + "B";
        if (num >= 1.0e+6) return (num / 1.0e+6).toFixed(2) + "M";
        if (num >= 1.0e+3) return (num / 1.0e+3).toFixed(2) + "K";
        return num.toFixed(2);
    }
};
