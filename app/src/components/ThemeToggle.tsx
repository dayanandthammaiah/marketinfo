import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

const THEME_KEY = 'app-theme';

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        const initializeTheme = async () => {
            try {
                // Try Capacitor Preferences first (works on native + web)
                const { value } = await Preferences.get({ key: THEME_KEY });

                if (value) {
                    setTheme(value as 'light' | 'dark');
                } else {
                    // Fall back to localStorage (web only)
                    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
                    if (savedTheme) {
                        setTheme(savedTheme);
                    } else {
                        // Use system preference
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        setTheme(prefersDark ? 'dark' : 'light');
                    }
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
                // Fallback to localStorage
                const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
                setTheme(savedTheme || 'light');
            }
        };

        initializeTheme();
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Add transition class for smooth switching
        root.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        // Toggle dark class
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to both localStorage and Capacitor Preferences
        localStorage.setItem(THEME_KEY, theme);
        Preferences.set({ key: THEME_KEY, value: theme }).catch(err => {
            console.warn('Failed to save theme to Capacitor:', err);
        });
    }, [theme]);

    const toggleTheme = async () => {
        setIsTransitioning(true);

        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        // Reset transition state after animation
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
