import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { ArrowLeft } from 'lucide-react';
import type { StockData } from '../types/index';
import { cn } from '../lib/utils';

interface StockDetailProps {
    stock: StockData;
    onClose: () => void;
}

export function StockDetail({ stock, onClose }: StockDetailProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current || !stock.history || stock.history.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' },
                horzLines: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' },
            },
        });

        const lineSeries = chart.addSeries(LineSeries, {
            color: '#2563eb',
            lineWidth: 2,
        });

        lineSeries.setData(stock.history);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [stock]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-900 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex items-center gap-4 shadow-sm sticky top-0 z-10">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{stock.name}</h2>
                    <p className="text-sm text-gray-500">{stock.sector}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stock.symbol?.includes('USDT') || stock.symbol?.includes('USD') ? '$' : '₹'}
                            {stock.current_price?.toLocaleString()}
                        </p>
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
                    <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Price History (90 Days)</h3>
                    <div ref={chartContainerRef} className="w-full h-[300px]" />
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
