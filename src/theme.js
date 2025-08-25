// Theme Configuration - Single Source of Truth for All Colors & Typography
// This file governs the entire website's color palette and typography

// Faculty Glyphic Font Configuration - Faculty Glyphic Everywhere
export const facultyFonts = {
  // Faculty Glyphic for headings - High weights for bold impact
  heading: {
    family: '"Faculty Glyphic", "Impact", "Arial Black", sans-serif',
    weights: ['700', '800', '900'],
    googleFont: 'Faculty+Glyphic:wght@700;800;900',
  },
  
  // Faculty Glyphic for body text - Regular weight for readability
  body: {
    family: '"Faculty Glyphic", "Impact", "Arial Black", sans-serif', 
    weights: ['400', '500'],
    googleFont: 'Faculty+Glyphic:wght@400;500',
  },
  
  // Monospace for code blocks
  code: {
    family: '"Fira Code", "JetBrains Mono", "Courier New", monospace',
    weights: ['300', '400', '500', '600'],
    googleFont: 'Fira+Code:wght@300;400;500;600',
  },
  
  // Google Fonts URL for all fonts - Faculty Glyphic with multiple weights
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Faculty+Glyphic:wght@400;500;700;800;900&family=Fira+Code:wght@300;400;500;600&display=swap',
}

export const themeColors = {
  // Sage Green Palette - Primary Theme Colors
  sage: {
    50: '#f7f8f7',   // Very light sage
    100: '#eeefe0',  // Cream from palette
    200: '#d1d8be',  // Light sage from palette
    300: '#a7c1a8',  // Medium sage from palette
    400: '#819a91',  // Dark sage from palette
    500: '#6b8a7f',  // Darker variant
    600: '#5a7369',  // Even darker
    700: '#4a5f56',  // Very dark
    800: '#3d4f47',  // Almost dark green
    900: '#334139',  // Darkest
  },
  
  // Semantic Color Assignments
  primary: '#a7c1a8',        // Medium sage - for primary actions/highlights
  secondary: '#819a91',      // Dark sage - for secondary elements
  
  // Background Color Variants
  background: {
    light: '#eeefe0',        // Cream background for light mode
    cream: '#f7f8f7',        // Very light sage for subtle backgrounds
  },
  
  // Component-Specific Colors
  components: {
    // Links
    link: {
      light: '#819a91',      // Dark sage for light mode links
      lightHover: '#6b8a7f', // Darker on hover
      dark: '#a7c1a8',       // Medium sage for dark mode links  
      darkHover: '#d1d8be',  // Light sage on hover
    },
    
    // Theme Toggle Button
    themeButton: {
      primary: '#819a91',     // Main button color
      gradient: {
        start: '#5a7369',     // Gradient start
        mid: '#6b8a7f',       // Gradient middle
        midAlt: '#4a5f56',    // Gradient middle alternative
        end: '#334139',       // Gradient end
      },
    },
    
    // Borders and UI Elements
    border: {
      light: '#d1d8be',      // Light mode borders
      dark: '#5a7369',       // Dark mode borders
    },
    
    // Text Colors
    text: {
      sage: {
        light: '#5a7369',    // Sage text for light mode
        dark: '#a7c1a8',     // Sage text for dark mode
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
