/**
 * Metric Color Coding Utilities
 * Provides consistent color coding for financial metrics
 */

export type MetricType = 'positive' | 'negative' | 'neutral';
export type MetricValue = number | string;

interface ColorClasses {
    bg: string;
    text: string;
    badge: string;
}

/**
 * Get color classes based on metric value and type
 */
export function getMetricColor(
    value: number,
    type: MetricType,
    ideal?: { min?: number; max?: number; target?: number }
): ColorClasses {
    let percentile = 50; // Default neutral

    if (ideal) {
        if (ideal.target) {
            // Distance from target
            percentile = 100 - Math.abs(value - ideal.target) / ideal.target * 100;
        } else if (ideal.min !== undefined && ideal.max !== undefined) {
            // Within range
            if (value < ideal.min) {
                percentile = (value / ideal.min) * 40;
            } else if (value > ideal.max) {
                percentile = 100 - ((value - ideal.max) / ideal.max) * 40;
            } else {
                percentile = 80; // Within ideal range
            }
        }
    }

    // Invert for negative metrics (lower is better)
    if (type === 'negative') {
        percentile = 100 - percentile;
    }

    // Determine color based on percentile
    if (percentile >= 80) {
        return {
            bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
            text: 'text-white',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
    } else if (percentile >= 60) {
        return {
            bg: 'bg-gradient-to-r from-green-400 to-emerald-400',
            text: 'text-white',
            badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        };
    } else if (percentile >= 40) {
        return {
            bg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
            text: 'text-gray-900',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        };
    } else if (percentile >= 20) {
        return {
            bg: 'bg-gradient-to-r from-orange-500 to-amber-500',
            text: 'text-white',
            badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
        };
    } else {
        return {
            bg: 'bg-gradient-to-r from-red-500 to-rose-500',
            text: 'text-white',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        };
    }
}

/**
 * Get color for price changes (simple green/red)
 */
export function getPriceChangeColor(change: number): ColorClasses {
    if (change > 0) {
        return {
            bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
    } else if (change < 0) {
        return {
            bg: 'bg-gradient-to-r from-red-500 to-rose-500',
            text: 'text-red-600 dark:text-red-400',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        };
    } else {
        return {
            bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
            text: 'text-gray-600 dark:text-gray-400',
            badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        };
    }
}

/**
 * Get color for recommendation
 */
export function getRecommendationColor(recommendation: string): ColorClasses {
    const rec = recommendation.toUpperCase();

    if (rec.includes('STRONG BUY')) {
        return {
            bg: 'bg-gradient-to-r from-emerald-600 to-green-600',
            text: 'text-white',
            badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
        };
    } else if (rec.includes('BUY')) {
        return {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
            text: 'text-white',
            badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
        };
    } else if (rec.includes('HOLD')) {
        return {
            bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
            text: 'text-gray-900',
            badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
        };
    } else if (rec.includes('SELL')) {
        return {
            bg: 'bg-gradient-to-r from-orange-500 to-red-500',
            text: 'text-white',
            badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
        };
    } else {
        return {
            bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
            text: 'text-white',
            badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200'
        };
    }
}

/**
 * Get color for RSI (Crypto)
 */
export function getRSIColor(rsi: number): ColorClasses {
    if (rsi < 30) {
        return {
            bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
    } else if (rsi > 70) {
        return {
            bg: 'bg-gradient-to-r from-red-500 to-rose-500',
            text: 'text-red-600 dark:text-red-400',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        };
    } else {
        return {
            bg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
            text: 'text-amber-600 dark:text-amber-400',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        };
    }
}

/**
 * Get color for score (0-100)
 */
export function getScoreColor(score: number): ColorClasses {
    if (score >= 80) {
        return {
            bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
            text: 'text-white',
            badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
    } else if (score >= 60) {
        return {
            bg: 'bg-gradient-to-r from-green-400 to-emerald-400',
            text: 'text-white',
            badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        };
    } else if (score >= 40) {
        return {
            bg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
            text: 'text-gray-900',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        };
    } else {
        return {
            bg: 'bg-gradient-to-r from-red-500 to-rose-500',
            text: 'text-white',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        };
    }
}
