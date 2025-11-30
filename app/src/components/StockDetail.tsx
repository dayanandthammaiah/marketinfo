import { useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import type { StockData } from '../types/index';
import { cn } from '../lib/utils';
import { lazy, Suspense } from 'react';
const TradingViewWidget = lazy(() => import('./TradingViewWidget').then(m => ({ default: m.TradingViewWidget })));
import { AddAlertDialog } from './AddAlertDialog';
import { FavoriteButton } from './FavoriteButton';
import { CandlestickChart } from './CandlestickChart';
import { IndicatorPanel } from './IndicatorPanel';
import { PeersCard } from './PeersCard';
import { AnalystRatingsCard } from './AnalystRatingsCard';
import { useData } from '../hooks/useData';

interface StockDetailProps {
    stock: StockData;
    onClose: () => void;
}

export function StockDetail({ stock, onClose }: StockDetailProps) {
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [showSMA, setShowSMA] = useState(true);
    const [showEMA, setShowEMA] = useState(true);
    const { data: appData } = useData();

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-900 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{stock.name}</h2>
                        <p className="text-sm text-gray-500">{stock.sector}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <FavoriteButton id={stock.symbol} type="stock" />
                    <button
                        onClick={() => setShowAlertDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <Bell size={18} />
                        <span className="hidden sm:inline">Set Alert</span>
                    </button>
                </div>
            </div>

            {showAlertDialog && (
                <AddAlertDialog
                    symbol={stock.symbol}
                    name={stock.name}
                    type="stock"
                    currentPrice={stock.current_price}
                    onClose={() => setShowAlertDialog(false)}
                />
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Current Price</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stock.symbol?.includes('USDT') || stock.symbol?.includes('USD') ? '$' : '₹'}
                                {stock.current_price?.toLocaleString()}
                            </p>
                            {stock.change !== undefined && (
                                <span className={cn(
                                    "text-sm font-semibold",
                                    stock.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                )}>
                                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Score</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stock.score}/100</p>
                    </div>

                    {stock.roce !== undefined && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">ROCE</p>
                            <p className={cn("text-xl font-bold", stock.roce > 0.15 ? "text-green-500" : "text-gray-900 dark:text-gray-100")}>
                                {(stock.roce * 100).toFixed(1)}%
                            </p>
                        </div>
                    )}

                    {stock.rsi !== undefined && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">RSI (14)</p>
                            <p className={cn("text-xl font-bold", stock.rsi < 30 ? "text-green-500" : stock.rsi > 70 ? "text-red-500" : "text-yellow-500")}>
                                {stock.rsi.toFixed(1)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">Price History (90 Days)</h3>
                        <div className="flex items-center gap-2 text-sm">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={showSMA} onChange={() => setShowSMA(v => !v)} />
                                <span>SMA</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" checked={showEMA} onChange={() => setShowEMA(v => !v)} />
                                <span>EMA</span>
                            </label>
                        </div>
                    </div>
                    <CandlestickChart history={stock.history} showSMA={showSMA} showEMA={showEMA} height={300} />
                </div>

                {/* Indicators */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Indicators</h3>
                    <IndicatorPanel prices={stock.history} />
                </div>

                {/* Peers and Analyst Ratings */}
                <PeersCard current={stock} appData={appData} />
                <AnalystRatingsCard stock={stock} />

                {/* TradingView Advanced Chart */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                    <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
                        Advanced Technical Analysis
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">Powered by TradingView</span>
                    </h3>
                    <Suspense fallback={<div className="w-full h-[500px] rounded-xl bg-surface-2 animate-pulse" /> }>
                        <TradingViewWidget
                            symbol={stock.symbol}
                            type="stock"
                            theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                            height={500}
                        />
                    </Suspense>
                </div>

                {/* Recommendation */}
                <div className={cn(
                    "p-6 rounded-xl border shadow-sm",
                    stock.recommendation === 'Strong Buy' ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" :
                        stock.recommendation === 'Buy' ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" :
                            stock.recommendation === 'Hold' ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" :
                                "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                )}>
                    <h3 className={cn(
                        "text-lg font-bold mb-2",
                        stock.recommendation === 'Strong Buy' || stock.recommendation === 'Buy' ? "text-green-800 dark:text-green-300" :
                            stock.recommendation === 'Hold' ? "text-yellow-800 dark:text-yellow-300" :
                                "text-red-800 dark:text-red-300"
                    )}>
                        Recommendation: {stock.recommendation}
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1 opacity-80">
                        {stock.reasons?.map((reason, i) => (
                            <li key={i}>{reason}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
