/**
 * Technical Analysis Utilities
 * Calculates indicators like RSI, MACD, SMA, EMA from price history.
 */

export const TechnicalAnalysis = {
  // Simple Moving Average series. Returns array aligned to input with nulls for insufficient lookback
  smaSeries(prices: number[], period: number): Array<number | null> {
    const out: Array<number | null> = new Array(prices.length).fill(null);
    if (period <= 0) return out;
    // We assume prices are chronological by index (matching chart data order)
    for (let i = 0; i < prices.length; i++) {
      if (i + 1 < period) continue;
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += prices[j];
      out[i] = sum / period;
    }
    return out;
  },

  // Exponential Moving Average series (full series)
  emaSeries(prices: number[], period: number): Array<number | null> {
    const out: Array<number | null> = new Array(prices.length).fill(null);
    if (period <= 0 || prices.length === 0) return out;
    const k = 2 / (period + 1);

    // Seed with SMA of first 'period'
    if (prices.length >= period) {
      let sum = 0;
      for (let i = 0; i < period; i++) sum += prices[i];
      let emaPrev = sum / period;
      out[period - 1] = emaPrev;
      for (let i = period; i < prices.length; i++) {
        const ema = prices[i] * k + emaPrev * (1 - k);
        out[i] = ema;
        emaPrev = ema;
      }
    }
    return out;
  },

  // RSI series. Returns array with nulls for first period
  rsiSeries(prices: number[], period: number = 14): Array<number | null> {
    const out: Array<number | null> = new Array(prices.length).fill(null);
    if (prices.length < period + 1) return out;

    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change; else losses += -change;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // First RSI value at index period
    out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = Math.max(change, 0);
      const loss = Math.max(-change, 0);
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return out;
  },

  // MACD series (12,26,9). Returns aligned arrays
  macdSeries(prices: number[], fast = 12, slow = 26, signalPeriod = 9): {
    macd: Array<number | null>;
    signal: Array<number | null>;
    histogram: Array<number | null>;
  } {
    const emaFast = this.emaSeries(prices, fast);
    const emaSlow = this.emaSeries(prices, slow);
    const macd: Array<number | null> = new Array(prices.length).fill(null);
    for (let i = 0; i < prices.length; i++) {
      if (emaFast[i] == null || emaSlow[i] == null) continue;
      macd[i] = (emaFast[i]! - emaSlow[i]!);
    }
    // signal is EMA of macd values (ignoring nulls at start)
    const macdValues: number[] = [];
    const macdIndexMap: number[] = [];
    for (let i = 0; i < macd.length; i++) {
      if (macd[i] != null) { macdValues.push(macd[i]!); macdIndexMap.push(i); }
    }
    const signalSeriesRaw = this.emaSeries(macdValues, signalPeriod);
    const signal: Array<number | null> = new Array(prices.length).fill(null);
    for (let k = 0; k < signalSeriesRaw.length; k++) {
      const idx = macdIndexMap[k];
      signal[idx] = signalSeriesRaw[k];
    }
    const histogram: Array<number | null> = new Array(prices.length).fill(null);
    for (let i = 0; i < prices.length; i++) {
      if (macd[i] == null || signal[i] == null) continue;
      histogram[i] = macd[i]! - signal[i]!;
    }
    return { macd, signal, histogram };
  },

  getRecommendation(_price: number, rsi: number | null): { action: 'BUY' | 'SELL' | 'HOLD', score: number } {
    let score = 50;
    if (rsi != null) {
      if (rsi < 30) score += 30;
      else if (rsi > 70) score -= 30;
      else if (rsi < 45) score += 10;
      else if (rsi > 55) score -= 10;
    }
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (score >= 70) action = 'BUY';
    else if (score <= 30) action = 'SELL';
    return { action, score };
  }
};
