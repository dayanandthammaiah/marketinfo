import { Search, RefreshCw, TrendingUp, DollarSign, Bitcoin, Newspaper, Star, Bell, Briefcase, Menu } from 'lucide-react';
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
    const mainTabs = [
        { id: 'india', label: 'India', icon: TrendingUp },
        { id: 'us', label: 'US', icon: DollarSign },
        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    ];

    const secondaryTabs = [
        { id: 'favorites', label: 'Favorites', icon: Star },
        { id: 'alerts', label: 'Alerts', icon: Bell },
    ];

    const allTabs = [...mainTabs, ...secondaryTabs];

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
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Mobile Search Icon Toggle (Placeholder for now) */}
                            <button className="md:hidden p-2 text-muted hover:text-main">
                                <Search size={20} />
                            </button>

                            {/* Secondary Tabs Icons (Mobile & Desktop) */}
                            {secondaryTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={cn(
                                        "p-2 rounded-xl transition-all relative",
                                        activeTab === tab.id
                                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                            : "text-muted hover:bg-surface-2 hover:text-main"
                                    )}
                                    title={tab.label}
                                >
                                    <tab.icon size={20} />
                                    {activeTab === tab.id && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                    )}
                                </button>
                            ))}

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

                            {/* Refresh Button (Desktop) */}
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className={cn(
                                    "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-transparent hover:border-primary-500/30 text-muted hover:text-primary-600 font-medium transition-all active:scale-95",
                                    isRefreshing && "opacity-70 cursor-wait"
                                )}
                                title="Refresh data now"
                            >
                                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary-500")} />
                            </button>

                            {/* Theme Toggle */}
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Desktop Navigation Tabs */}
                    <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 border-t border-white/10 pt-0">
                        {mainTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "relative px-4 py-3 font-semibold transition-all duration-300 flex items-center gap-2 text-sm whitespace-nowrap border-b-2",
                                    activeTab === tab.id
                                        ? "border-primary-500 text-primary-600 dark:text-primary-400"
                                        : "border-transparent text-muted hover:text-main hover:border-gray-300 dark:hover:border-gray-700"
                                )}
                            >
                                <tab.icon size={16} className={cn("transition-opacity", activeTab === tab.id ? "opacity-100" : "opacity-70")} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6 overflow-y-auto scrollbar-thin pb-24 md:pb-6">
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

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 pb-safe z-50">
                <div className="flex justify-around items-center px-2 py-2">
                    {mainTabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full py-1 gap-1 transition-all duration-300",
                                    isActive ? "text-primary-600 dark:text-primary-400" : "text-muted hover:text-main"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all",
                                    isActive ? "bg-primary-50 dark:bg-primary-900/20" : "bg-transparent"
                                )}>
                                    <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
