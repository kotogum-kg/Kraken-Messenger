/**
 * Skeleton Loader Components
 * For loading states
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// Chat item skeleton
export function ChatItemSkeleton() {
  return (
    <View style={styles.chatItem}>
      <Skeleton width={50} height={50} borderRadius={25} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Skeleton width={120} height={16} />
          <Skeleton width={40} height={12} />
        </View>
        <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// Message skeleton
export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <View style={[styles.message, isOwn && styles.messageOwn]}>
      <Skeleton 
        width={isOwn ? 180 : 220} 
        height={60} 
        borderRadius={BORDER_RADIUS.lg} 
      />
    </View>
  );
}

// Post skeleton
export function PostSkeleton() {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ marginLeft: SPACING.md, flex: 1 }}>
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width="100%" height={16} style={{ marginTop: SPACING.md }} />
      <Skeleton width="70%" height={16} style={{ marginTop: 4 }} />
      <Skeleton width="100%" height={200} style={{ marginTop: SPACING.md }} borderRadius={BORDER_RADIUS.lg} />
    </View>
  );
}

// Chat list skeleton
export function ChatListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <ChatItemSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.backgroundCard,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  chatContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    alignSelf: 'flex-start',
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  messageOwn: {
    alignSelf: 'flex-end',
  },
  post: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
