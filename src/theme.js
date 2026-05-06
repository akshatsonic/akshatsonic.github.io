// Theme Configuration - Single Source of Truth for All Colors & Typography

export const facultyFonts = {
  heading: {
    family: '"Playfair Display", Georgia, "Times New Roman", serif',
    weights: ['400', '600', '700'],
  },
  body: {
    family: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    weights: ['300', '400', '500'],
  },
  code: {
    family: '"Fira Code", "JetBrains Mono", "Courier New", monospace',
    weights: ['300', '400', '500'],
  },
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500&family=Fira+Code:wght@400;500&display=swap',
}

export const themeColors = {
  sage: {
    50:  '#f9faf6',
    100: '#f1f3ec',
    200: '#dde3d1',
    300: '#b8c9b0',
    400: '#8aab87',
    500: '#6b906d',
    600: '#547257',
    700: '#435c47',
    800: '#364a3a',
    900: '#2b3c2e',
    950: '#1a2520',
  },
  primary: '#547257',
  secondary: '#8aab87',
  background: {
    light: '#f9faf6',
    cream: '#f1f3ec',
  },
  components: {
    link: {
      light: '#547257',
      lightHover: '#364a3a',
      dark: '#8aab87',
      darkHover: '#b8c9b0',
    },
    themeButton: {
      primary: '#547257',
      gradient: {
        start: '#435c47',
        mid: '#547257',
        midAlt: '#364a3a',
        end: '#2b3c2e',
      },
    },
    border: {
      light: '#dde3d1',
      dark: '#435c47',
    },
    text: {
      sage: {
        light: '#547257',
        dark: '#8aab87',
      },
    },
  },
}

// CSS Custom Properties Generator (for use in components)
export const generateCSSVariables = () => {
  return `
    :root {
      --sage-50: ${themeColors.sage[50]};
      --sage-100: ${themeColors.sage[100]};
      --sage-200: ${themeColors.sage[200]};
      --sage-300: ${themeColors.sage[300]};
      --sage-400: ${themeColors.sage[400]};
      --sage-500: ${themeColors.sage[500]};
      --sage-600: ${themeColors.sage[600]};
      --sage-700: ${themeColors.sage[700]};
      --sage-800: ${themeColors.sage[800]};
      --sage-900: ${themeColors.sage[900]};
      
      --color-primary: ${themeColors.primary};
      --color-secondary: ${themeColors.secondary};
      
      --bg-light: ${themeColors.background.light};
      --bg-cream: ${themeColors.background.cream};
      
      --link-light: ${themeColors.components.link.light};
      --link-light-hover: ${themeColors.components.link.lightHover};
      --link-dark: ${themeColors.components.link.dark};
      --link-dark-hover: ${themeColors.components.link.darkHover};
    }
  `;
}

export default themeColors;
