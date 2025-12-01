/**
 * Institutional-Grade Metrics Calculator
 * Calculates comprehensive financial metrics and scores
 */

export interface StockMetrics {
  roce: number;
  eps_growth: number;
  fcf_yield: number;
  ev_ebitda_vs_sector: number;
  six_month_return: number;
  debt_to_ebitda: number;
  earnings_quality: 'High' | 'Medium' | 'Low';
  esg_score: number;
  composite_score: number;
  recommendation: string;
}

export interface CryptoMetrics {
  rsi_14: number;
  adx_14: number;
  cmf_20: number;
  distance_200ema: number;
  macd_slope: number;
  squeeze: boolean;
  composite_score: number;
  recommendation: string;
  score_breakdown: string;
}

/**
 * Calculate color for a metric based on value and thresholds
 */
export function getMetricColor(
  value: number,
  type: 'roce' | 'eps' | 'fcf' | 'debt' | 'return' | 'esg' | 'score'
): 'success' | 'warning' | 'error' {
  switch (type) {
    case 'roce':
      if (value >= 20) return 'success';
      if (value >= 12) return 'warning';
      return 'error';
    
    case 'eps':
      if (value >= 15) return 'success';
      if (value >= 8) return 'warning';
      return 'error';
    
    case 'fcf':
      if (value >= 4) return 'success';
      if (value >= 2) return 'warning';
      return 'error';
    
    case 'debt':
      if (value <= 2) return 'success';
      if (value <= 4) return 'warning';
      return 'error';
    
    case 'return':
      if (value >= 10) return 'success';
      if (value >= 0) return 'warning';
      return 'error';
    
    case 'esg':
      if (value >= 85) return 'success';
      if (value >= 70) return 'warning';
      return 'error';
    
    case 'score':
      if (value >= 75) return 'success';
      if (value >= 50) return 'warning';
      return 'error';
    
    default:
      return 'warning';
  }
}

/**
 * Calculate recommendation based on composite score
 */
export function getRecommendation(score: number): string {
  if (score >= 80) return 'Strong Buy';
  if (score >= 65) return 'Buy';
  if (score >= 45) return 'Hold';
  if (score >= 30) return 'Reduce';
  return 'Avoid';
}

/**
 * Calculate composite score from multiple metrics
 */
export function calculateCompositeScore(data: any): number {
  let score = 50; // Base score

  // ROCE contribution (0-15 points)
  const roce = data.roce || 0;
  if (roce >= 25) score += 15;
  else if (roce >= 20) score += 12;
  else if (roce >= 15) score += 8;
  else if (roce >= 10) score += 4;
  else if (roce < 5) score -= 5;

  // EPS Growth contribution (0-15 points)
  const eps = data.eps_growth || 0;
  if (eps >= 20) score += 15;
  else if (eps >= 15) score += 12;
  else if (eps >= 10) score += 8;
  else if (eps >= 5) score += 4;
  else if (eps < 0) score -= 5;

  // FCF Yield contribution (0-10 points)
  const fcf = data.fcf_yield || 0;
  if (fcf >= 5) score += 10;
  else if (fcf >= 3) score += 6;
  else if (fcf >= 1) score += 3;

  // Debt contribution (0-10 points)
  const debt = data.debt_to_ebitda || data.debt_to_equity || 0;
  if (debt <= 1) score += 10;
  else if (debt <= 2) score += 6;
  else if (debt <= 3) score += 3;
  else if (debt > 5) score -= 5;

  // 6M Return contribution (0-10 points)
  const return6m = data.price_6m_return || data.changePercent || 0;
  if (return6m >= 15) score += 10;
  else if (return6m >= 10) score += 7;
  else if (return6m >= 5) score += 4;
  else if (return6m < -10) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate crypto institutional score
 */
export function calculateCryptoScore(crypto: any): number {
  let score = 50;

  // RSI component (-15 to +15)
  const rsi = crypto.rsi || 50;
  if (rsi >= 30 && rsi <= 45) score += 15; // Oversold but not extreme
  else if (rsi >= 45 && rsi <= 55) score += 10; // Neutral
  else if (rsi >= 55 && rsi <= 70) score += 5; // Slightly overbought
  else if (rsi > 80 || rsi < 20) score -= 10; // Extreme zones

  // ADX component (0 to +15)
  const adx = crypto.adx || 25;
  if (adx >= 50) score += 15; // Strong trend
  else if (adx >= 35) score += 10;
  else if (adx >= 25) score += 5;

  // 200 EMA distance (-10 to +10)
  const dist200 = crypto.distance_from_200_ema || 0;
  if (dist200 > 10) score += 10; // Well above
  else if (dist200 > 0) score += 5;
  else if (dist200 < -15) score -= 10; // Far below

  // CMF component (-10 to +10)
  const cmf = crypto.cmf || 0;
  if (cmf > 0.15) score += 10; // Strong buying
  else if (cmf > 0.05) score += 5;
  else if (cmf < -0.15) score -= 10; // Strong selling

  // MACD Slope (-10 to +10)
  const macdSlope = crypto.macd_slope || 0;
  if (macdSlope > 500) score += 10;
  else if (macdSlope > 100) score += 5;
  else if (macdSlope < -500) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate crypto score breakdown
 */
export function getCryptoScoreBreakdown(crypto: any): string {
  const parts = [];
  
  const rsi = crypto.rsi || 50;
  const rsiLabel = rsi < 30 ? 'Oversold' : rsi > 70 ? 'Overbought' : 'Neutral';
  parts.push(`RSI: ${rsiLabel} (${rsi.toFixed(1)})`);

  const adx = crypto.adx || 25;
  const adxLabel = adx > 50 ? 'Strong trend' : adx > 25 ? 'Moderate trend' : 'Weak trend';
  parts.push(`ADX: ${adxLabel} (${adx.toFixed(1)})`);

  const dist = crypto.distance_from_200_ema || 0;
  parts.push(`200EMA: ${dist >= 0 ? '+' : ''}${dist.toFixed(1)}%`);

  const cmf = crypto.cmf || 0;
  const cmfLabel = cmf > 0.1 ? 'Strong buying' : cmf > 0 ? 'Buying' : cmf < -0.1 ? 'Strong selling' : 'Neutral';
  parts.push(`CMF: ${cmfLabel} (${cmf.toFixed(3)})`);

  const macd = crypto.macd_slope || 0;
  parts.push(`MACD: ${macd > 0 ? 'Bullish' : 'Bearish'} (${macd.toFixed(0)})`);

  return parts.join(' | ');
}

/**
 * Format percentage with color indicator
 */
export function formatPercentWithColor(value: number): { text: string; color: 'success' | 'warning' | 'error' } {
  const color = value > 0 ? 'success' : value < 0 ? 'error' : 'warning';
  return {
    text: `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
    color
  };
}
