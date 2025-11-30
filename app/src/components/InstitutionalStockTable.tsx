import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { StockData } from '../types';
import {
    getPriceChangeColor,
    getRecommendationColor,
    getScoreColor,
    getMetricColor
} from '../utils/metricColors';
import { getIdealRange, formatIdealRange } from '../utils/idealRanges';

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
    const ideal = getIdealRange(metricKey, 'stock');
    const colors = getMetricColor(value, type, ideal || undefined);
    const idealRangeText = formatIdealRange(metricKey, 'stock');

    return (
        <div className="flex flex-col gap-0.5">
            <span className={`${colors.text} font-semibold font-mono`}>
                {displayValue}
            </span>
            {idealRangeText && (
                <span className="text-[10px] text-muted font-normal opacity-80">
                    {idealRangeText}
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
                    <span className="font-bold text-main">
                        {stock.name}
                    </span>
                    <span className="text-xs text-muted font-mono">
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
                        <span className="text-main">
                            {prefix}{stock.current_price.toFixed(2)}
                        </span>
                        {stock.ideal_range && (
                            <span className="text-[10px] text-muted opacity-80">
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
                        <span className="text-[10px] text-muted opacity-80">
                            {formatIdealRange('score', 'stock')}
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
        <div className="w-full space-y-4">
            <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Institutional Analysis
                        </h3>
                        <p className="text-xs text-muted font-medium">
                            AI-powered metrics with color-coded performance indicators
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-success-main shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                            <span className="text-muted">Excellent</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-warning-main shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                            <span className="text-muted">Fair</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-danger-main shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                            <span className="text-muted">Poor</span>
                        </div>
                    </div>
                </div>
            </div>
            <ResponsiveTable data={data} columns={columns} onRowClick={onRowClick} />
        </div>
    );
}
