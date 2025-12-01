import type { AppData, StockData, CryptoData, NewsItem } from '../types/index';

/**
 * Market Data Service - Hybrid Approach
 * 1. Try loading from static JSON (fastest, most reliable)
 * 2. Optionally enhance with live API data if available
 */
import { TechnicalAnalysis } from '../utils/TechnicalAnalysis';
import { fetchWithFallback, fetchWithTimeout, rateLimiter, withRetry } from '../utils/apiHelpers';
import { fetchNewsData } from './NewsDataService';

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/quote';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';
const CMC_KEY = import.meta.env.VITE_CMC_API_KEY || '';


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

const BINANCE_SYMBOL_MAP: Record<string, string> = {
    'bitcoin': 'BTCUSDT',
    'ethereum': 'ETHUSDT',
    'tether': 'USDTUSDT',
    'binancecoin': 'BNBUSDT',
    'solana': 'SOLUSDT',
    'ripple': 'XRPUSDT',
    'usdc': 'USDCUSDT',
    'cardano': 'ADAUSDT',
    'avalanche-2': 'AVAXUSDT',
    'dogecoin': 'DOGEUSDT'
};

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

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
            const [niftyData, usData, cryptoData, newsData] = await Promise.all([
                this.fetchStocks(NIFTY_SYMBOLS),
                this.fetchStocks(US_SYMBOLS),
                this.fetchCrypto(),
                fetchNewsData()
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

            return results;
        } catch (error) {
            console.warn('Stock fetch failed:', error);
            return [];
        }
    },

    /**
     * Normalize crypto data from various sources to CryptoData
     */
    normalizeCrypto(c: any, source: 'coingecko' | 'cmc'): CryptoData {
        if (source === 'coingecko') {
            const rsi = 30 + Math.random() * 40;
            const { action, score } = TechnicalAnalysis.getRecommendation(c.current_price, rsi);
            return {
                id: c.id,
                symbol: (c.symbol || '').toUpperCase(),
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
                price_change_percentage_7d_in_currency: c.price_change_percentage_7d_in_currency,
                price_change_percentage_30d_in_currency: c.price_change_percentage_30d_in_currency,
                price_change_percentage_200d_in_currency: c.price_change_percentage_200d_in_currency,
                price_change_percentage_1y_in_currency: c.price_change_percentage_1y_in_currency,
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
        } else {
            // CoinMarketCap mapping
            const quote = c.quote?.USD || {};
            const rsi = 30 + Math.random() * 40;
            const { action, score } = TechnicalAnalysis.getRecommendation(quote.price || 0, rsi);
            return {
                id: (c.slug || c.symbol || '').toLowerCase(),
                symbol: (c.symbol || '').toUpperCase(),
                name: c.name,
                image: '',
                current_price: quote.price || 0,
                market_cap: quote.market_cap || 0,
                market_cap_rank: c.cmc_rank || 0,
                total_volume: quote.volume_24h || 0,
                high_24h: quote.price || 0, // CMC does not provide high_24h in basic quote
                low_24h: quote.price || 0,
                price_change_24h: quote.price_change_24h || quote.percent_change_24h || 0,
                price_change_percentage_24h: quote.percent_change_24h || 0,
                market_cap_change_24h: 0,
                market_cap_change_percentage_24h: 0,
                circulating_supply: c.circulating_supply || 0,
                ath: 0,
                ath_change_percentage: 0,
                ath_date: '',
                atl: 0,
                atl_change_percentage: 0,
                atl_date: '',
                rsi: parseFloat(rsi.toFixed(2)),
                score: score,
                recommendation: action,
                last_updated: c.last_updated || new Date().toISOString()
            };
        }
    },

    /**
     * Fetch crypto via multiple sources with fallback, caching, and rate-limiting + retry
     */
    async fetchCrypto(): Promise<CryptoData[]> {
        const idsCsv = CRYPTO_IDS.join(',');
        const cacheKey = 'crypto-data';

        const sources: { name: string; priority: number; fetch: () => Promise<CryptoData[]> }[] = [];

        // CoinGecko primary
        sources.push({
            name: 'CoinGecko',
            priority: 1,
            fetch: async () => {
                await rateLimiter.waitForSlot('coingecko', 45, 60000);
                const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsCsv}&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d,30d,200d,1y`;
                const response = await withRetry(() => fetchWithTimeout(url), 3, 400, 250);
                if (!response.ok) throw new Error('CoinGecko failed');
                const data = await response.json();

                // Enhance with technicals from Binance
                const enhancedData = await Promise.all(data.map(async (coin: any) => {
                    const binanceSymbol = BINANCE_SYMBOL_MAP[coin.id];
                    let technicals = {};

                    if (binanceSymbol) {
                        try {
                            // Fetch OHLCV from Binance
                            // limit 100 days
                            const klinesUrl = `${BINANCE_BASE_URL}/klines?symbol=${binanceSymbol}&interval=1d&limit=100`;
                            const klinesRes = await fetch(klinesUrl);
                            if (klinesRes.ok) {
                                const klines = await klinesRes.json();
                                // klines format: [ [open_time, open, high, low, close, volume, ...], ... ]
                                const highs = klines.map((k: any) => parseFloat(k[2]));
                                const lows = klines.map((k: any) => parseFloat(k[3]));
                                const closes = klines.map((k: any) => parseFloat(k[4]));
                                const volumes = klines.map((k: any) => parseFloat(k[5]));

                                const rsiSeries = TechnicalAnalysis.rsiSeries(closes, 14);
                                const currentRsi = rsiSeries[rsiSeries.length - 1] || 50;

                                const { macd } = TechnicalAnalysis.macdSeries(closes);
                                const currentMacd = macd[macd.length - 1] || 0;

                                const ema200Series = TechnicalAnalysis.emaSeries(closes, 200);
                                const currentEma200 = ema200Series[ema200Series.length - 1];

                                const adxSeries = TechnicalAnalysis.adxSeries(highs, lows, closes, 14);
                                const currentAdx = adxSeries[adxSeries.length - 1] || 0;

                                const cmfSeries = TechnicalAnalysis.cmfSeries(highs, lows, closes, volumes, 20);
                                const currentCmf = cmfSeries[cmfSeries.length - 1] || 0;

                                const { upper, lower } = TechnicalAnalysis.bollingerBands(closes, 20, 2);
                                const currentUpper = upper[upper.length - 1];
                                const currentLower = lower[lower.length - 1];

                                // Squeeze: Bollinger Bands inside Keltner Channels (simplified here as BB width low)
                                const bbWidth = (currentUpper - currentLower) / closes[closes.length - 1];
                                const squeeze = bbWidth < 0.05 ? 'On' : 'No squeeze';

                                const dist200 = currentEma200 ? ((closes[closes.length - 1] - currentEma200) / currentEma200) * 100 : 0;

                                // MACD Slope
                                const prevMacd = macd[macd.length - 2] || 0;
                                const macdSlope = currentMacd - prevMacd;

                                // Score Calculation
                                let score = 50;
                                if (currentRsi < 30) score += 15;
                                if (currentRsi > 70) score -= 15;
                                if (currentAdx > 25) score += 10; // Strong trend
                                if (currentCmf > 0.05) score += 10; // Buying pressure
                                if (dist200 > 0) score += 10; // Above 200 EMA
                                if (macdSlope > 0) score += 5;

                                // Cap score
                                score = Math.min(100, Math.max(0, score));

                                let rec = 'HOLD';
                                if (score >= 75) rec = 'STRONG BUY';
                                else if (score >= 60) rec = 'BUY';
                                else if (score <= 25) rec = 'STRONG SELL';
                                else if (score <= 40) rec = 'SELL';

                                // 3m Return (approx 90 days)
                                const price3mAgo = closes[closes.length - 91];
                                const change3m = price3mAgo ? ((closes[closes.length - 1] - price3mAgo) / price3mAgo) * 100 : 0;

                                technicals = {
                                    rsi: currentRsi,
                                    macd_vs_200ema: currentMacd > 0 ? 'BULLISH' : 'BEARISH',
                                    adx: currentAdx,
                                    cmf: currentCmf,
                                    distance_from_200_ema: dist200,
                                    macd_slope: macdSlope,
                                    squeeze: squeeze,
                                    score: score,
                                    recommendation: rec,
                                    price_change_percentage_3m: change3m
                                };
                            }
                        } catch (e) {
                            console.warn(`Failed to fetch history for ${coin.id}`, e);
                        }
                    }

                    return {
                        ...this.normalizeCrypto(coin, 'coingecko'),
                        ...technicals
                    };
                }));

                return enhancedData;
            }
        });

        // CoinMarketCap fallback (requires API key)
        if (CMC_KEY) {
            sources.push({
                name: 'CoinMarketCap',
                priority: 2,
                fetch: async () => {
                    await rateLimiter.waitForSlot('cmc', 30, 60000);
                    // Use symbols derived from ids (rough mapping). For demo, map known ids to symbols.
                    const symbolMap: Record<string, string> = {
                        bitcoin: 'BTC', ethereum: 'ETH', tether: 'USDT', binancecoin: 'BNB', solana: 'SOL', ripple: 'XRP', usdc: 'USDC', cardano: 'ADA', 'avalanche-2': 'AVAX', dogecoin: 'DOGE'
                    };
                    const symbols = CRYPTO_IDS.map(id => symbolMap[id]).filter(Boolean).join(',');
                    const url = `${COINMARKETCAP_BASE_URL}/cryptocurrency/quotes/latest?symbol=${symbols}`;
                    const response = await withRetry(() => fetchWithTimeout(url, { headers: { 'X-CMC_PRO_API_KEY': CMC_KEY } }), 3, 600, 300);
                    if (!response.ok) throw new Error(`CMC error: ${response.status}`);
                    const json = await response.json();
                    const data = Object.values(json.data || {}) as any[];
                    return data.map((c: any) => this.normalizeCrypto(c, 'cmc'));
                }
            });
        }

        // Fallback to empty array if all fail (handled by fetchWithFallback throwing)
        try {
            const data = await fetchWithFallback<CryptoData[]>(sources, cacheKey, 300000); // 5 min cache
            return data;
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
