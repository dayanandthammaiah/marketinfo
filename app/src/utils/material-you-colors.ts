/**
 * Material You Dynamic Color System
 * 
 * This module provides utilities for extracting dynamic colors from Android 12+ devices
 * and generates beautiful fallback color palettes for non-supporting devices.
 */

interface ColorPalette {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    background: string;
    onBackground: string;
    outline: string;
    outlineVariant: string;
}

/**
 * Hand-crafted Material 3 color palettes for light theme
 */
export const lightPalette: ColorPalette = {
    primary: '#006C4C',
    onPrimary: '#FFFFFF',
    primaryContainer: '#89F8C7',
    onPrimaryContainer: '#002114',
    secondary: '#4D6357',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D0E8D9',
    onSecondaryContainer: '#0B1F16',
    tertiary: '#3D5B72',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#C1E8FF',
    onTertiaryContainer: '#001D32',
    surface: '#FBFDF9',
    onSurface: '#191C1A',
    surfaceVariant: '#DBE5DE',
    onSurfaceVariant: '#404943',
    background: '#F8FAF6',
    onBackground: '#191C1A',
    outline: '#707973',
    outlineVariant: '#BFC9C2',
};

/**
 * Hand-crafted Material 3 color palettes for dark theme
 */
export const darkPalette: ColorPalette = {
    primary: '#6DDBAC',
    onPrimary: '#003825',
    primaryContainer: '#005138',
    onPrimaryContainer: '#89F8C7',
    secondary: '#B4CCBD',
    onSecondary: '#1F352A',
    secondaryContainer: '#354B40',
    onSecondaryContainer: '#D0E8D9',
    tertiary: '#A8C8FF',
    onTertiary: '#003258',
    tertiaryContainer: '#00487C',
    onTertiaryContainer: '#D4E3FF',
    surface: '#191C1A',
    onSurface: '#E1E3DF',
    surfaceVariant: '#404943',
    onSurfaceVariant: '#BFC9C2',
    background: '#121412',
    onBackground: '#E1E3DF',
    outline: '#8A938C',
    outlineVariant: '#404943',
};

/**
 * Surface tonal elevation colors for dark theme
 * In dark mode, elevated surfaces appear lighter
 */
export const darkSurfaceTones = {
    surface0: '#191C1A', // Base surface
    surface1: '#202522', // Elevation 1
    surface2: '#252A27', // Elevation 2 (cards, sheets)
    surface3: '#2A302C', // Elevation 3 (dialogs)
    surface4: '#2F3531', // Elevation 4
    surface5: '#343A36', // Elevation 5 (highest)
};

/**
 * Semantic colors for light theme
 */
export const lightSemanticColors = {
    success: '#14A44D',
    warning: '#E4A11B',
    error: '#DC4C64',
    info: '#54B4D3',
};

/**
 * Semantic colors for dark theme (brighter for better visibility)
 */
export const darkSemanticColors = {
    success: '#00C851',
    warning: '#FFBB33',
    error: '#FF4444',
    info: '#33B5E5',
};

/**
 * Check if the device supports Material You dynamic colors (Android 12+)
 */
export function supportsDynamicColors(): boolean {
    // Check if running on Android 12+ via Capacitor
    if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isAndroid = userAgent.includes('android');

        // Try to extract Android version
        const match = userAgent.match(/android\s([0-9.]*)/i);
        if (match && match[1]) {
            const version = parseInt(match[1].split('.')[0]);
            return isAndroid && version >= 12;
        }
    }
    return false;
}

/**
 * Apply Material You dynamic colors if supported, otherwise use fallback palette
 */
export function applyMaterialYouColors(isDark: boolean): void {
    const root = document.documentElement;
    const palette = isDark ? darkPalette : lightPalette;
    const semanticColors = isDark ? darkSemanticColors : lightSemanticColors;

    // Apply primary colors
    root.style.setProperty('--md-sys-color-primary', palette.primary);
    root.style.setProperty('--md-sys-color-on-primary', palette.onPrimary);
    root.style.setProperty('--md-sys-color-primary-container', palette.primaryContainer);
    root.style.setProperty('--md-sys-color-on-primary-container', palette.onPrimaryContainer);

    // Apply secondary colors
    root.style.setProperty('--md-sys-color-secondary', palette.secondary);
    root.style.setProperty('--md-sys-color-on-secondary', palette.onSecondary);
    root.style.setProperty('--md-sys-color-secondary-container', palette.secondaryContainer);
    root.style.setProperty('--md-sys-color-on-secondary-container', palette.onSecondaryContainer);

    // Apply tertiary colors
    root.style.setProperty('--md-sys-color-tertiary', palette.tertiary);
    root.style.setProperty('--md-sys-color-on-tertiary', palette.onTertiary);
    root.style.setProperty('--md-sys-color-tertiary-container', palette.tertiaryContainer);
    root.style.setProperty('--md-sys-color-on-tertiary-container', palette.onTertiaryContainer);

    // Apply surface colors
    root.style.setProperty('--md-sys-color-surface', palette.surface);
    root.style.setProperty('--md-sys-color-on-surface', palette.onSurface);
    root.style.setProperty('--md-sys-color-surface-variant', palette.surfaceVariant);
    root.style.setProperty('--md-sys-color-on-surface-variant', palette.onSurfaceVariant);

    // Apply background colors
    root.style.setProperty('--md-sys-color-background', palette.background);
    root.style.setProperty('--md-sys-color-on-background', palette.onBackground);

    // Apply outline colors
    root.style.setProperty('--md-sys-color-outline', palette.outline);
    root.style.setProperty('--md-sys-color-outline-variant', palette.outlineVariant);

    // Apply surface tones for dark mode elevation
    if (isDark) {
        root.style.setProperty('--surface-0', darkSurfaceTones.surface0);
        root.style.setProperty('--surface-1', darkSurfaceTones.surface1);
        root.style.setProperty('--surface-2', darkSurfaceTones.surface2);
        root.style.setProperty('--surface-3', darkSurfaceTones.surface3);
        root.style.setProperty('--surface-4', darkSurfaceTones.surface4);
        root.style.setProperty('--surface-5', darkSurfaceTones.surface5);
    } else {
        // Light mode surface tones (slightly darker as elevation increases)
        root.style.setProperty('--surface-0', palette.surface);
        root.style.setProperty('--surface-1', '#F4F6F4');
        root.style.setProperty('--surface-2', '#EFF2EF');
        root.style.setProperty('--surface-3', '#E9EFEC');
        root.style.setProperty('--surface-4', '#E4E9E6');
        root.style.setProperty('--surface-5', '#DFE4E1');
    }

    // Apply semantic colors
    root.style.setProperty('--color-success', semanticColors.success);
    root.style.setProperty('--color-warning', semanticColors.warning);
    root.style.setProperty('--color-error', semanticColors.error);
    root.style.setProperty('--color-info', semanticColors.info);
}

/**
 * Generate a tonal palette from a source color (for future dynamic color support)
 * This is a simplified version - full Material You uses HCT color space
 */
export function generateTonalPalette(sourceColor: string): string[] {
    // This is a placeholder for future dynamic color extraction
    // In a full implementation, you'd use the Material Color Utilities library
    // For now, return the hand-crafted palette
    return [sourceColor];
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Calculate relative luminance (for contrast checking)
 */
export function getRelativeLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
    const ratio = getContrastRatio(foreground, background);
    return ratio >= 4.5; // AA normal text standard
}
