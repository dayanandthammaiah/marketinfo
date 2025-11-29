/**
 * Ideal value ranges for stock and crypto metrics
 */

export const STOCK_IDEAL_RANGES = {
    pe_ratio: { min: 10, max: 25, description: 'P/E Ratio' },
    forward_pe: { min: 8, max: 20, description: 'Forward P/E' },
    peg_ratio: { min: 0.5, max: 2, description: 'PEG Ratio' },
    price_to_book: { min: 1, max: 5, description: 'P/B Ratio' },
    roce: { min: 15, target: 30, description: 'ROCE (%)' },
    eps_growth: { min: 10, target: 25, description: 'EPS Growth (%)' },
    debt_to_equity: { min: 0, max: 1, description: 'Debt/Equity' },
    fcf_yield: { min: 3, target: 8, description: 'FCF Yield (%)' },
    operating_margins: { min: 15, target: 30, description: 'Operating Margin (%)' },
    price_6m_return: { min: 5, target: 15, description: '6M Return (%)' },
    debt_to_ebitda: { min: 0, max: 3, description: 'Debt/EBITDA' },
    ev_to_ebitda: { min: 8, max: 15, description: 'EV/EBITDA' },
    score: { min: 60, target: 85, description: 'Overall Score' },
    rsi: { min: 30, max: 70, description: 'RSI' }
};

export const CRYPTO_IDEAL_RANGES = {
    rsi: { min: 30, max: 70, description: 'RSI (Oversold < 30, Overbought > 70)' },
    score: { min: 60, target: 85, description: 'Overall Score' },
    price_change_24h: { min: 0, target: 5, description: '24h Change (%)' },
    price_change_7d: { min: 0, target: 10, description: '7d Change (%)' },
    price_change_1y: { min: 0, target: 50, description: '1y Change (%)' }
};

/**
 * Get ideal range for a metric
 */
export function getIdealRange(metric: string, type: 'stock' | 'crypto' = 'stock'): {
    min?: number;
    max?: number;
    target?: number;
    description: string;
} | null {
    const ranges = type === 'stock' ? STOCK_IDEAL_RANGES : CRYPTO_IDEAL_RANGES;
    return (ranges as any)[metric] || null;
}

/**
 * Format ideal range as string
 */
export function formatIdealRange(metric: string, type: 'stock' | 'crypto' = 'stock'): string {
    const range = getIdealRange(metric, type);
    if (!range) return '';

    if (range.target !== undefined) {
        return `Target: ${range.target}`;
    } else if (range.min !== undefined && range.max !== undefined) {
        return `Ideal: ${range.min}-${range.max}`;
    } else if (range.min !== undefined) {
        return `Min: ${range.min}`;
    } else if (range.max !== undefined) {
        return `Max: ${range.max}`;
    }

    return '';
}

/**
 * Check if value is within ideal range
 */
export function isInIdealRange(value: number, metric: string, type: 'stock' | 'crypto' = 'stock'): boolean {
    const range = getIdealRange(metric, type);
    if (!range) return true; // No range defined, consider it ideal

    if (range.min !== undefined && value < range.min) return false;
    if (range.max !== undefined && value > range.max) return false;

    return true;
}
