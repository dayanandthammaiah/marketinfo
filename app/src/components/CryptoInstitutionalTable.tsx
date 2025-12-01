import React, { useState } from 'react';
import type { CryptoData } from '../types';
import { ResponsiveTable, type Column } from './ResponsiveTable';
import {
    Activity, BarChart2,
    ChevronDown, ChevronUp
} from 'lucide-react';

interface CryptoInstitutionalTableProps {
    data: CryptoData[];
    onRowClick?: (coin: CryptoData) => void;
}

export function CryptoInstitutionalTable({ data, onRowClick }: CryptoInstitutionalTableProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getRecommendationColor = (rec: string) => {
        switch (rec?.toUpperCase()) {
            case 'STRONG BUY': return { text: 'text-success-main', badge: 'bg-success-main/10 text-success-main border-success-main/20' };
            case 'BUY': return { text: 'text-success-light', badge: 'bg-success-light/10 text-success-light border-success-light/20' };
            case 'STRONG SELL': return { text: 'text-danger-main', badge: 'bg-danger-main/10 text-danger-main border-danger-main/20' };
            case 'SELL': return { text: 'text-danger-light', badge: 'bg-danger-light/10 text-danger-light border-danger-light/20' };
            default: return { text: 'text-warning-main', badge: 'bg-warning-main/10 text-warning-main border-warning-main/20' };
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return { text: 'text-success-main', badge: 'bg-success-main/10 text-success-main border-success-main/20' };
        if (score >= 60) return { text: 'text-success-light', badge: 'bg-success-light/10 text-success-light border-success-light/20' };
        if (score <= 25) return { text: 'text-danger-main', badge: 'bg-danger-main/10 text-danger-main border-danger-main/20' };
        if (score <= 40) return { text: 'text-danger-light', badge: 'bg-danger-light/10 text-danger-light border-danger-light/20' };
        return { text: 'text-warning-main', badge: 'bg-warning-main/10 text-warning-main border-warning-main/20' };
    };

    const formatPercent = (val?: number) => {
        if (val === undefined || val === null) return '-';
        const color = val > 0 ? 'text-success-main' : val < 0 ? 'text-danger-main' : 'text-muted';
        return <span className={`font-semibold ${color}`}>{val > 0 ? '+' : ''}{val.toFixed(2)}%</span>;
    };

    // --- Technical Indicators Summary Columns ---
    const technicalColumns: Column<CryptoData>[] = [
        {
            header: 'Asset',
            accessorKey: 'name',
            mobileLabel: 'Asset',
            cell: (coin) => (
                <div className="flex items-center gap-3">
                    {coin.image && <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />}
                    <div className="flex flex-col">
                        <span className="font-bold text-main">{coin.symbol}</span>
                        <span className="text-xs text-muted">{coin.name}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Price',
            accessorKey: 'current_price',
            mobileLabel: 'Price',
            cell: (coin) => (
                <span className="font-mono font-medium text-main">
                    ${coin.current_price.toLocaleString()}
                </span>
            ),
        },
        {
            header: '1m',
            accessorKey: 'price_change_percentage_30d_in_currency',
            mobileLabel: '1m',
            cell: (coin) => formatPercent(coin.price_change_percentage_30d_in_currency),
        },
        {
            header: '3m',
            accessorKey: 'price_change_percentage_3m',
            mobileLabel: '3m',
            cell: (coin) => formatPercent(coin.price_change_percentage_3m),
        },
        {
            header: '6m',
            accessorKey: 'price_change_percentage_200d_in_currency',
            mobileLabel: '6m',
            cell: (coin) => formatPercent(coin.price_change_percentage_200d_in_currency),
        },
        {
            header: '1y',
            accessorKey: 'price_change_percentage_1y_in_currency',
            mobileLabel: '1y',
            cell: (coin) => formatPercent(coin.price_change_percentage_1y_in_currency),
        },
        {
            header: 'RSI (14)',
            accessorKey: 'rsi',
            mobileLabel: 'RSI',
            cell: (coin) => {
                const rsi = coin.rsi || 50;
                let color = 'text-warning-main';
                if (rsi > 70) color = 'text-danger-main';
                if (rsi < 30) color = 'text-success-main';
                return <span className={`font-mono font-bold ${color}`}>{rsi.toFixed(1)}</span>;
            },
        },
        {
            header: 'MACD',
            accessorKey: 'macd_vs_200ema',
            mobileLabel: 'MACD',
            cell: (coin) => {
                const signal = coin.macd_vs_200ema === 'BULLISH' ? 'Bullish' : 'Bearish';
                const color = signal === 'Bullish' ? 'text-success-main' : 'text-danger-main';
                return <span className={`font-bold ${color}`}>{signal}</span>;
            },
        },
        {
            header: 'vs 200 EMA',
            accessorKey: 'distance_from_200_ema',
            mobileLabel: '200EMA',
            cell: (coin) => {
                const dist = coin.distance_from_200_ema || 0;
                const color = dist > 0 ? 'text-success-main' : 'text-danger-main';
                return <span className={`font-mono font-bold ${color}`}>{dist > 0 ? '+' : ''}{dist.toFixed(1)}%</span>;
            },
        },
        {
            header: 'Rec.',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (coin) => {
                const colors = getRecommendationColor(coin.recommendation || 'Hold');
                return (
                    <span className={`${colors.badge} px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap`}>
                        {coin.recommendation || 'Hold'}
                    </span>
                );
            },
        },
    ];

    // --- Institutional-Grade Analysis Columns ---
    const institutionalColumns: Column<CryptoData>[] = [
        {
            header: 'Asset',
            accessorKey: 'name',
            mobileLabel: 'Asset',
            cell: (coin) => (
                <div className="flex items-center gap-3">
                    {coin.image && <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />}
                    <div className="flex flex-col">
                        <span className="font-bold text-main">{coin.symbol}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Score',
            accessorKey: 'score',
            mobileLabel: 'Score',
            cell: (coin) => {
                const score = coin.score || 50;
                const colors = getScoreColor(score);
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 bg-surface-light rounded-full h-2.5 overflow-hidden">
                            <div className={`h-full ${colors.text.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
                        </div>
                        <span className={`font-bold ${colors.text}`}>{score.toFixed(0)}</span>
                    </div>
                );
            },
        },
        {
            header: 'ADX (14)',
            accessorKey: 'adx',
            mobileLabel: 'ADX',
            cell: (coin) => {
                const adx = coin.adx || 0;
                const strength = adx > 25 ? 'Strong' : 'Weak';
                const color = adx > 25 ? 'text-success-main' : 'text-muted';
                return (
                    <div className="flex flex-col">
                        <span className={`font-bold ${color}`}>{adx.toFixed(1)}</span>
                        <span className="text-[10px] text-muted uppercase">{strength}</span>
                    </div>
                );
            },
        },
        {
            header: 'CMF (20)',
            accessorKey: 'cmf',
            mobileLabel: 'CMF',
            cell: (coin) => {
                const cmf = coin.cmf || 0;
                const color = cmf > 0 ? 'text-success-main' : 'text-danger-main';
                return <span className={`font-mono font-bold ${color}`}>{cmf > 0 ? '+' : ''}{cmf.toFixed(2)}</span>;
            },
        },
        {
            header: 'Dist 200EMA',
            accessorKey: 'distance_from_200_ema',
            mobileLabel: 'Dist',
            cell: (coin) => {
                const dist = coin.distance_from_200_ema || 0;
                const color = dist > 0 ? 'text-success-main' : 'text-danger-main';
                return <span className={`font-mono font-bold ${color}`}>{dist > 0 ? '+' : ''}{dist.toFixed(1)}%</span>;
            },
        },
        {
            header: 'MACD Slope',
            accessorKey: 'macd_slope',
            mobileLabel: 'Slope',
            cell: (coin) => {
                const slope = coin.macd_slope || 0;
                const color = slope > 0 ? 'text-success-main' : 'text-danger-main';
                return <span className={`font-mono font-bold ${color}`}>{slope > 0 ? '+' : ''}{slope.toFixed(4)}</span>;
            },
        },
        {
            header: 'Squeeze',
            accessorKey: 'squeeze',
            mobileLabel: 'Squeeze',
            cell: (coin) => {
                const squeeze = coin.squeeze || 'No squeeze';
                const active = squeeze === 'On';
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${active ? 'bg-warning-main/20 text-warning-main' : 'text-muted'}`}>
                        {squeeze}
                    </span>
                );
            },
        },
        {
            header: 'Composite Rec.',
            accessorKey: 'recommendation',
            mobileLabel: 'Rec.',
            cell: (coin) => {
                const colors = getRecommendationColor(coin.recommendation || 'Hold');
                return (
                    <div className="flex items-center gap-2">
                        <span className={`${colors.badge} px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap`}>
                            {coin.recommendation || 'Hold'}
                        </span>
                        <button
                            onClick={(e) => toggleRow(coin.id, e)}
                            className="p-1 hover:bg-surface-light rounded-full transition-colors"
                        >
                            {expandedRows[coin.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                );
            },
        },
    ];

    const renderExpandedRow = (coin: CryptoData) => {
        if (!expandedRows[coin.id]) return null;

        const rsi = coin.rsi || 50;
        const adx = coin.adx || 0;
        const cmf = coin.cmf || 0;
        const dist200 = coin.distance_from_200_ema || 0;
        const macdSlope = coin.macd_slope || 0;

        return (
            <div className="col-span-full bg-surface-light/30 p-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Momentum</h4>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">RSI (14)</span>
                            <span className={`font-mono font-bold ${rsi < 30 ? 'text-success-main' : rsi > 70 ? 'text-danger-main' : 'text-warning-main'}`}>
                                {rsi.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">MACD Slope</span>
                            <span className={`font-mono font-bold ${macdSlope > 0 ? 'text-success-main' : 'text-danger-main'}`}>
                                {macdSlope.toFixed(4)}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Trend Strength</h4>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">ADX (14)</span>
                            <span className={`font-mono font-bold ${adx > 25 ? 'text-success-main' : 'text-muted'}`}>
                                {adx.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">vs 200 EMA</span>
                            <span className={`font-mono font-bold ${dist200 > 0 ? 'text-success-main' : 'text-danger-main'}`}>
                                {dist200.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Volume & Volatility</h4>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">CMF (20)</span>
                            <span className={`font-mono font-bold ${cmf > 0.05 ? 'text-success-main' : 'text-muted'}`}>
                                {cmf.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">Squeeze</span>
                            <span className={`font-bold ${coin.squeeze === 'On' ? 'text-warning-main' : 'text-muted'}`}>
                                {coin.squeeze || 'Off'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Score Breakdown</h4>
                        <p className="text-xs text-muted leading-relaxed">
                            Score: <span className="font-bold text-main">{coin.score?.toFixed(0)}/100</span>.
                            {rsi < 30 ? ' Oversold (Bullish).' : rsi > 70 ? ' Overbought (Bearish).' : ' RSI Neutral.'}
                            {adx > 25 ? ' Strong Trend.' : ' Weak Trend.'}
                            {cmf > 0.05 ? ' High Buying Pressure.' : ''}
                            {dist200 > 0 ? ' Above 200 EMA (Bullish).' : ' Below 200 EMA (Bearish).'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Technical Indicators Summary */}
            <div className="space-y-4">
                <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Activity className="text-primary-main" size={24} />
                        <div>
                            <h3 className="m3-title-large mb-1 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                Technical Indicators Summary
                            </h3>
                            <p className="text-xs text-muted font-medium">
                                Real-time price action and key momentum indicators
                            </p>
                        </div>
                    </div>
                </div>
                <ResponsiveTable data={data} columns={technicalColumns} onRowClick={onRowClick} />
            </div>

            {/* Institutional-Grade Analysis */}
            <div className="space-y-4">
                <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-sm bg-surface/40 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <BarChart2 className="text-secondary-main" size={24} />
                        <div>
                            <h3 className="m3-title-large mb-1 bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                                Institutional-Grade Analysis
                            </h3>
                            <p className="text-xs text-muted font-medium">
                                Advanced metrics, trend strength, and composite scoring
                            </p>
                        </div>
                    </div>
                </div>
                <ResponsiveTable
                    data={data}
                    columns={institutionalColumns}
                    onRowClick={onRowClick}
                    renderExpandedRow={renderExpandedRow}
                />
            </div>
        </div>
    );
}
