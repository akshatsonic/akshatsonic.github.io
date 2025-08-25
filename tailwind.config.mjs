import { themeColors } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Import sage green palette from centralized theme
                sage: themeColors.sage,
                
                // Semantic colors from theme
                primary: themeColors.primary,
                secondary: themeColors.secondary,
                
                // Background variants from theme  
                bg: themeColors.background,
            },
        },
    },
    plugins: [],
}
