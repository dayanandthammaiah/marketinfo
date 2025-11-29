import type { AppData, StockData, CryptoData, NewsItem } from '../types/index';

// Helper to generate random price changes for simulation
const randomChange = (base: number, volatility: number) => {
    const change = base * (Math.random() * volatility * 2 - volatility);
    return base + change;
};

const SIMULATED_STOCKS: StockData[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', current_price: 2987.50, change: 1.2, changePercent: 0.45, volume: '12M', market_cap: '19.5T', pe_ratio: 28.5, sector: 'Energy', recommendation: 'BUY', institutionalHolding: '45%', industry: 'Oil & Gas', forward_pe: 25, peg_ratio: 1.2, price_to_book: 3.5, roce: 15, eps_growth: 12, debt_to_equity: 0.5, free_cashflow: 5000, fcf_yield: 2.5, operating_margins: 18, ideal_range: '2800-3200', price_6m_return: 15, debt_to_ebitda: 1.5, ev_to_ebitda: 12, ebitda: 10000, history: [], score: 85, reasons: ['Strong fundamentals'], rsi: 58 },
    { symbol: 'TCS', name: 'Tata Consultancy Svc', current_price: 4120.00, change: -15.00, changePercent: -0.36, volume: '2.1M', market_cap: '14.8T', pe_ratio: 32.1, sector: 'Technology', recommendation: 'HOLD', institutionalHolding: '38%', industry: 'IT Services', forward_pe: 28, peg_ratio: 1.5, price_to_book: 8.5, roce: 45, eps_growth: 10, debt_to_equity: 0.1, free_cashflow: 4000, fcf_yield: 3.0, operating_margins: 25, ideal_range: '3800-4200', price_6m_return: 10, debt_to_ebitda: 0.5, ev_to_ebitda: 20, ebitda: 8000, history: [], score: 78, reasons: ['Stable growth'], rsi: 45 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', current_price: 1650.25, change: 22.50, changePercent: 1.38, volume: '18M', market_cap: '12.2T', pe_ratio: 19.8, sector: 'Finance', recommendation: 'STRONG BUY', institutionalHolding: '62%', industry: 'Banking', forward_pe: 16, peg_ratio: 1.0, price_to_book: 2.8, roce: 18, eps_growth: 15, debt_to_equity: 0.8, free_cashflow: 3000, fcf_yield: 2.0, operating_margins: 22, ideal_range: '1500-1800', price_6m_return: -5, debt_to_ebitda: 2.0, ev_to_ebitda: 15, ebitda: 6000, history: [], score: 92, reasons: ['Undervalued'], rsi: 35 },
    { symbol: 'INFY', name: 'Infosys', current_price: 1680.00, change: 8.00, changePercent: 0.48, volume: '5.5M', market_cap: '6.8T', pe_ratio: 24.5, sector: 'Technology', recommendation: 'BUY', institutionalHolding: '41%', industry: 'IT Services', forward_pe: 22, peg_ratio: 1.3, price_to_book: 6.5, roce: 35, eps_growth: 8, debt_to_equity: 0.2, free_cashflow: 2500, fcf_yield: 3.5, operating_margins: 23, ideal_range: '1500-1700', price_6m_return: 8, debt_to_ebitda: 0.8, ev_to_ebitda: 18, ebitda: 4000, history: [], score: 80, reasons: ['Good dividend'], rsi: 52 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', current_price: 1090.00, change: 12.00, changePercent: 1.11, volume: '14M', market_cap: '7.5T', pe_ratio: 18.2, sector: 'Finance', recommendation: 'BUY', institutionalHolding: '58%', industry: 'Banking', forward_pe: 15, peg_ratio: 0.9, price_to_book: 2.5, roce: 16, eps_growth: 18, debt_to_equity: 0.9, free_cashflow: 2800, fcf_yield: 2.2, operating_margins: 20, ideal_range: '1000-1200', price_6m_return: 20, debt_to_ebitda: 2.2, ev_to_ebitda: 14, ebitda: 5000, history: [], score: 88, reasons: ['Growth momentum'], rsi: 65 },
    { symbol: 'SBIN', name: 'State Bank of India', current_price: 780.50, change: -5.50, changePercent: -0.70, volume: '22M', market_cap: '6.9T', pe_ratio: 12.5, sector: 'Finance', recommendation: 'HOLD', institutionalHolding: '35%', industry: 'Banking', forward_pe: 10, peg_ratio: 0.8, price_to_book: 1.5, roce: 12, eps_growth: 10, debt_to_equity: 1.2, free_cashflow: 1500, fcf_yield: 4.0, operating_margins: 15, ideal_range: '750-850', price_6m_return: 5, debt_to_ebitda: 3.0, ev_to_ebitda: 10, ebitda: 3000, history: [], score: 70, reasons: ['Stable'], rsi: 48 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', current_price: 1250.00, change: 18.00, changePercent: 1.46, volume: '6M', market_cap: '6.5T', pe_ratio: 45.0, sector: 'Telecom', recommendation: 'BUY', institutionalHolding: '28%', industry: 'Telecom', forward_pe: 40, peg_ratio: 2.0, price_to_book: 5.0, roce: 20, eps_growth: 15, debt_to_equity: 1.5, free_cashflow: 2000, fcf_yield: 1.5, operating_margins: 35, ideal_range: '1200-1300', price_6m_return: 25, debt_to_ebitda: 2.5, ev_to_ebitda: 15, ebitda: 4000, history: [], score: 82, reasons: ['Market leader'], rsi: 68 },
    { symbol: 'ITC', name: 'ITC Ltd', current_price: 435.00, change: 2.00, changePercent: 0.46, volume: '15M', market_cap: '5.4T', pe_ratio: 26.0, sector: 'Consumer', recommendation: 'HOLD', institutionalHolding: '42%', industry: 'Tobacco', forward_pe: 24, peg_ratio: 1.8, price_to_book: 6.0, roce: 30, eps_growth: 8, debt_to_equity: 0.0, free_cashflow: 3500, fcf_yield: 3.2, operating_margins: 32, ideal_range: '420-450', price_6m_return: 2, debt_to_ebitda: 0.1, ev_to_ebitda: 18, ebitda: 5000, history: [], score: 75, reasons: ['Defensive'], rsi: 55 },
    { symbol: 'L&T', name: 'Larsen & Toubro', current_price: 3650.00, change: 45.00, changePercent: 1.25, volume: '1.8M', market_cap: '5.0T', pe_ratio: 35.0, sector: 'Construction', recommendation: 'BUY', institutionalHolding: '33%', industry: 'Construction', forward_pe: 30, peg_ratio: 1.5, price_to_book: 4.0, roce: 18, eps_growth: 12, debt_to_equity: 0.8, free_cashflow: 1000, fcf_yield: 1.0, operating_margins: 12, ideal_range: '3500-3800', price_6m_return: 30, debt_to_ebitda: 1.8, ev_to_ebitda: 20, ebitda: 2000, history: [], score: 85, reasons: ['Order book'], rsi: 62 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', current_price: 2450.00, change: -10.00, changePercent: -0.41, volume: '1.2M', market_cap: '5.7T', pe_ratio: 55.0, sector: 'Consumer', recommendation: 'HOLD', institutionalHolding: '30%', industry: 'FMCG', forward_pe: 50, peg_ratio: 3.0, price_to_book: 10.0, roce: 25, eps_growth: 5, debt_to_equity: 0.1, free_cashflow: 3000, fcf_yield: 2.0, operating_margins: 20, ideal_range: '2400-2600', price_6m_return: -8, debt_to_ebitda: 0.2, ev_to_ebitda: 35, ebitda: 4000, history: [], score: 65, reasons: ['Slow growth'], rsi: 42 },
];

const SIMULATED_US_STOCKS: StockData[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', current_price: 185.50, change: 1.20, changePercent: 0.65, volume: '45M', market_cap: '2.8T', pe_ratio: 28.5, sector: 'Technology', recommendation: 'BUY', institutionalHolding: '58%', industry: 'Consumer Electronics', forward_pe: 26, peg_ratio: 2.5, price_to_book: 35, roce: 50, eps_growth: 10, debt_to_equity: 1.5, free_cashflow: 100000, fcf_yield: 3.5, operating_margins: 30, ideal_range: '170-200', price_6m_return: 12, debt_to_ebitda: 0.5, ev_to_ebitda: 22, ebitda: 120000, history: [], score: 85, reasons: ['Ecosystem strength'], rsi: 60 },
    { symbol: 'MSFT', name: 'Microsoft Corp', current_price: 420.00, change: 5.50, changePercent: 1.32, volume: '22M', market_cap: '3.1T', pe_ratio: 35.0, sector: 'Technology', recommendation: 'STRONG BUY', institutionalHolding: '62%', industry: 'Software', forward_pe: 30, peg_ratio: 2.2, price_to_book: 12, roce: 40, eps_growth: 15, debt_to_equity: 0.4, free_cashflow: 80000, fcf_yield: 2.5, operating_margins: 42, ideal_range: '400-450', price_6m_return: 25, debt_to_ebitda: 0.3, ev_to_ebitda: 25, ebitda: 110000, history: [], score: 95, reasons: ['AI leadership'], rsi: 72 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', current_price: 175.00, change: -0.80, changePercent: -0.45, volume: '18M', market_cap: '2.1T', pe_ratio: 24.0, sector: 'Technology', recommendation: 'BUY', institutionalHolding: '55%', industry: 'Internet', forward_pe: 20, peg_ratio: 1.5, price_to_book: 6, roce: 25, eps_growth: 12, debt_to_equity: 0.1, free_cashflow: 60000, fcf_yield: 3.0, operating_margins: 28, ideal_range: '160-190', price_6m_return: 18, debt_to_ebitda: 0.2, ev_to_ebitda: 18, ebitda: 90000, history: [], score: 82, reasons: ['Ad revenue'], rsi: 55 },
    { symbol: 'AMZN', name: 'Amazon.com', current_price: 180.00, change: 2.50, changePercent: 1.40, volume: '30M', market_cap: '1.8T', pe_ratio: 40.0, sector: 'Consumer', recommendation: 'BUY', institutionalHolding: '50%', industry: 'E-commerce', forward_pe: 35, peg_ratio: 2.0, price_to_book: 8, roce: 20, eps_growth: 20, debt_to_equity: 0.6, free_cashflow: 40000, fcf_yield: 2.2, operating_margins: 10, ideal_range: '170-190', price_6m_return: 15, debt_to_ebitda: 1.5, ev_to_ebitda: 25, ebitda: 60000, history: [], score: 80, reasons: ['Cloud growth'], rsi: 62 },
    { symbol: 'NVDA', name: 'NVIDIA Corp', current_price: 950.00, change: 25.00, changePercent: 2.70, volume: '40M', market_cap: '2.3T', pe_ratio: 75.0, sector: 'Technology', recommendation: 'STRONG BUY', institutionalHolding: '65%', industry: 'Semiconductors', forward_pe: 40, peg_ratio: 1.0, price_to_book: 40, roce: 60, eps_growth: 50, debt_to_equity: 0.2, free_cashflow: 30000, fcf_yield: 1.5, operating_margins: 55, ideal_range: '900-1000', price_6m_return: 80, debt_to_ebitda: 0.1, ev_to_ebitda: 45, ebitda: 50000, history: [], score: 98, reasons: ['AI chips'], rsi: 85 },
    { symbol: 'TSLA', name: 'Tesla Inc.', current_price: 175.00, change: -3.50, changePercent: -1.96, volume: '80M', market_cap: '550B', pe_ratio: 45.0, sector: 'Auto', recommendation: 'HOLD', institutionalHolding: '40%', industry: 'Auto Manufacturers', forward_pe: 50, peg_ratio: 3.5, price_to_book: 10, roce: 15, eps_growth: 5, debt_to_equity: 0.1, free_cashflow: 5000, fcf_yield: 1.0, operating_margins: 15, ideal_range: '160-200', price_6m_return: -25, debt_to_ebitda: 0.5, ev_to_ebitda: 35, ebitda: 10000, history: [], score: 60, reasons: ['Competition'], rsi: 38 },
    { symbol: 'META', name: 'Meta Platforms', current_price: 480.00, change: 8.00, changePercent: 1.69, volume: '15M', market_cap: '1.2T', pe_ratio: 25.0, sector: 'Technology', recommendation: 'BUY', institutionalHolding: '52%', industry: 'Internet', forward_pe: 22, peg_ratio: 1.2, price_to_book: 7, roce: 30, eps_growth: 25, debt_to_equity: 0.1, free_cashflow: 40000, fcf_yield: 3.5, operating_margins: 35, ideal_range: '450-500', price_6m_return: 40, debt_to_ebitda: 0.2, ev_to_ebitda: 18, ebitda: 55000, history: [], score: 90, reasons: ['Efficiency'], rsi: 68 },
];

const MOCK_NEWS: NewsItem[] = [
    { title: "Fed Signals Potential Rate Cuts Later This Year", link: "#", source: "Bloomberg", published: new Date().toISOString(), summary: "Federal Reserve officials have indicated that inflation data is moving in the right direction, opening the door for potential rate cuts.", category: "Economy", image: "https://images.unsplash.com/photo-1526304640152-d4619684e484?auto=format&fit=crop&q=80&w=600" },
    { title: "Tech Stocks Rally on AI Optimism", link: "#", source: "Reuters", published: new Date().toISOString(), summary: "Major technology stocks surged today as investors continue to bet on the transformative potential of artificial intelligence.", category: "Technology", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600" },
];

export const MarketDataService = {
    async fetchCryptoData(): Promise<CryptoData[]> {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h');
            if (!response.ok) throw new Error('Failed to fetch crypto data');
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
                price_change_percentage_24h: coin.price_change_percentage_24h,
                market_cap_change_24h: coin.market_cap_change_24h,
                market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
                circulating_supply: coin.circulating_supply,
                ath: coin.ath,
                ath_change_percentage: coin.ath_change_percentage,
                ath_date: coin.ath_date,
                atl: coin.atl,
                atl_change_percentage: coin.atl_change_percentage,
                atl_date: coin.atl_date,
                last_updated: coin.last_updated,
                recommendation: coin.price_change_percentage_24h > 5 ? 'STRONG BUY' : coin.price_change_percentage_24h > 0 ? 'BUY' : coin.price_change_percentage_24h > -5 ? 'HOLD' : 'SELL',
                rsi: 50 + (coin.price_change_percentage_24h * 2),
                macd_vs_200ema: coin.price_change_24h > 0 ? 'Bullish' : 'Bearish'
            }));
        } catch (error) {
            console.warn('Crypto fetch failed, using fallback', error);
            // Fallback if API limit reached
            return [
                { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 65000, price_change_24h: 1200, price_change_percentage_24h: 1.8, market_cap: 1200000000000, market_cap_rank: 1, total_volume: 35000000000, high_24h: 66000, low_24h: 64000, market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 19000000, ath: 73000, ath_change_percentage: -10, ath_date: '', atl: 0, atl_change_percentage: 0, atl_date: '', last_updated: new Date().toISOString(), recommendation: 'BUY', rsi: 62, macd_vs_200ema: 'Bullish' },
                { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 3500, price_change_24h: -50, price_change_percentage_24h: -1.4, market_cap: 400000000000, market_cap_rank: 2, total_volume: 15000000000, high_24h: 3600, low_24h: 3400, market_cap_change_24h: 0, market_cap_change_percentage_24h: 0, circulating_supply: 120000000, ath: 4800, ath_change_percentage: -25, ath_date: '', atl: 0, atl_change_percentage: 0, atl_date: '', last_updated: new Date().toISOString(), recommendation: 'HOLD', rsi: 48, macd_vs_200ema: 'Bearish' },
            ];
        }
    },

    async fetchStockData(market: 'india' | 'us'): Promise<StockData[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const stocks = market === 'india' ? SIMULATED_STOCKS : SIMULATED_US_STOCKS;

        // Return stocks with slightly randomized prices to simulate live market
        return stocks.map(stock => {
            const newPrice = randomChange(stock.current_price, 0.005); // 0.5% volatility
            const priceDiff = newPrice - stock.current_price;
            return {
                ...stock,
                current_price: parseFloat(newPrice.toFixed(2)),
                change: parseFloat((stock.change + priceDiff).toFixed(2)),
                changePercent: parseFloat(((stock.change + priceDiff) / stock.current_price * 100).toFixed(2))
            };
        });
    },

    async fetchNews(): Promise<NewsItem[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_NEWS;
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
