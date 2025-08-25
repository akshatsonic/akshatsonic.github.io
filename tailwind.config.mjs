import { themeColors, facultyFonts } from './src/theme.js';

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
            fontFamily: {
                // Faculty Glyphic everywhere - from centralized theme
                'faculty-heading': facultyFonts.heading.family.split(',').map(f => f.trim().replace(/"/g, '')),
                'faculty-body': facultyFonts.body.family.split(',').map(f => f.trim().replace(/"/g, '')),
                'faculty-code': facultyFonts.code.family.split(',').map(f => f.trim().replace(/"/g, '')),
                
                // Aliases - Faculty Glyphic for sans and heading
                'sans': facultyFonts.body.family.split(',').map(f => f.trim().replace(/"/g, '')),
                'heading': facultyFonts.heading.family.split(',').map(f => f.trim().replace(/"/g, '')),
                'mono': facultyFonts.code.family.split(',').map(f => f.trim().replace(/"/g, '')),
            },
        },
    },
    plugins: [],
}
