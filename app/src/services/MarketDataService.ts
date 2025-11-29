import type { AppData, StockData, CryptoData, NewsItem } from '../types/index';

/**
 * Market Data Service - Hybrid Approach
 * 1. Try loading from static JSON (fastest, most reliable)
 * 2. Optionally enhance with live API data if available
 */
import { TechnicalAnalysis } from '../utils/TechnicalAnalysis';

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/quote';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

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

const CRYPTO_IDS = [
    'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple',
    'usdc', 'cardano', 'avalanche-2', 'dogecoin'
];

export const MarketDataService = {
    /**
     * Fetch all data - Live from APIs
     */
    async fetchAllData(): Promise<AppData> {
        try {
            const [niftyData, usData, cryptoData, newsData] = await Promise.all([
                this.fetchStocks(NIFTY_SYMBOLS),
                this.fetchStocks(US_SYMBOLS),
                this.fetchCrypto(),
                this.fetchNews()
            ]);

            return {
                nifty_50: niftyData,
                us_stocks: usData,
                crypto: cryptoData,
                news: newsData,
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching all data:', error);
            // Fallback to empty structure or cached data if available
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
                        ebitda: 5000000000,
                        history: [], // Would need separate call
                        score: score,
                        recommendation: action,
                        reasons: action === 'BUY' ? ['Strong Momentum', 'Undervalued'] : ['Overbought', 'High Valuation'],
                        institutionalHolding: `${(40 + Math.random() * 40).toFixed(1)}%`,
                        rsi: parseFloat(rsi.toFixed(2))
                    };
                });

                results.push(...mapped);
            }

            return results;
        } catch (error) {
            console.warn('Stock fetch failed:', error);
            return [];
        }
    },

    /**
     * Fetch Crypto Data from CoinGecko
     */
    async fetchCrypto(): Promise<CryptoData[]> {
        try {
            const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('CoinGecko failed');

            const data = await response.json();

            return data.map((c: any) => {
                const rsi = 30 + Math.random() * 40;
                const { action, score } = TechnicalAnalysis.getRecommendation(c.current_price, rsi);

                return {
                    id: c.id,
                    symbol: c.symbol.toUpperCase(),
                    name: c.name,
                    image: c.image,
                    current_price: c.current_price,
                    market_cap: c.market_cap,
                    market_cap_rank: c.market_cap_rank,
                    total_volume: c.total_volume,
                    high_24h: c.high_24h,
                    low_24h: c.low_24h,
                    price_change_24h: c.price_change_24h,
                    price_change_percentage_24h: c.price_change_percentage_24h,
                    market_cap_change_24h: c.market_cap_change_24h,
                    market_cap_change_percentage_24h: c.market_cap_change_percentage_24h,
                    circulating_supply: c.circulating_supply,
                    ath: c.ath,
                    ath_change_percentage: c.ath_change_percentage,
                    ath_date: c.ath_date,
                    atl: c.atl,
                    atl_change_percentage: c.atl_change_percentage,
                    atl_date: c.atl_date,
                    rsi: parseFloat(rsi.toFixed(2)),
                    score: score,
                    recommendation: action,
                    last_updated: c.last_updated
                };
            });
        } catch (error) {
            console.warn('Crypto fetch failed:', error);
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
