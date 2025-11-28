export interface StockData {
  name: string;
  sector: string;
  current_price: number;
  roce: number;
  eps_growth: number;
  score: number;
  recommendation: string;
  reasons: string[];
  price_change_24h?: number; // For crypto
  history?: { time: string; value: number }[];
}

export interface AppData {
  last_updated: string;
  nifty_50: StockData[];
  us_stocks: StockData[];
  crypto: StockData[];
}
