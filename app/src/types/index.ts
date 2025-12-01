export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  current_price: number;
  change: number;
  changePercent: number;
  volume: string;
  market_cap: string;
  pe_ratio: number;
  forward_pe: number;
  peg_ratio: number;
  price_to_book: number;
  roce: number;
  eps_growth: number;
  debt_to_equity: number;
  free_cashflow: number;
  fcf_yield: number;
  operating_margins: number;
  ideal_range: string;
  price_6m_return: number;
  debt_to_ebitda: number;
  ev_to_ebitda: number;
  ev_vs_sector?: number;
  ebitda: number;
  history: { time: string; value: number }[];
  score: number;
  recommendation: string;
  reasons: string[];
  rank?: number;
  institutionalHolding?: string;
  rsi?: number;
  esg_score?: number;
  earnings_quality?: string;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  price_change_percentage_3m?: number;
  price_change_percentage_200d_in_currency?: number;
  price_change_percentage_1y_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;

  // Technical Indicators
  rsi?: number;
  macd_vs_200ema?: string;
  adx?: number;
  cmf?: number;
  distance_from_200_ema?: number;
  macd_slope?: number;
  squeeze?: string;

  // Scoring
  score?: number;
  score_breakdown?: string;
  recommendation?: string;

  last_updated: string;
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  published: string;
  summary?: string;
  category?: string;
  image?: string;
}

export interface AppData {
  last_updated: string;
  nifty_50: StockData[];
  us_stocks: StockData[];
  crypto: CryptoData[];
  news: NewsItem[];
}
