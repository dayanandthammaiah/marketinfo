import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';

const FAVORITES_KEY = 'investiq_favorites';

interface FavoritesData {
    stocks: string[]; // Stock symbols
    crypto: string[];  // Crypto IDs
}

interface FavoritesContextType {
    favorites: FavoritesData;
    isFavorite: (id: string, type: 'stock' | 'crypto') => boolean;
    toggleFavorite: (id: string, type: 'stock' | 'crypto') => Promise<void>;
    clearAll: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoritesData>({ stocks: [], crypto: [] });

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const { value } = await Preferences.get({ key: FAVORITES_KEY });
            if (value) {
                const parsed = JSON.parse(value);
                setFavorites(parsed);
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    };

    const saveFavorites = async (newFavorites: FavoritesData) => {
        try {
            await Preferences.set({
                key: FAVORITES_KEY,
                value: JSON.stringify(newFavorites)
            });
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    };

    const isFavorite = (id: string, type: 'stock' | 'crypto'): boolean => {
        return type === 'stock'
            ? favorites.stocks.includes(id)
            : favorites.crypto.includes(id);
    };

    const toggleFavorite = async (id: string, type: 'stock' | 'crypto') => {
        const newFavorites = { ...favorites };

        if (type === 'stock') {
            if (favorites.stocks.includes(id)) {
                newFavorites.stocks = favorites.stocks.filter(s => s !== id);
            } else {
                newFavorites.stocks = [...favorites.stocks, id];
            }
        } else {
            if (favorites.crypto.includes(id)) {
                newFavorites.crypto = favorites.crypto.filter(c => c !== id);
            } else {
                newFavorites.crypto = [...favorites.crypto, id];
            }
        }

        await saveFavorites(newFavorites);
    };

    const clearAll = async () => {
        await saveFavorites({ stocks: [], crypto: [] });
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearAll }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
}
