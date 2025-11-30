import { useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import type { CryptoData } from '../types';
import { cn } from '../lib/utils';
import { AdvancedChartTabs } from './AdvancedChartTabs';
import { FavoriteButton } from './FavoriteButton';
import { AddAlertDialog } from './AddAlertDialog';

interface CryptoDetailProps {
  crypto: CryptoData;
  onClose: () => void;
}

export function CryptoDetail({ crypto, onClose }: CryptoDetailProps) {
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const tvSymbol = `${crypto.symbol.toUpperCase()}USD`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-900 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-3">
            {crypto.image && <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{crypto.name}</h2>
              <p className="text-sm text-gray-500 uppercase">{crypto.symbol}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton id={crypto.id || crypto.symbol} type="crypto" />
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
          symbol={crypto.symbol}
          name={crypto.name}
          type="crypto"
          currentPrice={crypto.current_price}
          onClose={() => setShowAlertDialog(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${crypto.current_price.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">24h Change</p>
            <p className={cn(
              "text-xl font-bold",
              (crypto.price_change_percentage_24h || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {(crypto.price_change_percentage_24h || 0).toFixed(2)}%
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Market Cap</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${(crypto.market_cap || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Volume</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${(crypto.total_volume || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
            Technical Analysis
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">Powered by TradingView</span>
          </h3>
          <AdvancedChartTabs symbol={tvSymbol} type="crypto" />
        </div>
      </div>
    </div>
  );
}
