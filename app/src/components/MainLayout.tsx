import { useState } from 'react';
import { Search, Menu, X, RefreshCw, TrendingUp, DollarSign, Bitcoin, Newspaper } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

interface MainLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onSearch: (query: string) => void;
    lastUpdated: Date | null;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function MainLayout({ children, activeTab, onTabChange, onSearch, lastUpdated, onRefresh, isRefreshing }: MainLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const tabs = [
        { id: 'india', label: 'India', icon: TrendingUp },
        { id: 'us', label: 'US Markets', icon: DollarSign },
        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
        { id: 'news', label: 'News', icon: Newspaper },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
            {/* Top App Bar */}
            <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    {/* Logo with Gradient */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">II</span>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                            InvestIQ
                        </span>
                    </div>

                    {/* Search Bar (Hidden on mobile, shown on desktop) */}
                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search stocks, crypto, news..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm",
                                    activeTab === tab.id
                                        ? "text-white shadow-lg"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg -z-10" />
                                )}
                                <tab.icon size={16} className={activeTab === tab.id ? "opacity-100" : "opacity-70"} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Right Actions (Unified) */}
                    <div className="flex items-center gap-2">
                        {/* Last Updated (Desktop only) */}
                        {lastUpdated && (
                            <span className="hidden lg:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mr-2">
                                {activeTab === 'crypto' && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                                Updated {formatRelativeTime(lastUpdated)}
                            </span>
                        )}

                        {/* Refresh Button (Always visible) */}
                        <button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className={cn(
                                "flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all shadow-sm",
                                isRefreshing && "opacity-50 cursor-not-allowed"
                            )}
                            title="Refresh data now"
                        >
                            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                            <span className="hidden lg:inline">Refresh</span>
                        </button>

                        {/* Theme Toggle (Always visible) */}
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search & Nav (Collapsible) */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-800 p-4 space-y-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg animate-in slide-in-from-top-4">
                        {lastUpdated && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                Updated {formatRelativeTime(lastUpdated)}
                            </div>
                        )}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        onTabChange(tab.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={cn(
                                        "px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2",
                                        activeTab === tab.id
                                            ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2025 InvestIQ • Powered by open-source APIs</p>
            </footer>
        </div>
    );
}
