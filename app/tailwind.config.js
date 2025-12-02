/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Material 3 color tokens (using CSS custom properties)
                'md-primary': 'var(--md-sys-color-primary)',
                'md-on-primary': 'var(--md-sys-color-on-primary)',
                'md-primary-container': 'var(--md-sys-color-primary-container)',
                'md-on-primary-container': 'var(--md-sys-color-on-primary-container)',

                'md-secondary': 'var(--md-sys-color-secondary)',
                'md-on-secondary': 'var(--md-sys-color-on-secondary)',
                'md-secondary-container': 'var(--md-sys-color-secondary-container)',
                'md-on-secondary-container': 'var(--md-sys-color-on-secondary-container)',

                'md-tertiary': 'var(--md-sys-color-tertiary)',
                'md-on-tertiary': 'var(--md-sys-color-on-tertiary)',
                'md-tertiary-container': 'var(--md-sys-color-tertiary-container)',
                'md-on-tertiary-container': 'var(--md-sys-color-on-tertiary-container)',

                'md-surface': 'var(--md-sys-color-surface)',
                'md-on-surface': 'var(--md-sys-color-on-surface)',
                'md-surface-variant': 'var(--md-sys-color-surface-variant)',
                'md-on-surface-variant': 'var(--md-sys-color-on-surface-variant)',

                'md-background': 'var(--md-sys-color-background)',
                'md-on-background': 'var(--md-sys-color-on-background)',

                'md-outline': 'var(--md-sys-color-outline)',
                'md-outline-variant': 'var(--md-sys-color-outline-variant)',

                // Legacy/convenience colors
                'app': 'var(--bg-app)',
                'surface': {
                    DEFAULT: 'var(--bg-surface)',
                    0: 'var(--surface-0)',
                    1: 'var(--surface-1)',
                    2: 'var(--surface-2)',
                    3: 'var(--surface-3)',
                    4: 'var(--surface-4)',
                    5: 'var(--surface-5)',
                },
                'main': 'var(--text-main)',
                'muted': 'var(--text-muted)',

                // Primary color scale (legacy)
                primary: {
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    900: 'var(--primary-900)',
                },

                // Semantic colors
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                error: 'var(--color-error)',
                info: 'var(--color-info)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
