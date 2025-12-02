import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { applyMaterialYouColors } from '../utils/material-you-colors';
import { motion, AnimatePresence } from 'framer-motion';

const THEME_KEY = 'app-theme';

export function ThemeToggle() {
    // Initialize state from localStorage directly to match index.html script
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'dark' || saved === 'light') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    // Sync with Capacitor Preferences on mount
    useEffect(() => {
        const syncPreferences = async () => {
            try {
                const { value } = await Preferences.get({ key: THEME_KEY });
                if (value && (value === 'light' || value === 'dark') && value !== theme) {
                    setTheme(value);
                }
            } catch (e) {
                console.warn('Failed to sync theme preferences:', e);
            }
        };
        syncPreferences();
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === 'dark';

        // Apply dark class
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Apply Material You colors
        applyMaterialYouColors(isDark);

        // Persist theme
        localStorage.setItem(THEME_KEY, theme);
        Preferences.set({ key: THEME_KEY, value: theme }).catch(() => { });

        // Apply theme color meta tag for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                isDark ? '#191C1A' : '#FBFDF9'
            );
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');

        // Add haptic feedback on mobile if available
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative p-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] active:scale-95 transition-all duration-200 elevation-1 hover:elevation-2"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{
                        duration: 0.15,
                        ease: [0.3, 0.0, 0, 1.0],
                    }}
                    className="flex items-center justify-center"
                >
                    {theme === 'light' ? (
                        <Moon
                            size={20}
                            className="text-[var(--md-sys-color-on-surface)]"
                            strokeWidth={2}
                        />
                    ) : (
                        <Sun
                            size={20}
                            className="text-amber-400"
                            strokeWidth={2}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Subtle indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--md-sys-color-primary)] opacity-80" />
        </motion.button>
    );
}
