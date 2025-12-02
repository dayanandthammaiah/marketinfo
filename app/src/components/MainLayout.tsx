import { Search, RefreshCw, TrendingUp, DollarSign, Bitcoin, Newspaper, Star, Bell, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { tabTransition } from '../utils/animations';
import { useSafeArea } from '../hooks/useSafeArea';

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
    const [hiddenHeader, setHiddenHeader] = useState(false);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const safeArea = useSafeArea();

    useEffect(() => {
        const el = document.getElementById('app-main-scroll');
        if (!el) return;

        const onScroll = () => {
            const current = el.scrollTop;

            // Hide/show header based on scroll direction
            if (current > lastScrollTop + 5) {
                setHiddenHeader(true);
            } else if (current < lastScrollTop - 5) {
                setHiddenHeader(false);
            }

            // Add surface tint when scrolled
            setIsScrolled(current > 10);
            setLastScrollTop(current);
        };

        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll as any);
    }, [lastScrollTop]);

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

    return (
        <div className="h-screen overflow-hidden bg-app text-main flex flex-col transition-colors duration-300 font-sans">
            {/* Top App Bar */}
            <header
                className={cn(
                    "sticky top-0 z-50 w-full transition-all duration-300",
                    "glass border-b border-white/10",
                    hiddenHeader ? "-translate-y-full" : "translate-y-0",
                    isScrolled ? "elevation-2 bg-[var(--surface-1)]/95" : "elevation-0 bg-[var(--surface-0)]/90"
                )}
            >
                <div className="container mx-auto px-4">
                    {/* Top Row: Logo, Search, Actions */}
                    <div className="h-16 flex items-center justify-between gap-4">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center elevation-1 group-hover:elevation-2 transition-all duration-300">
                                <span className="text-white font-bold text-xl tracking-tighter">II</span>
                            </div>
                            <span className="m3-title-large bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent hidden sm:block tracking-tight">
                                InvestIQ
                            </span>
                        </motion.div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:flex flex-1 max-w-md relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search stocks, crypto, news..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-transparent focus:border-primary-500/50 focus:bg-surface focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all placeholder:text-muted/70 text-sm m3-body-medium"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Mobile Search Icon */}
                            <motion.button
                                className="md:hidden p-2 rounded-xl text-muted hover:text-main hover:bg-surface-2 transition-all"
                                whileTap={{ scale: 0.95 }}
                            >
                                <Search size={20} />
                            </motion.button>

                            {/* Secondary Tabs Icons */}
                            {secondaryTabs.map(tab => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all relative",
                                        activeTab === tab.id
                                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 elevation-1"
                                            : "text-muted hover:bg-surface-2 hover:text-main"
                                    )}
                                    title={tab.label}
                                >
                                    <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                    {activeTab === tab.id && (
                                        <motion.span
                                            layoutId="secondary-active-indicator"
                                            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-500 rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            ))}

                            <div className="h-6 w-px bg-[var(--md-sys-color-outline-variant)] mx-1 hidden sm:block" />

                            {/* Last Updated */}
                            {lastUpdated && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="hidden lg:flex items-center gap-2 text-xs text-muted font-medium mr-2 bg-surface-2 px-3 py-1.5 rounded-full border border-[var(--md-sys-color-outline-variant)]/20 m3-label-medium"
                                >
                                    {activeTab === 'crypto' && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
                                        </span>
                                    )}
                                    Updated {formatRelativeTime(lastUpdated)}
                                </motion.span>
                            )}

                            {/* Refresh Button */}
                            <motion.button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-transparent hover:border-primary-500/30 text-muted hover:text-primary-600 font-medium transition-all elevation-0 hover:elevation-1",
                                    isRefreshing && "opacity-70 cursor-wait"
                                )}
                                title="Refresh data now"
                            >
                                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary-500")} />
                            </motion.button>

                            {/* Theme Toggle */}
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Desktop Navigation Tabs */}
                    <nav className="hidden md:flex items-center justify-center gap-1 border-t border-[var(--md-sys-color-outline-variant)]/20 px-4 py-1 relative">
                        {mainTabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    whileHover={{ scale: isActive ? 1 : 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "relative flex-1 max-w-[180px] px-6 py-3 m3-title-small font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-xl",
                                        isActive
                                            ? "text-[var(--md-sys-color-on-primary-container)] bg-[var(--md-sys-color-primary-container)]"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-2)]"
                                    )}
                                >
                                    <tab.icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn(
                                            "transition-all duration-300",
                                            isActive && "scale-110"
                                        )}
                                    />
                                    <span>{tab.label}</span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute inset-0 bg-[var(--md-sys-color-primary-container)] rounded-xl -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main id="app-main-scroll" className="flex-1 container mx-auto px-4 py-6 overflow-y-auto scrollbar-thin pb-24 md:pb-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={tabTransition}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation */}
            <motion.div
                className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--md-sys-color-outline-variant)]/20 z-50 elevation-3"
                style={{ paddingBottom: `${Math.max(safeArea.bottom, 8)}px` }}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="flex justify-around items-center px-2 py-2">
                    {mainTabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-full py-2 gap-1 transition-all duration-300 rounded-xl",
                                    isActive ? "text-[var(--md-sys-color-primary)]" : "text-[var(--text-muted)]"
                                )}
                            >
                                <div className={cn(
                                    "relative p-1.5 rounded-xl transition-all",
                                    isActive && "bg-[var(--md-sys-color-primary-container)]"
                                )}>
                                    <tab.icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="transition-all duration-300"
                                    />

                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-tab-indicator"
                                            className="absolute inset-0 bg-[var(--md-sys-color-primary-container)] rounded-xl -z-10"
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </div>
                                <span className={cn(
                                    "m3-label-small font-medium transition-all",
                                    isActive && "font-bold"
                                )}>
                                    {tab.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
