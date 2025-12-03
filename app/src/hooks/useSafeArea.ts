import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

/**
 * Hook to get accurate safe area insets on Android/iOS
 * Uses CSS env(safe-area-inset-*) values read from computed styles
 */
export function useSafeArea(): SafeAreaInsets {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });

    useEffect(() => {
        const updateInsets = () => {
            // Read safe area insets from CSS custom properties
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);

            const parseInset = (value: string): number => {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? 0 : parsed;
            };

            const top = parseInset(computedStyle.getPropertyValue('--safe-area-inset-top'));
            const bottom = parseInset(computedStyle.getPropertyValue('--safe-area-inset-bottom'));
            const left = parseInset(computedStyle.getPropertyValue('--safe-area-inset-left'));
            const right = parseInset(computedStyle.getPropertyValue('--safe-area-inset-right'));

            // On native platforms, ensure minimum values for system UI
            if (Capacitor.isNativePlatform()) {
                const isLandscape = window.innerWidth > window.innerHeight;

                setInsets({
                    top: Math.max(top, isLandscape ? 0 : 24),
                    bottom: Math.max(bottom, isLandscape ? 0 : 48),
                    left: Math.max(left, isLandscape ? 48 : 0),
                    right: Math.max(right, 0),
                });
            } else {
                // Web platform - use values as-is
                setInsets({ top, bottom, left, right });
            }
        };

        updateInsets();

        // Update on resize and orientation changes
        window.addEventListener('resize', updateInsets);
        window.addEventListener('orientationchange', updateInsets);

        // Also listen to visualViewport changes for more accurate detection
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateInsets);
        }

        return () => {
            window.removeEventListener('resize', updateInsets);
            window.removeEventListener('orientationchange', updateInsets);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateInsets);
            }
        };
    }, []);

    return insets;
}
