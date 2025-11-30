import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

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

    const [isTransitioning, setIsTransitioning] = useState(false);

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
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Add transition class only after mount to prevent initial flash
        setTimeout(() => {
            root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        }, 100);

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem(THEME_KEY, theme);
        Preferences.set({ key: THEME_KEY, value: theme }).catch(() => { });
    }, [theme]);

    const toggleTheme = () => {
        setIsTransitioning(true);
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        setTimeout(() => setIsTransitioning(false), 300);
    };

    return (
        <button
            onClick={toggleTheme}
            disabled={isTransitioning}
            className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative">
                {theme === 'light' ? (
                    <Moon
                        size={20}
                        className="text-gray-700 dark:text-gray-200 transition-transform duration-300"
                    />
                ) : (
                    <Sun
                        size={20}
                        className="text-amber-500 dark:text-amber-400 transition-transform duration-300 rotate-180"
                    />
                )}
            </div>
            {isTransitioning && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 opacity-20 animate-pulse" />
            )}
        </button>
    );
}
