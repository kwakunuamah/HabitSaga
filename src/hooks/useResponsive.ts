import { useWindowDimensions } from 'react-native';

/**
 * Responsive utilities hook for tablet and desktop optimizations.
 * 
 * Breakpoints:
 * - Phone: < 768px
 * - Tablet: 768px - 1023px
 * - Large Tablet/Desktop: >= 1024px
 * 
 * Usage:
 *   const { isTablet, fontScale, spacingMultiplier, maxContentWidth } = useResponsive();
 */
export const useResponsive = () => {
    const { width, height } = useWindowDimensions();

    // Breakpoint detection
    const isTablet = width >= 768;
    const isLargeTablet = width >= 1024;

    // Dynamic scaling factors for tablets
    const spacingMultiplier = isTablet ? 1.5 : 1;
    const fontScale = isTablet ? 1.15 : 1;

    // Maximum content width for centered layouts on large screens
    const maxContentWidth = isLargeTablet ? 720 : isTablet ? 600 : undefined;

    // Responsive padding for different screen sizes
    const horizontalPadding = isLargeTablet ? 64 : isTablet ? 40 : 16;

    return {
        width,
        height,
        isTablet,
        isLargeTablet,
        spacingMultiplier,
        fontScale,
        maxContentWidth,
        horizontalPadding,
    };
};
