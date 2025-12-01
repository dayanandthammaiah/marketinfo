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

  // Bollinger Bands
  bollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { upper: number[]; lower: number[]; middle: number[] } {
    const sma = this.smaSeries(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    const middle: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      if (sma[i] === null) {
        upper.push(0);
        lower.push(0);
        middle.push(0);
        continue;
      }

      // Calculate standard deviation
      let sumSqDiff = 0;
      let count = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSqDiff += Math.pow(prices[j] - sma[i]!, 2);
        count++;
      }
      const stdDev = Math.sqrt(sumSqDiff / count);

      upper.push(sma[i]! + stdDev * multiplier);
      lower.push(sma[i]! - stdDev * multiplier);
      middle.push(sma[i]!);
    }
    return { upper, lower, middle };
  },

  // Average Directional Index (ADX)
  adxSeries(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
    if (highs.length < period * 2) return new Array(highs.length).fill(0);

    const tr: number[] = [];
    const dmPlus: number[] = [];
    const dmMinus: number[] = [];

    // 1. Calculate TR, +DM, -DM
    for (let i = 1; i < highs.length; i++) {
      const currentHigh = highs[i];
      const currentLow = lows[i];
      const prevClose = closes[i - 1];

      tr.push(Math.max(
        currentHigh - currentLow,
        Math.abs(currentHigh - prevClose),
        Math.abs(currentLow - prevClose)
      ));

      const upMove = currentHigh - highs[i - 1];
      const downMove = lows[i - 1] - currentLow;

      if (upMove > downMove && upMove > 0) dmPlus.push(upMove);
      else dmPlus.push(0);

      if (downMove > upMove && downMove > 0) dmMinus.push(downMove);
      else dmMinus.push(0);
    }

    // Helper for smoothed averages (Wilder's Smoothing)
    const smooth = (data: number[], period: number) => {
      const result: number[] = [];
      let sum = 0;
      // First value is simple sum
      for (let i = 0; i < period; i++) sum += data[i];
      result.push(sum);

      for (let i = period; i < data.length; i++) {
        const prev = result[result.length - 1];
        result.push(prev - (prev / period) + data[i]);
      }
      return result;
    };

    const trSmooth = smooth(tr, period);
    const dmPlusSmooth = smooth(dmPlus, period);
    const dmMinusSmooth = smooth(dmMinus, period);

    // Calculate DX and ADX
    const adx: number[] = new Array(highs.length).fill(0);
    const dxValues: number[] = [];

    // Align indices
    const offset = period;

    for (let i = 0; i < trSmooth.length; i++) {
      const diPlus = (dmPlusSmooth[i] / trSmooth[i]) * 100;
      const diMinus = (dmMinusSmooth[i] / trSmooth[i]) * 100;
      const dx = (Math.abs(diPlus - diMinus) / (diPlus + diMinus)) * 100;
      dxValues.push(dx);
    }

    // ADX is smoothed DX
    const adxSmooth = smooth(dxValues, period);

    // Fill the end of the array
    for (let i = 0; i < adxSmooth.length; i++) {
      // approximate index mapping
      const realIndex = i + (period * 2);
      if (realIndex < adx.length) {
        adx[realIndex] = adxSmooth[i];
      }
    }

    return adx;
  },

  // Chaikin Money Flow (CMF)
  cmfSeries(highs: number[], lows: number[], closes: number[], volumes: number[], period: number = 20): number[] {
    const mfv: number[] = [];
    for (let i = 0; i < highs.length; i++) {
      const range = highs[i] - lows[i];
      if (range === 0) {
        mfv.push(0);
      } else {
        const val = ((closes[i] - lows[i]) - (highs[i] - closes[i])) / range;
        mfv.push(val * volumes[i]);
      }
    }

    const cmf: number[] = new Array(highs.length).fill(0);
    for (let i = period - 1; i < highs.length; i++) {
      let sumMfv = 0;
      let sumVol = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumMfv += mfv[j];
        sumVol += volumes[j];
      }
      cmf[i] = sumVol === 0 ? 0 : sumMfv / sumVol;
    }
    return cmf;
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
