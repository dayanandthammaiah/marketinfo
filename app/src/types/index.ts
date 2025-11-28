export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  roce: number;
  eps_growth: number;
  score: number;
  recommendation: string;
  reasons: string[];
  price_change_24h?: number; // For crypto
  rsi?: number;
  history?: { time: string; value: number }[];
}

export interface AppData {
  last_updated: string;
  nifty_50: StockData[];
  us_stocks: StockData[];
  crypto: StockData[];
  news: { title: string; link: string; source: string; published: string; category: string }[];
}
