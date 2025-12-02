import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export function useSafeArea(): SafeAreaInsets {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });

    useEffect(() => {
        const updateInsets = () => {
            if (!Capacitor.isNativePlatform()) {
                return;
            }

            // For Android, use standard safe area values
            // These are typical dimensions for modern Android devices
            const isLandscape = window.innerWidth > window.innerHeight;

            setInsets({
                top: isLandscape ? 0 : 24, // Status bar height (0 in landscape on most devices)
                bottom: isLandscape ? 0 : 48, // Navigation bar (gesture bar is ~48px)
                left: isLandscape ? 48 : 0, // Navigation in landscape
                right: 0,
            });
        };

        updateInsets();

        // Re-calculate on orientation change
        window.addEventListener('resize', updateInsets);
        window.addEventListener('orientationchange', updateInsets);

        return () => {
            window.removeEventListener('resize', updateInsets);
            window.removeEventListener('orientationchange', updateInsets);
        };
    }, []);

    return insets;
}
