import { useMemo } from 'react';
import type { StockData, AppData } from '../types';
import { curatedPeers } from '../data/peers';

interface PeersCardProps {
  current: StockData;
  appData: AppData | null;
}

export function PeersCard({ current, appData }: PeersCardProps) {
  const peers = useMemo(() => {
    if (!appData) return [] as StockData[];
    const all = [...(appData.nifty_50 || []), ...(appData.us_stocks || [])];
    const curated = curatedPeers[current.symbol];
    if (curated && curated.length) {
      const bySymbol = new Map(all.map(s => [s.symbol, s] as const));
      const curatedStocks = curated.map(sym => bySymbol.get(sym)).filter(Boolean) as StockData[];
      if (curatedStocks.length) return curatedStocks.slice(0, 8);
    }
    return all.filter(s => s.symbol !== current.symbol && s.sector === current.sector).slice(0, 8);
  }, [appData, current]);

  if (!peers.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
      <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Peers in {current.sector}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {peers.map(p => (
          <div key={p.symbol} className="p-3 rounded-lg border dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.symbol}</div>
            <div className="text-xs text-gray-500 truncate">{p.name}</div>
            <div className="mt-1 text-sm font-bold">
              {(p.symbol?.includes('USDT') || p.symbol?.includes('USD') ? '$' : '₹')}{p.current_price?.toLocaleString()}
            </div>
            {typeof p.change === 'number' && (
              <div className={`text-xs font-semibold ${p.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {p.change > 0 ? '+' : ''}{p.change.toFixed(2)} ({p.changePercent?.toFixed(2)}%)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
