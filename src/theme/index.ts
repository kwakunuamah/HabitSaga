export const colors = {
    // Core colors  
    primary: '#E23636', // Comic Book Red (Vibrant)
    primaryDark: '#B91C1C', // Darker Red for interactions
    accent: '#F59E0B', // Amber 500 (Kept as accent)
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    error: '#EF4444', // Red 500
    surface: '#FFFFFF', // White Panels
    surfaceHighlight: '#F3F4F6', // Light Gray
    // Flat colors for backward compatibility
    background: '#F9F7F1', // Comic Book Paper (Tan/Off-white)
    backgroundElevated: '#FFFFFF', // White
    border: '#1A1A1A', // Ink Black (High contrast border)
    textPrimary: '#1A1A1A', // Ink Black
    textSecondary: '#4B5563', // Gray 600
    // Nested structure for terms-of-service and subscription-terms
    text: {
        primary: '#1A1A1A', // Ink Black
        secondary: '#4B5563', // Gray 600
        tertiary: '#9CA3AF', // Gray 400
    },
} as {
    [key: string]: any;
};

export const spacing = {
    // Short names (backward compatibility)
    xs: 4,
    s: 8,
    sm: 8,
    m: 12,
    md: 12,
    l: 16,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const borderRadius = {
    s: 4,
    m: 8,
    l: 12,
    full: 9999,
};

export const typography = {
    // Predefined text styles
    headingXL: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: colors.textPrimary,
    },
    headingL: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: colors.textPrimary,
    },
    headingM: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: colors.textPrimary,
    },
    headingS: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: colors.textPrimary,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: colors.textPrimary,
        lineHeight: 20,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: colors.textSecondary,
    },
    // Granular size and weight controls
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
    weights: {
        light: '300' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        black: '900' as const,
    },
};

export const theme = {
    colors,
    spacing,
    borderRadius,
    typography,
};
