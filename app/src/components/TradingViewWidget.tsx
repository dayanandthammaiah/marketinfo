import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
    symbol: string;
    type?: 'stock' | 'crypto';
    theme?: 'light' | 'dark';
    height?: number;
}

export function TradingViewWidget({
    symbol,
    type = 'stock',
    theme = 'light',
    height = 500
}: TradingViewWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Format symbol for TradingView
        let tvSymbol = symbol;

        if (type === 'stock') {
            // US stocks
            if (!symbol.includes(':')) {
                if (symbol.endsWith('.NS')) {
                    // Indian stocks - NSE
                    tvSymbol = `NSE:${symbol.replace('.NS', '')}`;
                } else {
                    // Assume US stock (NASDAQ or NYSE)
                    tvSymbol = `NASDAQ:${symbol}`;
                }
            }
        } else {
            // Crypto
            tvSymbol = `${symbol.toUpperCase()}USD`;
        }

        // Clear container
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        // Load TradingView script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (containerRef.current && (window as any).TradingView) {
                new (window as any).TradingView.widget({
                    container_id: containerRef.current.id,
                    autosize: true,
                    symbol: tvSymbol,
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: theme,
                    style: '1',
                    locale: 'en',
                    toolbar_bg: theme === 'dark' ? '#1e293b' : '#f1f3f6',
                    enable_publishing: false,
                    allow_symbol_change: true,
                    hide_side_toolbar: false,
                    details: true,
                    hotlist: true,
                    calendar: true,
                    studies: [
                        'RSI@tv-basicstudies',
                        'MASimple@tv-basicstudies',
                        'MACD@tv-basicstudies'
                    ],
                    height: height,
                    width: '100%'
                });
            }
        };

        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
        if (!existingScript) {
            document.head.appendChild(script);
        } else if ((window as any).TradingView && containerRef.current) {
            // Script already loaded, create widget immediately
            new (window as any).TradingView.widget({
                container_id: containerRef.current.id,
                autosize: true,
                symbol: tvSymbol,
                interval: 'D',
                timezone: 'Etc/UTC',
                theme: theme,
                style: '1',
                locale: 'en',
                toolbar_bg: theme === 'dark' ? '#1e293b' : '#f1f3f6',
                enable_publishing: false,
                allow_symbol_change: true,
                hide_side_toolbar: false,
                details: true,
                hotlist: true,
                calendar: true,
                studies: [
                    'RSI@tv-basicstudies',
                    'MASimple@tv-basicstudies',
                    'MACD@tv-basicstudies'
                ],
                height: height,
                width: '100%'
            });
        }

        return () => {
            // Cleanup
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, type, theme, height]);

    return (
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
            <div
                ref={containerRef}
                id={`tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`}
                style={{ height: `${height}px` }}
                className="bg-white dark:bg-gray-800"
            />
        </div>
    );
}

// Compact overview widget for tables/cards
export function TradingViewMiniWidget({ symbol, type = 'stock' }: { symbol: string; type?: 'stock' | 'crypto' }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let tvSymbol = symbol;

        if (type === 'stock') {
            if (!symbol.includes(':')) {
                if (symbol.endsWith('.NS')) {
                    tvSymbol = `NSE:${symbol.replace('.NS', '')}`;
                } else {
                    tvSymbol = `NASDAQ:${symbol}`;
                }
            }
        } else {
            tvSymbol = `${symbol.toUpperCase()}USD`;
        }

        if (containerRef.current) {
            containerRef.current.innerHTML = `
                <div class="tradingview-widget-container">
                    <div class="tradingview-widget-container__widget"></div>
                </div>
            `;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            symbol: tvSymbol,
            width: '100%',
            height: '100%',
            locale: 'en',
            dateRange: '1M',
            colorTheme: 'light',
            trendLineColor: 'rgba(99, 102, 241, 1)',
            underLineColor: 'rgba(99, 102, 241, 0.3)',
            underLineBottomColor: 'rgba(99, 102, 241, 0)',
            isTransparent: false,
            autosize: true,
            largeChartUrl: ''
        });

        if (containerRef.current) {
            const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget');
            if (widgetContainer) {
                widgetContainer.appendChild(script);
            }
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, type]);

    return (
        <div
            ref={containerRef}
            className="w-full h-48 rounded-lg overflow-hidden"
        />
    );
}
