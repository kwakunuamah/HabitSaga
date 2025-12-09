/**
 * CachedImage Component
 * 
 * Uses expo-image for built-in disk caching of panel images.
 * Best for historical chapter panels in saga timeline - not for newly generated images.
 * 
 * Benefits:
 * - Automatic disk caching (survives app restarts)
 * - Placeholder during loading
 * - Fade-in transition
 * - Memory-efficient
 */

import React from 'react';
import { Image, ImageProps, ImageContentFit } from 'expo-image';
import { StyleSheet, View, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { colors } from '../theme';

interface CachedImageProps {
    /** The image URL to display */
    uri: string | null | undefined;
    /** Image style */
    style?: StyleProp<ImageStyle>;
    /** Container style */
    containerStyle?: StyleProp<ViewStyle>;
    /** How the image should be resized to fit its container */
    contentFit?: ImageContentFit;
    /** Placeholder blur hash (optional) */
    placeholder?: string;
    /** Alt text for accessibility */
    alt?: string;
    /** Border radius for the image */
    borderRadius?: number;
}

// Cache policy: use disk cache for best performance on historical images
const CACHE_POLICY = 'disk';

// Default placeholder - subtle gradient
const DEFAULT_PLACEHOLDER = { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' };

export function CachedImage({
    uri,
    style,
    containerStyle,
    contentFit = 'cover',
    placeholder,
    alt,
    borderRadius = 0,
}: CachedImageProps) {
    // Handle missing or invalid URIs
    if (!uri) {
        return (
            <View style={[styles.placeholder, containerStyle, { borderRadius }]}>
                <View style={styles.placeholderInner} />
            </View>
        );
    }

    return (
        <View style={containerStyle}>
            <Image
                source={{ uri }}
                style={[styles.image, style, { borderRadius }]}
                contentFit={contentFit}
                placeholder={placeholder ? { blurhash: placeholder } : DEFAULT_PLACEHOLDER}
                cachePolicy={CACHE_POLICY}
                transition={200}
                accessible={!!alt}
                accessibilityLabel={alt}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.primary,
        opacity: 0.5,
    },
});

export default CachedImage;
