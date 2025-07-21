/**
 * 🎨 Theme Configuration
 * 
 * Centralized design system for the RecipeApp.
 * Includes colors, typography, spacing, and component styles.
 */

/**
 * 🌈 Color Palette
 */
export const Colors = {
  // Primary colors - Food & Cooking inspired
  primary: {
    50: '#FFF8E1',   // Lightest cream
    100: '#FFECB3',  // Light cream
    200: '#FFE082',  // Cream
    300: '#FFD54F',  // Light golden
    400: '#FFCA28',  // Golden
    500: '#FFC107',  // Main golden (primary)
    600: '#FFB300',  // Dark golden
    700: '#FFA000',  // Darker golden
    800: '#FF8F00',  // Orange golden
    900: '#FF6F00',  // Deep orange
  },
  
  // Secondary colors - Fresh & Natural
  secondary: {
    50: '#E8F5E8',   // Very light green
    100: '#C8E6C9',  // Light green
    200: '#A5D6A7',  // Medium light green
    300: '#81C784',  // Medium green
    400: '#66BB6A',  // Medium dark green
    500: '#4CAF50',  // Main green (secondary)
    600: '#43A047',  // Dark green
    700: '#388E3C',  // Darker green
    800: '#2E7D32',  // Very dark green
    900: '#1B5E20',  // Deepest green
  },
  
  // Accent colors - Warm & Appetizing
  accent: {
    red: '#F44336',     // Tomato red
    orange: '#FF9800',  // Carrot orange
    yellow: '#FFEB3B',  // Lemon yellow
    pink: '#E91E63',    // Berry pink
    purple: '#9C27B0',  // Grape purple
    brown: '#795548',   // Chocolate brown
  },
  
  // Neutral colors
  neutral: {
    50: '#FAFAFA',   // Almost white
    100: '#F5F5F5',  // Very light gray
    200: '#EEEEEE',  // Light gray
    300: '#E0E0E0',  // Medium light gray
    400: '#BDBDBD',  // Medium gray
    500: '#9E9E9E',  // Gray
    600: '#757575',  // Dark gray
    700: '#616161',  // Darker gray
    800: '#424242',  // Very dark gray
    900: '#212121',  // Almost black
  },
  
  // Semantic colors
  semantic: {
    success: '#4CAF50',   // Green
    warning: '#FF9800',   // Orange
    error: '#F44336',     // Red
    info: '#2196F3',      // Blue
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',   // Pure white
    secondary: '#FAFAFA', // Off white
    tertiary: '#F5F5F5',  // Light gray
    paper: '#FFFFFF',     // Card background
    disabled: '#E0E0E0',  // Disabled background
  },
  
  // Text colors
  text: {
    primary: '#212121',   // Main text color
    secondary: '#757575', // Secondary text
    disabled: '#BDBDBD',  // Disabled text
    hint: '#9E9E9E',      // Hint text
    inverse: '#FFFFFF',   // White text
  },
  
  // Border colors
  border: {
    light: '#E0E0E0',     // Light border
    medium: '#BDBDBD',    // Medium border
    dark: '#757575',      // Dark border
    focus: '#FFC107',     // Focused border
  },
};

/**
 * 📝 Typography Scale
 */
export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    // Custom fonts for headings
    heading: 'Roboto-Bold',
    body: 'Roboto-Regular',
  },
  
  // Font sizes (in sp/pt)
  fontSize: {
    xs: 12,    // Extra small
    sm: 14,    // Small
    base: 16,  // Base size
    lg: 18,    // Large
    xl: 20,    // Extra large
    '2xl': 24, // 2x large
    '3xl': 30, // 3x large
    '4xl': 36, // 4x large
    '5xl': 48, // 5x large
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,   // 20% above font size
    normal: 1.4,  // 40% above font size
    relaxed: 1.6, // 60% above font size
    loose: 1.8,   // 80% above font size
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Text styles for common use cases
  styles: {
    // Headings
    h1: {
      fontFamily: 'Roboto-Bold',
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '700' as const,
      color: Colors.text.primary,
    },
    h2: {
      fontFamily: 'Roboto-Bold',
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
      color: Colors.text.primary,
    },
    h3: {
      fontFamily: 'Roboto-Medium',
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '500' as const,
      color: Colors.text.primary,
    },
    h4: {
      fontFamily: 'Roboto-Medium',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '500' as const,
      color: Colors.text.primary,
    },
    
    // Body text
    bodyLarge: {
      fontFamily: 'Roboto-Regular',
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '400' as const,
      color: Colors.text.primary,
    },
    body: {
      fontFamily: 'Roboto-Regular',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      color: Colors.text.primary,
    },
    bodySmall: {
      fontFamily: 'Roboto-Regular',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      color: Colors.text.secondary,
    },
    
    // Special text
    caption: {
      fontFamily: 'Roboto-Regular',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      color: Colors.text.secondary,
    },
    button: {
      fontFamily: 'Roboto-Medium',
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '500' as const,
      textTransform: 'uppercase' as const,
    },
    label: {
      fontFamily: 'Roboto-Medium',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      color: Colors.text.primary,
    },
  },
};

/**
 * 📏 Spacing Scale
 */
export const Spacing = {
  // Base unit (4px)
  unit: 4,
  
  // Spacing scale
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  '2xl': 48, // 3rem
  '3xl': 64, // 4rem
  '4xl': 96, // 6rem
  
  // Component-specific spacing
  components: {
    // Padding
    buttonPadding: { vertical: 12, horizontal: 24 },
    cardPadding: 16,
    screenPadding: 16,
    sectionPadding: 24,
    
    // Margins
    elementMargin: 8,
    sectionMargin: 16,
    screenMargin: 16,
    
    // Gaps
    listGap: 8,
    gridGap: 12,
    layoutGap: 16,
  },
};

/**
 * 🔲 Border Radius Scale
 */
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999, // Fully rounded
  
  // Component-specific radius
  components: {
    button: 8,
    card: 12,
    input: 8,
    modal: 16,
    image: 8,
    chip: 16,
  },
};

/**
 * 🎭 Shadows
 */
export const Shadows = {
  // Elevation levels
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
};

/**
 * 📐 Layout Constants
 */
export const Layout = {
  // Screen dimensions helpers
  window: {
    // These will be set by the app at runtime
    width: 0,
    height: 0,
  },
  
  // Component dimensions
  components: {
    // Navigation
    tabBarHeight: 56,
    headerHeight: 56,
    
    // Cards
    recipeCardHeight: 240,
    categoryCardHeight: 120,
    
    // Buttons
    buttonHeight: 48,
    iconButtonSize: 48,
    
    // Inputs
    inputHeight: 48,
    textAreaMinHeight: 100,
    
    // Lists
    listItemHeight: 72,
    
    // Images
    recipeImageAspectRatio: 16 / 9,
    avatarSizeSmall: 32,
    avatarSizeMedium: 48,
    avatarSizeLarge: 64,
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: 480,   // Small phones
    md: 768,   // Large phones / small tablets
    lg: 1024,  // Tablets
    xl: 1280,  // Large tablets / desktop
  },
};

/**
 * ⏱️ Animation Configuration
 */
export const Animation = {
  // Duration presets
  duration: {
    fast: 150,     // Quick feedback
    normal: 250,   // Standard transitions
    slow: 400,     // Smooth transitions
    slower: 600,   // Emphasis transitions
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
  
  // Common animation configs
  configs: {
    fadeIn: {
      duration: 250,
      easing: 'ease-out',
    },
    slideIn: {
      duration: 300,
      easing: 'ease-out',
    },
    bounce: {
      duration: 400,
      easing: 'spring',
    },
  },
};

/**
 * 🎨 Component Theme Configurations
 */
export const ComponentThemes = {
  // Button themes
  Button: {
    primary: {
      backgroundColor: Colors.primary[500],
      color: Colors.text.inverse,
      borderRadius: BorderRadius.components.button,
      paddingVertical: Spacing.components.buttonPadding.vertical,
      paddingHorizontal: Spacing.components.buttonPadding.horizontal,
      ...Shadows.sm,
    },
    secondary: {
      backgroundColor: Colors.secondary[500],
      color: Colors.text.inverse,
      borderRadius: BorderRadius.components.button,
      paddingVertical: Spacing.components.buttonPadding.vertical,
      paddingHorizontal: Spacing.components.buttonPadding.horizontal,
      ...Shadows.sm,
    },
    outline: {
      backgroundColor: 'transparent',
      color: Colors.primary[500],
      borderColor: Colors.primary[500],
      borderWidth: 1,
      borderRadius: BorderRadius.components.button,
      paddingVertical: Spacing.components.buttonPadding.vertical,
      paddingHorizontal: Spacing.components.buttonPadding.horizontal,
    },
  },
  
  // Card themes
  Card: {
    default: {
      backgroundColor: Colors.background.paper,
      borderRadius: BorderRadius.components.card,
      padding: Spacing.components.cardPadding,
      ...Shadows.md,
    },
    elevated: {
      backgroundColor: Colors.background.paper,
      borderRadius: BorderRadius.components.card,
      padding: Spacing.components.cardPadding,
      ...Shadows.lg,
    },
  },
  
  // Input themes
  Input: {
    default: {
      backgroundColor: Colors.background.secondary,
      borderColor: Colors.border.light,
      borderWidth: 1,
      borderRadius: BorderRadius.components.input,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: Typography.fontSize.base,
      color: Colors.text.primary,
    },
    focused: {
      borderColor: Colors.primary[500],
      borderWidth: 2,
    },
    error: {
      borderColor: Colors.semantic.error,
      borderWidth: 1,
    },
  },
};

/**
 * 🌙 Dark Theme Support
 */
export const DarkTheme = {
  colors: {
    ...Colors,
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2C2C2C',
      paper: '#1E1E1E',
      disabled: '#3C3C3C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#666666',
      hint: '#8C8C8C',
      inverse: '#000000',
    },
  },
};

/**
 * 🎯 Theme Provider Interface
 */
export interface ThemeInterface {
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  layout: typeof Layout;
  animation: typeof Animation;
  components: typeof ComponentThemes;
  isDark: boolean;
}

/**
 * 🌟 Default Light Theme
 */
export const LightTheme: ThemeInterface = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,
  animation: Animation,
  components: ComponentThemes,
  isDark: false,
};

/**
 * 🌙 Default Dark Theme
 */
export const DefaultDarkTheme: ThemeInterface = {
  ...LightTheme,
  colors: DarkTheme.colors,
  isDark: true,
};

export default LightTheme;