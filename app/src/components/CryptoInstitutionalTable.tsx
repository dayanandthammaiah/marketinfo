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
            "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm",
            isBullish
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
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
            header: 'Price (USD)',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            className: 'font-mono font-semibold',
            cell: (crypto) => (
                <span className="text-main">
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
                const idealRange = formatIdealRange('price_change_24h', 'crypto');
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`${colors.badge} px-2 py-0.5 rounded-full text-xs font-bold w-fit`}>
                            {percent > 0 ? '+' : ''}{percent.toFixed(2)}%
                        </span>
                        <span className={`text-xs ${colors.text} font-medium`}>
                            ${change > 0 ? '+' : ''}{change.toFixed(2)}
                        </span>
                        {idealRange && (
                            <span className="text-[10px] text-muted opacity-80">
                                {idealRange}
                            </span>
                        )}
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
                    <span className="text-muted font-medium">
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
                        <span className={`${colors.badge} px-2 py-1 rounded-full text-xs font-bold w-fit`}>
                            {rsi.toFixed(1)}
                        </span>
                        {idealRange && (
                            <span className="text-[10px] text-muted opacity-80">
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
            <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="m3-title-large mb-1 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Crypto Market Analysis
                        </h3>
                        <p className="text-xs text-muted font-medium">
                            Real-time prices and technical indicators with color-coded signals
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-success-main shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                            <span className="text-muted">Buy Signal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-warning-main shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                            <span className="text-muted">Neutral</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-danger-main shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                            <span className="text-muted">Sell Signal</span>
                        </div>
                    </div>
                </div>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />
        </div>
    );
}
