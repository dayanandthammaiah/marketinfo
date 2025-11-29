import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { CryptoData } from '../types';
import { cn } from '../lib/utils';


interface CryptoInstitutionalTableProps {
    data: CryptoData[];
    onRowClick?: (crypto: CryptoData) => void;
}

// Helper functions for color coding
function getRSIColor(rsi: number): string {
    if (rsi < 30) return 'text-green-600 dark:text-green-400 font-semibold'; // Oversold - buy signal
    if (rsi > 70) return 'text-red-600 dark:text-red-400 font-semibold'; // Overbought - sell signal
    return 'text-amber-600 dark:text-amber-400'; // Neutral
}

function getTrendColor(trend: string): string {
    if (trend.includes('BULLISH')) return 'text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs';
    return 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-xs';
}

function getRecommendationColor(rec: string): string {
    const recLower = rec.toLowerCase();
    if (recLower.includes('strong buy')) return 'text-green-700 dark:text-green-300 font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded';
    if (recLower.includes('buy')) return 'text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded';
    if (recLower.includes('hold')) return 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded';
    return 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded';
}

function getPriceChangeColor(change: number): string {
    if (change > 0) return 'text-green-600 dark:text-green-400 font-semibold';
    if (change < 0) return 'text-red-600 dark:text-red-400 font-semibold';
    return 'text-gray-600 dark:text-gray-400';
}

export function CryptoInstitutionalTable({ data, onRowClick }: CryptoInstitutionalTableProps) {
    // Consolidated columns
    const columns: Column<CryptoData>[] = [
        {
            header: 'Asset',
            accessorKey: 'name',
            mobileLabel: 'Asset',
            cell: (crypto) => (
                <div className="flex items-center gap-2">
                    {crypto.image && <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />}
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{crypto.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Price',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            className: 'font-mono',
            cell: (crypto) => <span>${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</span>,
        },
        {
            header: '24h Change',
            accessorKey: 'price_change_24h',
            mobileLabel: '24h',
            className: 'font-mono',
            cell: (crypto) => {
                const change = crypto.price_change_24h || 0;
                const percent = crypto.price_change_percentage_24h || 0;
                return (
                    <div className="flex flex-col">
                        <span className={getPriceChangeColor(change)}>{change > 0 ? '+' : ''}{change.toFixed(2)}</span>
                        <span className={cn("text-xs", getPriceChangeColor(percent))}>({percent > 0 ? '+' : ''}{percent.toFixed(2)}%)</span>
                    </div>
                );
            },
        },
        {
            header: 'RSI (14)',
            accessorKey: 'rsi',
            mobileLabel: 'RSI',
            className: 'font-mono',
            cell: (crypto) => {
                const rsi = crypto.rsi || 50;
                return <span className={getRSIColor(rsi)}>{rsi.toFixed(1)}</span>;
            },
        },
        {
            header: 'Score',
            accessorKey: 'score',
            mobileLabel: 'Score',
            className: 'font-mono font-bold',
            cell: (crypto) => {
                const score = crypto.score || 50;
                let colorClass = 'text-amber-600 dark:text-amber-400';
                if (score <= 30) colorClass = 'text-green-600 dark:text-green-400'; // Lower is better
                else if (score >= 70) colorClass = 'text-red-600 dark:text-red-400'; // Higher is worse
                return <span className={colorClass}>{score.toFixed(0)}</span>;
            },
        },
        {
            header: 'Trend',
            accessorKey: 'macd_vs_200ema',
            mobileLabel: 'Trend',
            cell: (crypto) => <span className={getTrendColor(crypto.macd_vs_200ema || 'NEUTRAL')}>{crypto.macd_vs_200ema || 'N/A'}</span>,
        },
        {
            header: 'Recommendation',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (crypto) => <span className={getRecommendationColor(crypto.recommendation || 'Hold')}>{crypto.recommendation || 'HOLD'}</span>,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-t-lg px-4 py-3 mb-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Crypto Market Analysis</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    Real-time prices and technical indicators.
                </p>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />
        </div>
    );
}
