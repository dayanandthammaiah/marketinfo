import { Bell, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAlerts, type PriceAlert } from '../contexts/AlertsContext';

export function AlertsList() {
    const { alerts, removeAlert } = useAlerts();

    const activeAlerts = alerts.filter(a => !a.triggered);
    const triggeredAlerts = alerts.filter(a => a.triggered);

    const AlertCard = ({ alert }: { alert: PriceAlert }) => {
        const isAbove = alert.condition === 'above';
        const percentDiff = ((alert.currentPrice - alert.targetPrice) / alert.targetPrice) * 100;

        return (
            <div className={`p-4 rounded-xl border-2 transition-all ${alert.triggered
                    ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 opacity-75'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
                }`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">{alert.name}</h3>
                            <span className="text-xs font-mono text-gray-500">{alert.symbol}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                                <p className={`font-bold ${isAbove ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isAbove ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                                    ${alert.targetPrice.toFixed(2)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    ${alert.currentPrice.toFixed(2)}
                                </p>
                            </div>

                            {!alert.triggered && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Distance</p>
                                    <p className={`font-semibold ${Math.abs(percentDiff) < 5 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {Math.abs(percentDiff).toFixed(1)}%
                                    </p>
                                </div>
                            )}
                        </div>

                        {alert.triggered && (
                            <div className="mt-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded inline-block">
                                Alert Triggered!
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                        title="Delete alert"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        );
    };

    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Bell size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Price Alerts</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Set price alerts on stocks and crypto to get notified when they reach your target price.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-primary-600 dark:text-primary-400" />
                        Active Alerts ({activeAlerts.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeAlerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                </div>
            )}

            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-4">
                        Triggered ({triggeredAlerts.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {triggeredAlerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
