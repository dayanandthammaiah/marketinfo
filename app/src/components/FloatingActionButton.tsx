import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface FloatingActionButtonProps {
    onClick: () => void;
    loading?: boolean;
}

export function FloatingActionButton({ onClick, loading = false }: FloatingActionButtonProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = () => {
        if (!loading) {
            onClick();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Tooltip */}
            {showTooltip && !loading && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg whitespace-nowrap animate-fade-in">
                    Refresh Data
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                </div>
            )}

            {/* Button */}
            <button
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={loading}
                className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                aria-label="Refresh data"
            >
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity" />

                {/* Icon */}
                <RefreshCw
                    className={`w-6 h-6 text-white transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
                    strokeWidth={2.5}
                />

                {/* Pulse Animation when loading */}
                {loading && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 animate-ping opacity-75" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 animate-pulse" />
                    </>
                )}
            </button>

            {/* Loading text */}
            {loading && (
                <div className="absolute bottom-0 right-16 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap animate-pulse">
                    Refreshing...
                </div>
            )}
        </div>
    );
}
