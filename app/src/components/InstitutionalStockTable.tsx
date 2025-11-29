import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { StockData } from '../types';
import {
    getPriceChangeColor,
    getRecommendationColor,
    getScoreColor,
    getMetricColor
} from '../utils/metricColors';
import { formatIdealRange } from '../utils/idealRanges';

interface InstitutionalStockTableProps {
    data: StockData[];
    onRowClick?: (stock: StockData) => void;
}

// Helper component for metric with ideal value
function MetricWithIdeal({ value, displayValue, metricKey, type = 'positive' }: {
    value: number;
    displayValue: string;
    metricKey: string;
    type?: 'positive' | 'negative';
}) {
    const colors = getMetricColor(value, type);
    const idealRange = formatIdealRange(metricKey, 'stock');

    return (
        <div className="flex flex-col gap-0.5">
            <span className={`${colors.text} font-semibold font-mono`}>
                {displayValue}
            </span>
            {idealRange && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                    {idealRange}
                </span>
            )}
        </div>
    );
}

export function InstitutionalStockTable({ data, onRowClick }: InstitutionalStockTableProps) {
    const columns: Column<StockData>[] = [
        {
            header: 'Stock',
            accessorKey: 'name',
            mobileLabel: 'Stock',
            cell: (stock) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                        {stock.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {stock.symbol}
                    </span>
                </div>
            ),
        },
        {
            header: 'Price',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            className: 'font-mono font-semibold',
            cell: (stock) => {
                const isIndian = stock.symbol.endsWith('.NS') || !stock.symbol.includes('.');
                const prefix = isIndian ? '₹' : '$';
                return (
                    <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-gray-100">
                            {prefix}{stock.current_price.toFixed(2)}
                        </span>
                        {stock.ideal_range && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                Range: {stock.ideal_range}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Change',
            accessorKey: 'change',
            mobileLabel: 'Chg',
            className: 'font-mono',
            cell: (stock) => {
                const change = stock.change || 0;
                const colors = getPriceChangeColor(change);
                return (
                    <span className={`${colors.text} font-semibold`}>
                        {change > 0 ? '+' : ''}{change.toFixed(2)}
                    </span>
                );
            },
        },
        {
            header: '% Change',
            accessorKey: 'changePercent',
            mobileLabel: '%',
            className: 'font-mono',
            cell: (stock) => {
                const changePercent = stock.changePercent || 0;
                const colors = getPriceChangeColor(changePercent);
                return (
                    <div className="flex items-center gap-1">
                        <span className={`${colors.badge} px-2 py-0.5 rounded-full text-xs font-bold`}>
                            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'ROCE',
            accessorKey: 'roce',
            mobileLabel: 'ROCE',
            cell: (stock) => {
                const roce = stock.roce || 0;
                return (
                    <MetricWithIdeal
                        value={roce}
                        displayValue={`${roce.toFixed(1)}%`}
                        metricKey="roce"
                        type="positive"
                    />
                );
            },
        },
        {
            header: 'EPS Growth',
            accessorKey: 'eps_growth',
            mobileLabel: 'EPS',
            cell: (stock) => {
                const epsGrowth = stock.eps_growth || 0;
                return (
                    <MetricWithIdeal
                        value={epsGrowth}
                        displayValue={`${epsGrowth.toFixed(1)}%`}
                        metricKey="eps_growth"
                        type="positive"
                    />
                );
            },
        },
        {
            header: 'FCF Yield',
            accessorKey: 'fcf_yield',
            mobileLabel: 'FCF',
            cell: (stock) => {
                const fcfYield = stock.fcf_yield || 0;
                return (
                    <MetricWithIdeal
                        value={fcfYield}
                        displayValue={`${fcfYield.toFixed(1)}%`}
                        metricKey="fcf_yield"
                        type="positive"
                    />
                );
            },
        },
        {
            header: 'Debt/EBITDA',
            accessorKey: 'debt_to_ebitda',
            mobileLabel: 'Debt',
            cell: (stock) => {
                const debtEbitda = stock.debt_to_ebitda || 0;
                return (
                    <MetricWithIdeal
                        value={debtEbitda}
                        displayValue={`${debtEbitda.toFixed(1)}x`}
                        metricKey="debt_to_ebitda"
                        type="negative"
                    />
                );
            },
        },
        {
            header: '6M Return',
            accessorKey: 'price_6m_return',
            mobileLabel: '6M',
            cell: (stock) => {
                const return6m = stock.price_6m_return || 0;
                return (
                    <MetricWithIdeal
                        value={return6m}
                        displayValue={`${return6m > 0 ? '+' : ''}${return6m.toFixed(1)}%`}
                        metricKey="price_6m_return"
                        type="positive"
                    />
                );
            },
        },
        {
            header: 'P/E Ratio',
            accessorKey: 'pe_ratio',
            mobileLabel: 'P/E',
            cell: (stock) => {
                const pe = stock.pe_ratio || 0;
                return (
                    <MetricWithIdeal
                        value={pe}
                        displayValue={pe > 0 ? pe.toFixed(1) : 'N/A'}
                        metricKey="pe_ratio"
                        type="negative"
                    />
                );
            },
        },
        {
            header: 'Score',
            accessorKey: 'score',
            mobileLabel: 'Score',
            cell: (stock) => {
                const score = stock.score || 0;
                const colors = getScoreColor(score);
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-bold inline-block`}>
                            {score.toFixed(0)}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            Target: 85
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Recommendation',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (stock) => {
                const colors = getRecommendationColor(stock.recommendation || 'HOLD');
                return (
                    <span className={`${colors.badge} px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide`}>
                        {stock.recommendation || 'HOLD'}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <div className="glass rounded-t-xl px-4 py-3 mb-0 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="gradient-text text-lg font-bold mb-1">
                            Institutional Analysis
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            All metrics color-coded with ideal target values displayed
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Excellent</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"></div>
                            <span className="text-gray-600 dark:text-gray-400">Fair</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Poor</span>
                        </div>
                    </div>
                </div>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />
        </div>
    );
}
