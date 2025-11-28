export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  roce?: number;
  eps_growth?: number;
  score: number;
  recommendation: string;
  reasons: string[];

  // Price Changes (for crypto and stocks)
  price_change_24h?: number;
  price_change_1m?: number;
  price_change_3m?: number;
  price_change_6m?: number;
  price_change_1y?: number;
  price_change_5y?: number;

  // Technical Indicators
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  adx?: number;
  cmf?: number;
  distance_from_200ema?: number;
  macd_slope?: number;
  squeeze_momentum?: number;
  supertrend?: string; // "Bullish" or "Bearish"
  z_score?: number;

  // Moving Averages
  ema_50?: number;
  ema_200?: number;

  // Stock Specific
  ideal_range?: string;
  pe_ratio?: number;
  market_cap?: number;

  // Chart Data
  history?: { time: string; value: number }[];
  candlestick_data?: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  published: string;
  category: string;
  summary?: string;
  image?: string;
}

export interface AppData {
  last_updated: string;
  nifty_50: StockData[];
  us_stocks: StockData[];
  crypto: StockData[];
  news: NewsItem[];
}
