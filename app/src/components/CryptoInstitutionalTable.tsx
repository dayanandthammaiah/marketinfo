import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { CryptoData } from '../types';
import { cn } from '../lib/utils';
import {
    getPriceChangeColor,
    getRecommendationColor,
    getRSIColor
} from '../utils/metricColors';
import { formatIdealRange } from '../utils/idealRanges';

interface CryptoInstitutionalTableProps {
    data: CryptoData[];
    onRowClick?: (crypto: CryptoData) => void;
}

// Helper for trend badges
function getTrendBadge(trend: string) {
    const isBullish = trend.toUpperCase().includes('BULLISH');
    return (
        <span className={cn(
            "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide",
            isBullish
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        )}>
            {trend}
        </span>
    );
}

export function CryptoInstitutionalTable({ data, onRowClick }: CryptoInstitutionalTableProps) {
    const columns: Column<CryptoData>[] = [
        {
            header: 'Asset',
            accessorKey: 'name',
            mobileLabel: 'Asset',
            cell: (crypto) => (
                <div className="flex items-center gap-2">
                    {crypto.image && (
                        <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                        />
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                            {crypto.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-mono">
                            {crypto.symbol}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Price (USD)',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            className: 'font-mono font-semibold',
            cell: (crypto) => (
                <span className="text-gray-900 dark:text-gray-100">
                    ${crypto.current_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                    })}
                </span>
            ),
        },
        {
            header: '24h Change',
            accessorKey: 'price_change_24h',
            mobileLabel: '24h',
            className: 'font-mono',
            cell: (crypto) => {
                const change = crypto.price_change_24h || 0;
                const percent = crypto.price_change_percentage_24h || 0;
                const colors = getPriceChangeColor(percent);
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`${colors.badge} px-2 py-0.5 rounded-full text-xs font-bold`}>
                            {percent > 0 ? '+' : ''}{percent.toFixed(2)}%
                        </span>
                        <span className={`text-xs ${colors.text}`}>
                            ${change > 0 ? '+' : ''}{change.toFixed(2)}
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Market Cap',
            accessorKey: 'market_cap',
            mobileLabel: 'MCap',
            className: 'font-mono',
            cell: (crypto) => {
                const mcap = crypto.market_cap || 0;
                const formatted = mcap >= 1e9
                    ? `$${(mcap / 1e9).toFixed(2)}B`
                    : mcap >= 1e6
                        ? `$${(mcap / 1e6).toFixed(2)}M`
                        : `$${mcap.toLocaleString()}`;
                return (
                    <span className="text-gray-700 dark:text-gray-300">
                        {formatted}
                    </span>
                );
            },
        },
        {
            header: 'RSI (14)',
            accessorKey: 'rsi',
            mobileLabel: 'RSI',
            cell: (crypto) => {
                const rsi = crypto.rsi || 50;
                const colors = getRSIColor(rsi);
                const idealRange = formatIdealRange('rsi', 'crypto');
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`${colors.badge} px-2 py-1 rounded-full text-xs font-bold`}>
                            {rsi.toFixed(1)}
                        </span>
                        {idealRange && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {idealRange}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Trend',
            accessorKey: 'macd_vs_200ema',
            mobileLabel: 'Trend',
            cell: (crypto) => getTrendBadge(crypto.macd_vs_200ema || 'NEUTRAL'),
        },
        {
            header: 'Recommendation',
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
        <div className="space-y-4">
            <div className="glass rounded-t-xl px-4 py-3 mb-0 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="gradient-text text-lg font-bold mb-1">
                            Crypto Market Analysis
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Real-time prices and technical indicators with color-coded signals
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Buy Signal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"></div>
                            <span className="text-gray-600 dark:text-gray-400">Neutral</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Sell Signal</span>
                        </div>
                    </div>
                </div>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />
        </div>
    );
}
