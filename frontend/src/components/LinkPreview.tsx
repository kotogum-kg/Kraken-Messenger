/**
 * Link Preview Component
 * Displays rich preview cards for URLs
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { api } from '../services/api';

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

interface LinkPreviewProps {
  url: string;
  compact?: boolean;
}

const CACHE_KEY_PREFIX = 'link_preview_';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

export function LinkPreview({ url, compact = false }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPreview();
  }, [url]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(false);

      // Check cache first
      const cacheKey = CACHE_KEY_PREFIX + encodeURIComponent(url);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setPreview(data);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const data = await api.getLinkPreview(url);
      
      if (data && data.title) {
        setPreview(data);
        // Cache the result
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } else {
        setError(true);
      }
    } catch (e) {
      console.error('Error loading link preview:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <ActivityIndicator size="small" color={COLORS.neonBlue} />
      </View>
    );
  }

  if (error || !preview) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.containerCompact]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {preview.image && !compact && (
        <ExpoImage
          source={{ uri: preview.image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          {preview.favicon && (
            <ExpoImage
              source={{ uri: preview.favicon }}
              style={styles.favicon}
              contentFit="contain"
            />
          )}
          <Text style={styles.siteName} numberOfLines={1}>
            {preview.siteName || new URL(url).hostname}
          </Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {preview.title}
        </Text>
        
        {preview.description && !compact && (
          <Text style={styles.description} numberOfLines={3}>
            {preview.description}
          </Text>
        )}
        
        <View style={styles.urlRow}>
          <Ionicons name="link" size={12} color={COLORS.textDim} />
          <Text style={styles.urlText} numberOfLines={1}>
            {new URL(url).hostname}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Utility to extract first URL from text
export function extractFirstUrl(text: string): string | null {
  const urlPattern = /https?:\/\/[^\s<>"]+/g;
  const matches = text.match(urlPattern);
  return matches ? matches[0] : null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  favicon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  siteName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  urlText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginLeft: SPACING.xs,
  },
});
