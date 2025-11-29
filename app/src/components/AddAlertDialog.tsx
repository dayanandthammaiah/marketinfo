import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAlerts } from '../contexts/AlertsContext';

interface AddAlertDialogProps {
    symbol: string;
    name: string;
    type: 'stock' | 'crypto';
    currentPrice: number;
    onClose: () => void;
}

export function AddAlertDialog({ symbol, name, type, currentPrice, onClose }: AddAlertDialogProps) {
    const [targetPrice, setTargetPrice] = useState(currentPrice);
    const [condition, setCondition] = useState<'above' | 'below'>('above');
    const { addAlert } = useAlerts();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addAlert({
            symbol,
            name,
            type,
            targetPrice,
            condition,
            currentPrice
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <Bell className="text-primary-600 dark:text-primary-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set Price Alert</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Price */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${currentPrice.toFixed(2)}
                        </p>
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Alert When Price Goes
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setCondition('above')}
                                className={`py-3 px-4 rounded-xl font-semibold transition-all ${condition === 'above'
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Above
                            </button>
                            <button
                                type="button"
                                onClick={() => setCondition('below')}
                                className={`py-3 px-4 rounded-xl font-semibold transition-all ${condition === 'below'
                                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Below
                            </button>
                        </div>
                    </div>

                    {/* Target Price */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Target Price
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                            <input
                                type="number"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                                step="0.01"
                                min="0"
                                required
                                className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-lg focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Alert Preview */}
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Alert:</span> Notify me when {name} goes{' '}
                            <span className={condition === 'above' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>
                                {condition}
                            </span>{' '}
                            <span className="font-bold">${targetPrice.toFixed(2)}</span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-500 text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            Create Alert
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
