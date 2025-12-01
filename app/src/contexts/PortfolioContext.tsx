import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';

const PORTFOLIO_KEY = 'investiq_portfolio';

export interface Position {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'crypto';
    quantity: number;
    buyPrice: number;
    buyDate: string;
    currentPrice?: number;
    profitLoss?: number;
    profitLossPercent?: number;
}

export interface Portfolio {
    positions: Position[];
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
}

interface PortfolioContextType {
    portfolio: Portfolio;
    addPosition: (position: Omit<Position, 'id' | 'currentPrice' | 'profitLoss' | 'profitLossPercent'>) => Promise<void>;
    removePosition: (id: string) => Promise<void>;
    updatePrices: (prices: { symbol: string; price: number }[]) => Promise<void>;
    clearAll: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

function calculatePortfolio(positions: Position[]): Portfolio {
    let totalCost = 0;
    let totalValue = 0;

    positions.forEach(pos => {
        const cost = pos.quantity * pos.buyPrice;
        const value = pos.quantity * (pos.currentPrice || pos.buyPrice);
        totalCost += cost;
        totalValue += value;
    });

    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
        positions,
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercent
    };
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
    const [positions, setPositions] = useState<Position[]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio>(calculatePortfolio([]));
    const positionsRef = useRef(positions);

    useEffect(() => {
        loadPortfolio();
    }, []);

    useEffect(() => {
        positionsRef.current = positions;
        setPortfolio(calculatePortfolio(positions));
    }, [positions]);

    const loadPortfolio = async () => {
        try {
            const { value } = await Preferences.get({ key: PORTFOLIO_KEY });
            if (value) {
                const parsed = JSON.parse(value);
                setPositions(parsed);
            }
        } catch (error) {
            console.error('Failed to load portfolio:', error);
        }
    };

    const savePositions = useCallback(async (newPositions: Position[]) => {
        try {
            await Preferences.set({
                key: PORTFOLIO_KEY,
                value: JSON.stringify(newPositions)
            });
            setPositions(newPositions);
        } catch (error) {
            console.error('Failed to save portfolio:', error);
        }
    }, []);

    const addPosition = useCallback(async (positionData: Omit<Position, 'id' | 'currentPrice' | 'profitLoss' | 'profitLossPercent'>) => {
        const newPosition: Position = {
            ...positionData,
            id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            currentPrice: positionData.buyPrice,
            profitLoss: 0,
            profitLossPercent: 0
        };

        const newPositions = [...positionsRef.current, newPosition];
        await savePositions(newPositions);
    }, [savePositions]);

    const removePosition = useCallback(async (id: string) => {
        const newPositions = positionsRef.current.filter(p => p.id !== id);
        await savePositions(newPositions);
    }, [savePositions]);

    const updatePrices = useCallback(async (prices: { symbol: string; price: number }[]) => {
        const currentPositions = positionsRef.current;
        const updatedPositions = currentPositions.map(pos => {
            const priceData = prices.find(p => p.symbol === pos.symbol);
            if (!priceData) return pos;

            const currentPrice = priceData.price;
            const cost = pos.quantity * pos.buyPrice;
            const value = pos.quantity * currentPrice;
            const profitLoss = value - cost;
            const profitLossPercent = (profitLoss / cost) * 100;

            return {
                ...pos,
                currentPrice,
                profitLoss,
                profitLossPercent
            };
        });

        // Only save if there are actual changes to avoid unnecessary writes/renders
        // For simplicity, we'll assume price updates always warrant a save if we have positions
        if (updatedPositions.length > 0) {
            await savePositions(updatedPositions);
        }
    }, [savePositions]);

    const clearAll = useCallback(async () => {
        await savePositions([]);
    }, [savePositions]);

    return (
        <PortfolioContext.Provider value={{ portfolio, addPosition, removePosition, updatePrices, clearAll }}>
            {children}
        </PortfolioContext.Provider>
    );
}

export function usePortfolio() {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolio must be used within PortfolioProvider');
    }
    return context;
}
