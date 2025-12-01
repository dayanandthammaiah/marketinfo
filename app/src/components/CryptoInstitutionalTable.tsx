import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { CryptoData } from '../types';
import { cn } from '../lib/utils';
import {
    getRecommendationColor,
    getRSIColor,
    getScoreColor
} from '../utils/metricColors';

interface CryptoInstitutionalTableProps {
    data: CryptoData[];
    onRowClick?: (crypto: CryptoData) => void;
}

// Helper for trend badges
function getTrendBadge(trend: string) {
    const isBullish = trend.toUpperCase().includes('BULLISH');
    return (
        <span className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm",
            isBullish
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
        )}>
            {trend}
        </span>
    );
}

// Helper to format percentage changes with colors
function getPercentageDisplay(value: number, digits: number = 2): { text: string; color: string } {
    const formatted = `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`;
    if (value > 0) return { text: formatted, color: 'text-success-main' };
    if (value < 0) return { text: formatted, color: 'text-danger-main' };
    return { text: formatted, color: 'text-muted' };
}

// Helper to get emoji indicator
function getEmojiIndicator(value: number, good: number, fair: number, type: 'positive' | 'negative' = 'positive'): string {
    if (type === 'positive') {
        if (value >= good) return '🟢';
        if (value >= fair) return '🟡';
        return '🔴';
    } else {
        if (value <= good) return '🟢';
        if (value <= fair) return '🟡';
        return '🔴';
    }
}

export function CryptoInstitutionalTable({ data, onRowClick }: CryptoInstitutionalTableProps) {
    const columns: Column<CryptoData>[] = [
        {
            header: 'Asset',
            accessorKey: 'name',
            mobileLabel: 'Asset',
            cell: (crypto) => (
                <div className="flex items-center gap-3">
                    {crypto.image && (
                        <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-9 h-9 rounded-full ring-2 ring-white/20 shadow-md"
                        />
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-main text-sm">
                            {crypto.name}
                        </span>
                        <span className="text-xs text-muted font-mono uppercase tracking-wider">
                            {crypto.symbol}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Price',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            className: 'font-mono font-semibold',
            cell: (crypto) => (
                <span className="text-main">
                    ${crypto.current_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: crypto.current_price < 1 ? 6 : 2
                    })}
                </span>
            ),
        },
        {
            header: '1m | 3m | 6m | 1y',
            accessorKey: 'price_change_24h',
            mobileLabel: 'Returns',
            cell: (crypto) => {
                const changes = [
                    crypto.price_change_percentage_24h || 0,
                    crypto.price_change_7d || 0,
                    crypto.price_change_30d || 0,
                    crypto.price_change_1y || 0
                ];
                return (
                    <div className="flex flex-col gap-0.5 font-mono text-xs">
                        {changes.map((change, idx) => {
                            const display = getPercentageDisplay(change);
                            return (
                                <span key={idx} className={display.color}>
                                    {display.text}
                                </span>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            header: 'RSI(14)',
            accessorKey: 'rsi',
            mobileLabel: 'RSI',
            cell: (crypto) => {
                const rsi = crypto.rsi || 50;
                const colors = getRSIColor(rsi);
                return (
                    <span className={`${colors.badge} px-2 py-1 rounded-full text-xs font-bold`}>
                        {rsi.toFixed(2)}
                    </span>
                );
            },
        },
        {
            header: 'MACD',
            accessorKey: 'macd_vs_200ema',
            mobileLabel: 'MACD',
            cell: (crypto) => getTrendBadge(crypto.macd_vs_200ema || 'NEUTRAL'),
        },
        {
            header: 'vs 200 EMA',
            accessorKey: 'distance_from_200_ema',
            mobileLabel: '200EMA',
            cell: (crypto) => {
                const dist = crypto.distance_from_200_ema || 0;
                const emoji = dist > 0 ? '🟢' : '🔴';
                return (
                    <span className="font-semibold text-main">
                        {emoji} {dist > 0 ? '+' : ''}{dist.toFixed(1)}%
                    </span>
                );
            },
        },
        {
            header: 'Rec.',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (crypto) => {
                const colors = getRecommendationColor(crypto.recommendation || 'HOLD');
                return (
                    <span className={`${colors.badge} px-2 py-1 rounded-lg text-xs font-bold uppercase`}>
                        {crypto.recommendation || 'HOLD'}
                    </span>
                );
            },
        },
    ];

    // Second table for institutional analysis
    const institutionalColumns: Column<CryptoData>[] = [
        {
            header: 'Asset',
            accessorKey: 'name',
            mobileLabel: 'Asset',
            cell: (crypto) => (
                <div className="flex items-center gap-2">
                    {crypto.image && (
                        <img src={crypto.image} alt={crypto.name} className="w-7 h-7 rounded-full" />
                    )}
                    <span className="font-bold text-main text-sm">{crypto.symbol}</span>
                </div>
            ),
        },
        {
            header: 'Score (0-100)',
            accessorKey: 'score',
            mobileLabel: 'Score',
            cell: (crypto) => {
                const score = crypto.score || 50;
                const colors = getScoreColor(score);
                return (
                    <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-bold`}>
                        {score}
                    </span>
                );
            },
        },
        {
            header: 'ADX(14)',
            accessorKey: 'adx',
            mobileLabel: 'ADX',
            cell: (crypto) => {
                const adx = crypto.adx || 25;
                const emoji = getEmojiIndicator(adx, 25, 20, 'positive');
                return (
                    <span className="font-semibold text-main">
                        {emoji} {adx.toFixed(2)}
                    </span>
                );
            },
        },
        {
            header: 'CMF(20)',
            accessorKey: 'cmf',
            mobileLabel: 'CMF',
            cell: (crypto) => {
                const cmf = crypto.cmf || 0;
                const emoji = cmf > 0 ? '🟢' : '🔴';
                return (
                    <span className="font-semibold text-main">
                        {emoji} {cmf.toFixed(3)}
                    </span>
                );
            },
        },
        {
            header: 'Dist 200EMA',
            accessorKey: 'distance_from_200_ema',
            mobileLabel: 'EMA',
            cell: (crypto) => {
                const dist = crypto.distance_from_200_ema || 0;
                const emoji = getEmojiIndicator(dist, 5, 0, 'positive');
                return (
                    <span className="font-semibold text-main">
                        {emoji} {dist.toFixed(2)}%
                    </span>
                );
            },
        },
        {
            header: 'MACD Slope',
            accessorKey: 'macd_slope',
            mobileLabel: 'Slope',
            cell: (crypto) => {
                const slope = crypto.macd_slope || 0;
                const emoji = slope > 0 ? '🟢' : '🔴';
                return (
                    <span className="font-semibold text-main">
                        {emoji} {slope.toFixed(2)}
                    </span>
                );
            },
        },
        {
            header: 'Squeeze',
            accessorKey: 'squeeze',
            mobileLabel: 'Squeeze',
            cell: (crypto) => {
                const squeeze = crypto.squeeze;
                return (
                    <span className="text-main font-medium">
                        {squeeze || '—'}
                    </span>
                );
            },
        },
        {
            header: 'Composite Rec.',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (crypto) => {
                const colors = getRecommendationColor(crypto.recommendation || 'HOLD');
                return (
                    <span className={`${colors.badge} px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide`}>
                        {crypto.recommendation || 'HOLD'}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            {/* Technical Indicators Summary */}
            <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="m3-title-large mb-1 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Technical Indicators Summary
                        </h3>
                        <p className="text-xs text-muted font-medium">
                            Multi-timeframe price performance and technical analysis
                        </p>
                    </div>
                </div>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />

            {/* Institutional-Grade Analysis */}
            <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md mt-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="m3-title-large mb-1 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Institutional-Grade Analysis
                        </h3>
                        <p className="text-xs text-muted font-medium">
                            Advanced momentum and trend strength indicators
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-success-main shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                            <span className="text-muted">Strong Signal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-warning-main shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                            <span className="text-muted">Neutral</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-danger-main shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                            <span className="text-muted">Weak Signal</span>
                        </div>
                    </div>
                </div>
            </div>
            <ResponsiveTable data={data} columns={institutionalColumns} onRowClick={onRowClick} />
        </div>
    );
}
