import { Star } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import type { StockData, AppData } from '../types';

interface FavoritesTabProps {
    data: AppData | null;
    onStockClick?: (stock: StockData) => void;
}

export function FavoritesTab({ data, onStockClick }: FavoritesTabProps) {
    const { favorites } = useFavorites();

    if (!data) return null;

    const favoriteStocks = [
        ...(data.nifty_50?.filter(s => favorites.stocks.includes(s.symbol)) || []),
        ...(data.us_stocks?.filter(s => favorites.stocks.includes(s.symbol)) || [])
    ];

    const favoriteCrypto = data.crypto?.filter(c => favorites.crypto.includes(c.id || c.symbol)) || [];

    const totalFavorites = favoriteStocks.length + favoriteCrypto.length;

    if (totalFavorites === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-8 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 rounded-full mb-6">
                    <Star size={64} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Favorites Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                    Click the star icon on any stock or crypto to add it to your favorites for quick access.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="glass rounded-xl px-6 py-4 border border-gray-200 dark:border-gray-700">
                <h2 className="gradient-text m3-headline-small mb-2">Your Favorites</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    {totalFavorites} favorite{totalFavorites !== 1 ? 's' : ''} • Quick access to your tracked assets
                </p>
            </div>

            {/* Stocks */}
            {favoriteStocks.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Stocks ({favoriteStocks.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favoriteStocks.map(stock => (
                            <button
                                key={stock.symbol}
                                onClick={() => onStockClick?.(stock)}
                                className="text-left card-gradient p-4 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{stock.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{stock.symbol}</p>
                                    </div>
                                    <Star size={20} className="fill-amber-400 text-amber-400" />
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ${stock.current_price.toFixed(2)}
                                        </p>
                                        <p className={`text-sm font-semibold ${(stock.changePercent || 0) >= 0
                                            ? 'text- emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {(stock.changePercent || 0) >= 0 ? '+' : ''}
                                            {(stock.changePercent || 0).toFixed(2)}%
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Score:</span>
                                        <span className="font-bold">{stock.score?.toFixed(0)}/100</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Crypto */}
            {favoriteCrypto.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Cryptocurrency ({favoriteCrypto.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favoriteCrypto.map(crypto => (
                            <div
                                key={crypto.id || crypto.symbol}
                                className="card-gradient p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {crypto.image && (
                                            <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{crypto.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">{crypto.symbol}</p>
                                        </div>
                                    </div>
                                    <Star size={20} className="fill-amber-400 text-amber-400" />
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ${crypto.current_price.toLocaleString()}
                                        </p>
                                        <p className={`text-sm font-semibold ${(crypto.price_change_percentage_24h || 0) >= 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {(crypto.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                                            {(crypto.price_change_percentage_24h || 0).toFixed(2)}% (24h)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
