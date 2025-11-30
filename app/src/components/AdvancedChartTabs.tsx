import { useState, lazy, Suspense } from 'react';
import { cn } from '../lib/utils';

const TradingViewWidget = lazy(() => import('./TradingViewWidget').then(m => ({ default: m.TradingViewWidget })));

interface AdvancedChartTabsProps {
  symbol: string;
  type?: 'stock' | 'crypto';
}

export function AdvancedChartTabs({ symbol, type = 'stock' }: AdvancedChartTabsProps) {
  const [interval, setInterval] = useState<'D' | 'W' | 'M'>('D');
  const theme: 'light' | 'dark' = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  const tabs: { id: 'D' | 'W' | 'M'; label: string }[] = [
    { id: 'D', label: 'Daily' },
    { id: 'W', label: 'Weekly' },
    { id: 'M', label: 'Monthly' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3 bg-surface-2/50 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setInterval(t.id)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300',
              interval === t.id
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-muted hover:text-main hover:bg-white/50 dark:hover:bg-gray-700/50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Suspense fallback={<div className="w-full h-[500px] rounded-xl bg-surface-2 animate-pulse" /> }>
        <TradingViewWidget symbol={symbol} type={type} theme={theme} height={500} interval={interval} />
      </Suspense>
    </div>
  );
}
