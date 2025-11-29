import { Briefcase, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { usePortfolio, type Position } from '../contexts/PortfolioContext';
import type { AppData } from '../types';

interface PortfolioTabProps {
    data: AppData | null;
}

export function PortfolioTab({ data }: PortfolioTabProps) {
    const { portfolio } = usePortfolio();

    if (!data) return null;

    if (portfolio.positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-800/10 rounded-full mb-6">
                    <Briefcase size={64} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Positions Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                    Track your investments by adding positions from stock detail pages.
                </p>
            </div>
        );
    }

    const PositionCard = ({ position }: { position: Position }) => {
        const profitLoss = position.profitLoss || 0;
        const profitLossPercent = position.profitLossPercent || 0;
        const value = position.quantity * (position.currentPrice || position.buyPrice);

        return (
            <div className="card-gradient p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{position.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{position.symbol}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${position.type === 'stock'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                        {position.type.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{position.quantity}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Buy Price</p>
                        <p className="font-semibold text-gray-900 dark:text-white">${position.buyPrice.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            ${(position.currentPrice || position.buyPrice).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Value</p>
                        <p className="font-semibold text-gray-900 dark:text-white">${value.toFixed(2)}</p>
                    </div>
                </div>

                <div className={`p-3 rounded-lg ${profitLoss >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">P&L</span>
                        <div className="text-right">
                            <div className={`font-bold flex items-center gap-1 ${profitLoss >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                {profitLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                ${Math.abs(profitLoss).toFixed(2)}
                            </div>
                            <div className={`text-sm font-semibold ${profitLoss >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}>
                                {profitLoss >= 0 ? '+' : '-'}{Math.abs(profitLossPercent).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header with Summary */}
            <div className="glass rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="gradient-text text-3xl font-bold mb-4">Portfolio</h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Value</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${portfolio.totalValue.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={20} className="text-gray-600 dark:text-gray-400" />
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Total Cost</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${portfolio.totalCost.toFixed(2)}
                        </p>
                    </div>

                    <div className={`p-4 rounded-xl border ${portfolio.totalProfitLoss >= 0
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {portfolio.totalProfitLoss >= 0 ? (
                                <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                            )}
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total P&L</p>
                        </div>
                        <p className={`text-2xl font-bold ${portfolio.totalProfitLoss >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {portfolio.totalProfitLoss >= 0 ? '+' : ''}${portfolio.totalProfitLoss.toFixed(2)}
                        </p>
                        <p className={`text-sm font-semibold ${portfolio.totalProfitLoss >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            ({portfolio.totalProfitLoss >= 0 ? '+' : ''}{portfolio.totalProfitLossPercent.toFixed(2)}%)
                        </p>
                    </div>
                </div>
            </div>

            {/* Positions */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Positions ({portfolio.positions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.positions.map(position => (
                        <PositionCard key={position.id} position={position} />
                    ))}
                </div>
            </div>
        </div>
    );
}
