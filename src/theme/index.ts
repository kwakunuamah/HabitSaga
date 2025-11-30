export const colors = {
    background: '#0f172a', // Slate 900
    backgroundElevated: '#1e293b', // Slate 800
    primary: '#8b5cf6', // Violet 500
    primaryDark: '#7c3aed', // Violet 600
    accent: '#f59e0b', // Amber 500
    textPrimary: '#f8fafc', // Slate 50
    textSecondary: '#94a3b8', // Slate 400
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    border: '#334155', // Slate 700
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
};

export const typography = {
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
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: colors.textSecondary,
    },
};

export const theme = {
    colors,
    spacing,
    typography,
};
