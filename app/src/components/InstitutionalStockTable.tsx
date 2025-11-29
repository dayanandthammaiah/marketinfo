import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { StockData } from '../types';


interface InstitutionalStockTableProps {
    data: StockData[];
    onRowClick?: (stock: StockData) => void;
}

// Helper function to get color class based on value and thresholds
function getColorClass(value: number, goodThreshold: number, okThreshold: number, isReversed: boolean = false): string {
    if (isReversed) {
        // For metrics where lower is better (like Debt/EBITDA)
        if (value <= goodThreshold) return 'text-green-600 dark:text-green-400 font-semibold';
        if (value <= okThreshold) return 'text-amber-600 dark:text-amber-400 font-semibold';
        return 'text-red-600 dark:text-red-400 font-semibold';
    } else {
        // For metrics where higher is better (like ROCE, EPS Growth)
        if (value >= goodThreshold) return 'text-green-600 dark:text-green-400 font-semibold';
        if (value >= okThreshold) return 'text-amber-600 dark:text-amber-400 font-semibold';
        return 'text-red-600 dark:text-red-400 font-semibold';
    }
}

// Get emoji indicator based on value
function getEmoji(value: number, goodThreshold: number, okThreshold: number, isReversed: boolean = false): string {
    if (isReversed) {
        if (value <= goodThreshold) return '🟢';
        if (value <= okThreshold) return '🟡';
        return '🔴';
    } else {
        if (value >= goodThreshold) return '🟢';
        if (value >= okThreshold) return '🟡';
        return '🔴';
    }
}

// Format recommendation with color
function getRecommendationColor(rec: string): string {
    const recLower = rec.toLowerCase();
    if (recLower.includes('strong buy')) return 'text-green-700 dark:text-green-300 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded';
    if (recLower.includes('buy')) return 'text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded';
    if (recLower.includes('hold')) return 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded';
    if (recLower.includes('wait')) return 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded';
    return 'text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded';
}

export function InstitutionalStockTable({ data, onRowClick }: InstitutionalStockTableProps) {
    const columns: Column<StockData>[] = [
        {
            header: 'Stock',
            accessorKey: 'name',
            mobileLabel: 'Stock',
            cell: (stock) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{stock.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{stock.symbol}</span>
                </div>
            ),
        },
        {
            header: 'Price',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            className: 'font-mono',
            cell: (stock) => {
                const isIndian = stock.symbol.endsWith('.NS') || !stock.symbol.includes('.'); // Default to Indian for simulated
                const prefix = isIndian ? '₹' : '$';
                return <span>{prefix}{stock.current_price.toFixed(2)}</span>;
            },
        },
        {
            header: 'Change',
            accessorKey: 'change',
            mobileLabel: 'Chg',
            className: 'font-mono',
            cell: (stock) => {
                const change = stock.change || 0;
                const colorClass = change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                return <span className={colorClass}>{change > 0 ? '+' : ''}{change.toFixed(2)}</span>;
            },
        },
        {
            header: '% Change',
            accessorKey: 'changePercent',
            mobileLabel: '%',
            className: 'font-mono',
            cell: (stock) => {
                const changePercent = stock.changePercent || 0;
                const colorClass = changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                return <span className={colorClass}>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%</span>;
            },
        },
        {
            header: 'ROCE',
            accessorKey: 'roce',
            mobileLabel: 'ROCE',
            className: 'font-mono',
            cell: (stock) => {
                const roce = stock.roce || 0; // ROCE is usually already in percentage in data
                const emoji = getEmoji(roce, 15, 10, false);
                const colorClass = getColorClass(roce, 15, 10, false);
                return <span className={colorClass}>{emoji} {roce.toFixed(1)}%</span>;
            },
        },
        {
            header: 'EPS Growth',
            accessorKey: 'eps_growth',
            mobileLabel: 'EPS Growth',
            className: 'font-mono',
            cell: (stock) => {
                const epsGrowth = stock.eps_growth || 0;
                const emoji = getEmoji(epsGrowth, 15, 10, false);
                const colorClass = getColorClass(epsGrowth, 15, 10, false);
                return <span className={colorClass}>{emoji} {epsGrowth.toFixed(1)}%</span>;
            },
        },
        {
            header: 'FCF Yield',
            accessorKey: 'fcf_yield',
            mobileLabel: 'FCF Yield',
            className: 'font-mono',
            cell: (stock) => {
                const fcfYield = stock.fcf_yield || 0;
                const emoji = getEmoji(fcfYield, 3, 1, false);
                const colorClass = getColorClass(fcfYield, 3, 1, false);
                return <span className={colorClass}>{emoji} {fcfYield.toFixed(1)}%</span>;
            },
        },
        {
            header: 'Debt/EBITDA',
            accessorKey: 'debt_to_ebitda',
            mobileLabel: 'Debt/EBITDA',
            className: 'font-mono',
            cell: (stock) => {
                const debtEbitda = stock.debt_to_ebitda || 0;
                const emoji = getEmoji(debtEbitda, 2, 4, true); // Reversed - lower is better
                const colorClass = getColorClass(debtEbitda, 2, 4, true);
                return <span className={colorClass}>{emoji} {debtEbitda.toFixed(1)}x</span>;
            },
        },
        {
            header: '6M Return',
            accessorKey: 'price_6m_return',
            mobileLabel: '6M Return',
            className: 'font-mono',
            cell: (stock) => {
                const return6m = stock.price_6m_return || 0;
                const emoji = getEmoji(return6m, 8, 0, false);
                const colorClass = getColorClass(return6m, 8, 0, false);
                return <span className={colorClass}>{emoji} {return6m > 0 ? '+' : ''}{return6m.toFixed(1)}%</span>;
            },
        },
        {
            header: 'P/E Ratio',
            accessorKey: 'pe_ratio',
            mobileLabel: 'P/E',
            className: 'font-mono',
            cell: (stock) => {
                const pe = stock.pe_ratio || 0;
                return <span>{pe > 0 ? pe.toFixed(1) : 'N/A'}</span>;
            },
        },
        {
            header: 'Score',
            accessorKey: 'score',
            mobileLabel: 'Score',
            className: 'font-mono',
            cell: (stock) => {
                const score = stock.score || 0;
                const colorClass = getColorClass(score, 70, 50, false);
                return <span className={colorClass}>{score.toFixed(0)}</span>;
            },
        },
        {
            header: 'Recommendation',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (stock) => {
                return <span className={getRecommendationColor(stock.recommendation || 'Hold')}>{stock.recommendation || 'Hold'}</span>;
            },
        },
    ];

    return (
        <div className="w-full">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-t-lg px-4 py-3 mb-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">Institutional Analysis</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    Color-coded metrics: <span className="font-semibold">🟢 Excellent</span> <span className="ml-2">🟡 Good</span> <span className="ml-2">🔴 Needs Attention</span>
                </p>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />
        </div>
    );
}
