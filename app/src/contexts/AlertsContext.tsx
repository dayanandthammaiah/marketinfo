import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';

const ALERTS_KEY = 'investiq_alerts';

export interface PriceAlert {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'crypto';
    targetPrice: number;
    condition: 'above' | 'below';
    currentPrice: number;
    createdAt: string;
    triggered: boolean;
    notified: boolean;
}

interface AlertsContextType {
    alerts: PriceAlert[];
    addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered' | 'notified'>) => Promise<void>;
    removeAlert: (id: string) => Promise<void>;
    checkAlerts: (prices: { symbol: string; price: number }[]) => Promise<void>;
    clearAll: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export function AlertsProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);

    useEffect(() => {
        loadAlerts();
        requestNotificationPermission();
    }, []);

    const requestNotificationPermission = async () => {
        try {
            const permission = await LocalNotifications.requestPermissions();
            console.log('Notification permission:', permission);
        } catch (error) {
            console.error('Failed to request notification permission:', error);
        }
    };

    const loadAlerts = async () => {
        try {
            const { value } = await Preferences.get({ key: ALERTS_KEY });
            if (value) {
                const parsed = JSON.parse(value);
                setAlerts(parsed);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        }
    };

    const saveAlerts = async (newAlerts: PriceAlert[]) => {
        try {
            await Preferences.set({
                key: ALERTS_KEY,
                value: JSON.stringify(newAlerts)
            });
            setAlerts(newAlerts);
        } catch (error) {
            console.error('Failed to save alerts:', error);
        }
    };

    const addAlert = async (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered' | 'notified'>) => {
        const newAlert: PriceAlert = {
            ...alertData,
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            triggered: false,
            notified: false
        };

        const newAlerts = [...alerts, newAlert];
        await saveAlerts(newAlerts);
    };

    const removeAlert = async (id: string) => {
        const newAlerts = alerts.filter(a => a.id !== id);
        await saveAlerts(newAlerts);
    };

    const checkAlerts = async (prices: { symbol: string; price: number }[]) => {
        const updatedAlerts = [...alerts];
        let hasChanges = false;

        for (const alert of updatedAlerts) {
            if (alert.triggered) continue;

            const priceData = prices.find(p => p.symbol === alert.symbol);
            if (!priceData) continue;

            // Update current price
            alert.currentPrice = priceData.price;

            // Check if alert should trigger
            const shouldTrigger =
                (alert.condition === 'above' && priceData.price >= alert.targetPrice) ||
                (alert.condition === 'below' && priceData.price <= alert.targetPrice);

            if (shouldTrigger && !alert.notified) {
                alert.triggered = true;
                alert.notified = true;
                hasChanges = true;

                // Send notification
                try {
                    await LocalNotifications.schedule({
                        notifications: [{
                            id: parseInt(alert.id.replace(/\D/g, '').slice(0, 9)),
                            title: `Price Alert: ${alert.name}`,
                            body: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice}. Current: $${priceData.price.toFixed(2)}`,
                            schedule: { at: new Date(Date.now() + 1000) }
                        }]
                    });
                } catch (error) {
                    console.error('Failed to send notification:', error);
                }
            }
        }

        if (hasChanges) {
            await saveAlerts(updatedAlerts);
        }
    };

    const clearAll = async () => {
        await saveAlerts([]);
    };

    return (
        <AlertsContext.Provider value={{ alerts, addAlert, removeAlert, checkAlerts, clearAll }}>
            {children}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertsContext);
    if (!context) {
        throw new Error('useAlerts must be used within AlertsProvider');
    }
    return context;
}
