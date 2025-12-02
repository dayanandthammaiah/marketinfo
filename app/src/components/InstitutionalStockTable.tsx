import { ResponsiveTable, type Column } from './ResponsiveTable';
import type { StockData } from '../types';
import {
    getRecommendationColor,
    getScoreColor
} from '../utils/metricColors';

interface InstitutionalStockTableProps {
    data: StockData[];
    onRowClick?: (stock: StockData) => void;
}

// Helper to get emoji based on value and thresholds
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

function getESGLabel(score: number): string {
    if (score >= 80) return 'Top';
    if (score >= 60) return 'Mid';
    return 'Low';
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
            header: 'ROCE',
            accessorKey: 'roce',
            mobileLabel: 'ROCE',
            cell: (stock) => {
                const roce = stock.roce || 0;
                const emoji = getEmojiIndicator(roce, 15, 10, 'positive');
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {roce.toFixed(0)}%
                    </span>
                );
            },
        },
        {
            header: 'EPS Growth (3Y CAGR)',
            accessorKey: 'eps_growth',
            mobileLabel: 'EPS',
            cell: (stock) => {
                const epsGrowth = stock.eps_growth || 0;
                const emoji = getEmojiIndicator(epsGrowth, 15, 10, 'positive');
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {epsGrowth.toFixed(0)}%
                    </span>
                );
            },
        },
        {
            header: 'FCF Yield',
            accessorKey: 'fcf_yield',
            mobileLabel: 'FCF',
            cell: (stock) => {
                const fcfYield = (stock.fcf_yield || 0) * 100; // Convert to percentage if decimal
                const emoji = getEmojiIndicator(fcfYield, 3, 1.5, 'positive');
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {fcfYield.toFixed(1)}%
                    </span>
                );
            },
        },
        {
            header: 'EV/EBITDA vs Sector',
            accessorKey: 'ev_vs_sector',
            mobileLabel: 'EV/Sec',
            cell: (stock) => {
                const val = stock.ev_vs_sector || 0;
                // Negative is good for valuation vs sector (undervalued)
                const emoji = getEmojiIndicator(val, -5, 0, 'negative');
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {val > 0 ? '+' : ''}{val.toFixed(0)}%
                    </span>
                );
            },
        },
        {
            header: '6M Rel. Return',
            accessorKey: 'price_6m_return',
            mobileLabel: '6M',
            cell: (stock) => {
                const return6m = stock.price_6m_return || 0;
                const emoji = getEmojiIndicator(return6m, 10, 5, 'positive');
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {return6m > 0 ? '+' : ''}{return6m.toFixed(0)}%
                    </span>
                );
            },
        },
        {
            header: 'Debt/EBITDA',
            accessorKey: 'debt_to_ebitda',
            mobileLabel: 'Debt',
            cell: (stock) => {
                const debtEbitda = stock.debt_to_ebitda || 0;
                const emoji = getEmojiIndicator(debtEbitda, 2, 3, 'negative');
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {debtEbitda.toFixed(1)}
                    </span>
                );
            },
        },
        {
            header: 'Earnings Quality',
            accessorKey: 'earnings_quality',
            mobileLabel: 'Quality',
            cell: (stock) => {
                const quality = stock.earnings_quality || 'Medium';
                const emoji = quality === 'High' ? '🟢' : quality === 'Medium' ? '🟡' : '🔴';
                const val = quality === 'High' ? '1.1' : quality === 'Medium' ? '1.0' : '0.9';
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {val}
                    </span>
                );
            },
        },
        {
            header: 'ESG Score',
            accessorKey: 'esg_score',
            mobileLabel: 'ESG',
            cell: (stock) => {
                const esgScore = stock.esg_score || 75;
                const emoji = getEmojiIndicator(esgScore, 80, 60, 'positive');
                const label = getESGLabel(esgScore);
                return (
                    <span className="font-semibold text-main whitespace-nowrap">
                        {emoji} {label}
                    </span>
                );
            },
        },
        {
            header: 'Composite',
            accessorKey: 'score',
            mobileLabel: 'Score',
            cell: (stock) => {
                const score = stock.score || 0;
                const colors = getScoreColor(score);
                return (
                    <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-bold`}>
                        {score.toFixed(0)}
                    </span>
                );
            },
        },
        {
            header: 'Rank',
            accessorKey: 'rank',
            mobileLabel: 'Rank',
            cell: (stock) => {
                const rank = stock.rank || 0;
                return (
                    <span className="font-bold text-main text-lg">
                        {rank}
                    </span>
                );
            },
        },
        {
            header: 'Recommendation',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (stock) => {
                const colors = getRecommendationColor(stock.recommendation || 'Hold');
                return (
                    <span className={`${colors.badge} px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap`}>
                        {stock.recommendation || 'Hold'}
                    </span>
                );
            },
        },
    ];

    const renderMobileCard = (stock: StockData) => {
        const recColors = getRecommendationColor(stock.recommendation || 'Hold');
        const scoreColors = getScoreColor(stock.score || 0);

        return (
            <div
                onClick={() => onRowClick?.(stock)}
                className="md3-card active:scale-[0.98] transition-all duration-300 relative overflow-hidden hover:elevation-2 cursor-pointer"
            >
                {/* Rank Badge */}
                <div className="absolute top-0 right-0 bg-[var(--surface-5)] px-3 py-1 rounded-bl-xl border-b border-l border-[var(--md-sys-color-outline-variant)]/20 shadow-sm">
                    <span className="text-xs font-bold text-[var(--md-sys-color-primary)]">
                        #{stock.rank}
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 pr-12">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${scoreColors.bg} ${scoreColors.text} elevation-1`}>
                            {stock.score?.toFixed(0)}
                        </div>
                        <div>
                            <h4 className="m3-title-medium text-[var(--text-main)]">{stock.name}</h4>
                            <span className="m3-label-small text-[var(--text-muted)] font-mono">{stock.symbol}</span>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--surface-2)]/50 rounded-xl border border-[var(--md-sys-color-outline-variant)]/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Recommendation</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md w-fit ${recColors.badge}`}>
                                {stock.recommendation || 'HOLD'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">ROCE</span>
                            <span className="text-sm font-semibold text-[var(--text-main)]">
                                {getEmojiIndicator(stock.roce || 0, 15, 10)} {(stock.roce || 0).toFixed(0)}%
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">EPS Growth</span>
                            <span className="text-sm font-semibold text-[var(--text-main)]">
                                {getEmojiIndicator(stock.eps_growth || 0, 15, 10)} {(stock.eps_growth || 0).toFixed(0)}%
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Quality</span>
                            <span className="text-sm font-semibold text-[var(--text-main)]">
                                {stock.earnings_quality === 'High' ? '🟢 High' : stock.earnings_quality === 'Medium' ? '🟡 Med' : '🔴 Low'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--md-sys-color-primary)]/0 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
        );
    };

    return (
        <div className="w-full space-y-4">
            <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="m3-title-large mb-1 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
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
            <ResponsiveTable
                data={data}
                columns={columns}
                onRowClick={onRowClick}
                renderMobileCard={renderMobileCard}
            />
        </div>
    );
}
