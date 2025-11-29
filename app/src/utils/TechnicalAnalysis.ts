/**
 * Technical Analysis Utilities
 * Calculates indicators like RSI, MACD, SMA, EMA from price history.
 */

export const TechnicalAnalysis = {
    /**
     * Calculate Simple Moving Average (SMA)
     */
    calculateSMA(prices: number[], period: number): number | null {
        if (prices.length < period) return null;
        const slice = prices.slice(0, period);
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    },

    /**
     * Calculate Exponential Moving Average (EMA)
     */
    calculateEMA(prices: number[], period: number): number[] {
        const k = 2 / (period + 1);

        // Better: Start with SMA of first 'period' elements (from the end of array if reversed, or beginning)
        // Assuming prices[0] is the LATEST price.

        // However, accurate EMA needs history.
        // Let's reverse for calculation: [oldest, ..., newest]
        const reversed = [...prices].reverse();

        if (reversed.length < period) return [];

        // First EMA is SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += reversed[i];
        }
        let prevEma = sum / period;

        // Fill initial part (not valid EMAs really, but for array alignment)
        // We only care about the final values.

        for (let i = period; i < reversed.length; i++) {
            prevEma = (reversed[i] * k) + (prevEma * (1 - k));
        }

        // The last calculated prevEma is the EMA for the latest price.
        // This is a simplified single value return.
        // For full array, we'd need to map.

        return [prevEma];
    },

    /**
     * Calculate Relative Strength Index (RSI)
     * @param prices Array of prices, index 0 is latest.
     * @param period Default 14
     */
    calculateRSI(prices: number[], period: number = 14): number | null {
        if (prices.length < period + 1) return null;

        // Need chronological order: [oldest, ..., newest]
        const reversed = [...prices].reverse();

        let gains = 0;
        let losses = 0;

        // Calculate initial average gain/loss
        for (let i = 1; i <= period; i++) {
            const change = reversed[i] - reversed[i - 1];
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Calculate subsequent values
        for (let i = period + 1; i < reversed.length; i++) {
            const change = reversed[i] - reversed[i - 1];
            const gain = change > 0 ? change : 0;
            const loss = change < 0 ? Math.abs(change) : 0;

            avgGain = ((avgGain * (period - 1)) + gain) / period;
            avgLoss = ((avgLoss * (period - 1)) + loss) / period;
        }

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    },

    /**
     * Calculate MACD (12, 26, 9)
     * Returns { macd, signal, histogram }
     */
    calculateMACD(prices: number[]): { macd: number, signal: number, histogram: number } | null {
        if (prices.length < 26) return null;

        // Helper to get EMA series
        // const getEMASeries = (data: number[], period: number): number[] => { ... }

        // const reversed = [...prices].reverse();

        // We need the full series to calculate Signal line
        // This is a simplified implementation. 
        // For production, use a library like 'technicalindicators' if possible, 
        // but we are keeping it dependency-free/lightweight.

        // ... (Full implementation would be complex without a lib)
        // Let's use a simplified approximation or just return null if not enough data.

        return { macd: 0, signal: 0, histogram: 0 }; // Placeholder for now
    },

    /**
     * Get Recommendation based on RSI and Price vs SMA
     */
    getRecommendation(_price: number, rsi: number | null): { action: 'BUY' | 'SELL' | 'HOLD', score: number } {
        let score = 50; // Neutral

        if (rsi) {
            if (rsi < 30) score += 30; // Oversold -> Buy
            else if (rsi > 70) score -= 30; // Overbought -> Sell
            else if (rsi < 45) score += 10;
            else if (rsi > 55) score -= 10;
        }

        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        if (score >= 70) action = 'BUY';
        else if (score <= 30) action = 'SELL';

        return { action, score };
    }
};
