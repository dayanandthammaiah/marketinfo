import { useState, useMemo } from 'react';
import { TradingViewWidget } from './TradingViewWidget';
import { cn } from '../lib/utils';

interface AdvancedChartTabsProps {
  symbol: string;
  type?: 'stock' | 'crypto';
}

export function AdvancedChartTabs({ symbol, type = 'stock' }: AdvancedChartTabsProps) {
  const [interval, setInterval] = useState<'D'|'W'|'M'>('D');
  const theme: 'light' | 'dark' = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  const tabs: { id: 'D'|'W'|'M'; label: string }[] = [
    { id: 'D', label: 'Daily' },
    { id: 'W', label: 'Weekly' },
    { id: 'M', label: 'Monthly' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setInterval(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-md3 label-medium transition-all duration-normal ease-standard',
              interval === t.id ? 'bg-primary text-on-primary elev-1' : 'hover-state-surface text-on-surface-variant'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <TradingViewWidget symbol={symbol} type={type} theme={theme} height={500} interval={interval} />
    </div>
  );
}
