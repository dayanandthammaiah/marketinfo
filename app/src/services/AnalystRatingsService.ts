export interface NormalizedRatings {
  buy: number; // 0-100
  hold: number; // 0-100
  sell: number; // 0-100
  confidence: number; // 0-100
  source: string;
}

export class AnalystRatingsService {
  // Alpha Vantage Company Overview proxy: infers recommendation via AnalystTargetPrice & EPS? Not ideal.
  // For demo: attempt Alpha Vantage "OVERVIEW" and derive naive rating. Replace with better endpoint when available.
  static async fetchAlphaVantageRatings(symbol: string): Promise<NormalizedRatings | null> {
    const key = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;
    if (!key) return null;
    try {
      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Alpha Vantage error');
      const json = await res.json();
      if (!json || Object.keys(json).length === 0) return null;

      // Naive heuristic from fields: AnalystTargetPrice, PERatio, EPS, ProfitMargin
      const pe = Number(json.PERatio || '0');
      const profit = Number(json.ProfitMargin || '0');
      const target = Number(json.AnalystTargetPrice || '0');
      const price = Number(json['50DayMovingAverage'] || json['200DayMovingAverage'] || '0');

      let buy = 33, hold = 34, sell = 33;
      if (target && price) {
        const upside = (target - price) / price;
        if (upside > 0.15) { buy = 60; hold = 30; sell = 10; }
        else if (upside < -0.1) { buy = 10; hold = 30; sell = 60; }
      }
      if (profit > 0.15) buy += 10; else if (profit < 0) sell += 10;
      if (pe && pe < 12) buy += 5; else if (pe > 35) sell += 5;

      const total = buy + hold + sell;
      buy = Math.round((buy / total) * 100);
      hold = Math.round((hold / total) * 100);
      sell = Math.max(0, 100 - buy - hold);
      const confidence = Math.min(100, Math.round(Math.abs(buy - sell)));
      return { buy, hold, sell, confidence, source: 'Alpha Vantage (derived)' };
    } catch (e) {
      console.warn('Alpha Vantage ratings fetch failed', e);
      return null;
    }
  }
}
