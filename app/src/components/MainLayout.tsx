import { Search, RefreshCw, TrendingUp, DollarSign, Bitcoin, Newspaper, Star, Bell, Briefcase } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    const tabs = [
        { id: 'india', label: 'India', icon: TrendingUp },
        { id: 'us', label: 'US', icon: DollarSign },
        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'favorites', label: 'Favorites', icon: Star },
        { id: 'alerts', label: 'Alerts', icon: Bell },
        { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    ];

    return (
        <div className="h-screen overflow-hidden bg-app text-main flex flex-col transition-colors duration-300 font-sans">
            {/* Top App Bar */}
            <header className="sticky top-0 z-50 w-full glass border-b border-white/10 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4">
                    {/* Top Row: Logo, Search, Actions */}
                    <div className="h-16 flex items-center justify-between gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
                                <span className="text-white font-bold text-xl tracking-tighter">II</span>
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent hidden sm:block tracking-tight">
                                InvestIQ
                            </span>
                        </div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 max-w-md relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search stocks, crypto, news..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-transparent focus:border-primary-500/50 focus:bg-surface focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all placeholder:text-muted/70 text-sm"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Last Updated */}
                            {lastUpdated && (
                                <span className="hidden lg:flex items-center gap-2 text-xs text-muted font-medium mr-2 bg-surface-2 px-3 py-1.5 rounded-full border border-white/5">
                                    {activeTab === 'crypto' && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-main opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-main"></span>
                                        </span>
                                    )}
                                    Updated {formatRelativeTime(lastUpdated)}
                                </span>
                            )}

                            {/* Refresh Button */}
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-transparent hover:border-primary-500/30 text-muted hover:text-primary-600 font-medium transition-all active:scale-95",
                                    isRefreshing && "opacity-70 cursor-wait"
                                )}
                                title="Refresh data now"
                            >
                                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary-500")} />
                                <span className="hidden lg:inline">Refresh</span>
                            </button>

                            {/* Theme Toggle */}
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile Search (Visible only on mobile) */}
                    <div className="md:hidden pb-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-2 border border-transparent focus:border-primary-500/50 focus:bg-surface focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all placeholder:text-muted/70 text-sm"
                            />
                        </div>
                    </div>

                    {/* Unified Scrollable Tabs */}
                    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 border-t md:border-t-0 border-white/10 pt-2 md:pt-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm whitespace-nowrap flex-shrink-0 mb-2 md:mb-0 select-none",
                                    activeTab === tab.id
                                        ? "text-white shadow-lg shadow-primary-500/25 scale-105"
                                        : "text-muted hover:text-main hover:bg-surface-2"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <tab.icon size={18} className={cn("transition-opacity", activeTab === tab.id ? "opacity-100" : "opacity-70")} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content with Page Transitions */}
            <main className="flex-1 container mx-auto px-4 py-6 overflow-y-auto scrollbar-thin pb-safe">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-6 text-center text-xs text-muted bg-surface/50 backdrop-blur-sm">
                <p>© 2025 InvestIQ • Powered by open-source APIs</p>
            </footer>
        </div>
    );
}
