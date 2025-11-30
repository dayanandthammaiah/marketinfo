import type { StockData } from '../types';

interface AnalystRatingsCardProps {
  stock: StockData;
}

import { useEffect, useState } from 'react';
import { AnalystRatingsService, type NormalizedRatings } from '../services/AnalystRatingsService';

// Placeholder ratings with a simple heuristic; use API if available
export function AnalystRatingsCard({ stock }: AnalystRatingsCardProps) {
  const [ratings, setRatings] = useState<NormalizedRatings | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const apiRatings = await AnalystRatingsService.fetchAlphaVantageRatings(stock.symbol);
      if (mounted && apiRatings) {
        setRatings(apiRatings);
      }
    })();
    return () => { mounted = false; };
  }, [stock.symbol]);

  // Heuristic based on score and RSI if API not available
  const score = stock.score ?? 50;
  const rsi = stock.rsi ?? 50;
  let buy = 0, hold = 0, sell = 0;
  if (!ratings) {
    if (score >= 70 || (rsi < 35)) {
      buy = 65; hold = 25; sell = 10;
    } else if (score <= 35 || (rsi > 70)) {
      buy = 10; hold = 25; sell = 65;
    } else {
      buy = 35; hold = 45; sell = 20;
    }
  } else {
    buy = ratings.buy; hold = ratings.hold; sell = ratings.sell;
  }
  const confidence = ratings ? ratings.confidence : Math.min(100, Math.round(Math.abs(score - 50) + Math.abs(50 - rsi) / 2));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white">Analyst Ratings</h3>
        <span className="text-xs text-gray-500">Placeholder</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border dark:border-gray-700 bg-green-50/70 dark:bg-green-900/20 text-center">
          <div className="text-xs uppercase font-semibold text-green-700 dark:text-green-300">Buy</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">{buy}%</div>
        </div>
        <div className="p-3 rounded-lg border dark:border-gray-700 bg-yellow-50/70 dark:bg-yellow-900/20 text-center">
          <div className="text-xs uppercase font-semibold text-yellow-700 dark:text-yellow-300">Hold</div>
          <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{hold}%</div>
        </div>
        <div className="p-3 rounded-lg border dark:border-gray-700 bg-red-50/70 dark:bg-red-900/20 text-center">
          <div className="text-xs uppercase font-semibold text-red-700 dark:text-red-300">Sell</div>
          <div className="text-xl font-bold text-red-700 dark:text-red-300">{sell}%</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        Confidence: <span className="font-semibold">{Math.min(100, Math.round(confidence))}%</span>. Replace with Yahoo/Alpha Vantage ratings if available.
      </div>
    </div>
  );
}
