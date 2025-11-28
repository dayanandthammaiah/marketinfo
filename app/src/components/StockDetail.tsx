import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { X } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div>
                        <h2 className="text-xl font-bold">{stock.name}</h2>
                        <p className="text-sm text-gray-500">{stock.sector}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                            <p className="text-lg font-bold">₹{stock.current_price?.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                            <p className="text-lg font-bold">{stock.score}/100</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">ROCE</p>
                            <p className={cn("text-lg font-bold", (stock.roce || 0) > 0.15 ? "text-green-500" : "text-gray-900 dark:text-gray-100")}>
                                {((stock.roce || 0) * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">EPS Growth</p>
                            <p className={cn("text-lg font-bold", (stock.eps_growth || 0) > 0.15 ? "text-green-500" : "text-gray-900 dark:text-gray-100")}>
                                {((stock.eps_growth || 0) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div>
                        <h3 className="font-bold mb-2">Price History (90 Days)</h3>
                        <div ref={chartContainerRef} className="w-full h-[300px] border dark:border-gray-700 rounded-lg" />
                    </div>

                    {/* Recommendation */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Recommendation: {stock.recommendation}</h3>
                        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400">
                            {stock.reasons?.map((reason, i) => (
                                <li key={i}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
