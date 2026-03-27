/**
 * Swipeable Chat Item Component
 * With swipe actions: delete, hide, pin, mark as read, mute
 * Displays avatar images
 */
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Chat, ChatType } from '../types';
import { MuteService, MUTE_DURATIONS } from '../services/muteService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

interface SwipeableChatItemProps {
  chat: Chat;
  onPress: () => void;
  onDelete?: () => void;
  onHide?: () => void;
  onPin?: () => void;
  onMarkRead?: () => void;
  onMuteChange?: (muted: boolean) => void;
}

// Generate avatar color based on chat title
function getAvatarColor(title: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from title
function getInitials(title: string): string {
  const words = title.trim().split(' ').filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return title.substring(0, 2).toUpperCase();
}

export function SwipeableChatItem({
  chat,
  onPress,
  onDelete,
  onHide,
  onPin,
  onMarkRead,
  onMuteChange,
}: SwipeableChatItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isSwipedLeft = useRef(false);
  const [isMuted, setIsMuted] = useState(chat.isMuted || false);

  useEffect(() => {
    // Check mute status on mount
    MuteService.isMuted(chat.id).then(setIsMuted);
  }, [chat.id]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -200));
        } else {
          translateX.setValue(Math.min(gestureState.dx, 80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - show actions
          Animated.spring(translateX, {
            toValue: -200,
            useNativeDriver: true,
          }).start();
          isSwipedLeft.current = true;
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - mark as read
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          onMarkRead?.();
        } else {
          // Reset
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          isSwipedLeft.current = false;
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    isSwipedLeft.current = false;
  };

  const handleMutePress = () => {
    Alert.alert(
      isMuted ? 'Включить уведомления' : 'Отключить уведомления',
      isMuted ? 'Включить уведомления для этого чата?' : 'На какое время отключить уведомления?',
      isMuted ? [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Включить',
          onPress: async () => {
            await MuteService.unmuteChat(chat.id);
            setIsMuted(false);
            onMuteChange?.(false);
            closeSwipe();
          },
        },
      ] : [
        { text: 'Отмена', style: 'cancel' },
        {
          text: '1 час',
          onPress: async () => {
            await MuteService.muteChat(chat.id, MUTE_DURATIONS['1_HOUR']);
            setIsMuted(true);
            onMuteChange?.(true);
            closeSwipe();
          },
        },
        {
          text: '8 часов',
          onPress: async () => {
            await MuteService.muteChat(chat.id, MUTE_DURATIONS['8_HOURS']);
            setIsMuted(true);
            onMuteChange?.(true);
            closeSwipe();
          },
        },
        {
          text: 'Навсегда',
          onPress: async () => {
            await MuteService.muteChat(chat.id, MUTE_DURATIONS['FOREVER']);
            setIsMuted(true);
            onMuteChange?.(true);
            closeSwipe();
          },
        },
      ]
    );
  };

  const getChatIcon = (type: ChatType) => {
    switch (type) {
      case 'channel':
        return 'megaphone';
      case 'bot':
        return 'hardware-chip';
      case 'supergroup':
        return 'star';
      case 'group':
        return 'people';
      default:
        return 'person';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const avatarColor = getAvatarColor(chat.title);
  const initials = getInitials(chat.title);

  return (
    <View style={styles.container}>
      {/* Right actions */}
      <View style={styles.actionsRight}>
        <TouchableOpacity
          style={[styles.action, styles.actionMute]}
          onPress={handleMutePress}
        >
          <Ionicons 
            name={isMuted ? 'volume-high' : 'volume-mute'} 
            size={22} 
            color="#fff" 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, styles.actionPin]}
          onPress={() => { onPin?.(); closeSwipe(); }}
        >
          <Ionicons name={chat.isPinned ? 'pin-outline' : 'pin'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, styles.actionHide]}
          onPress={() => { onHide?.(); closeSwipe(); }}
        >
          <Ionicons name="eye-off" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.action, styles.actionDelete]}
          onPress={() => { onDelete?.(); closeSwipe(); }}
        >
          <Ionicons name="trash" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Chat item */}
      <Animated.View
        style={[styles.chatItem, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {chat.avatar ? (
              <ExpoImage
                source={{ uri: chat.avatar }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                {chat.type === 'channel' || chat.type === 'group' || chat.type === 'supergroup' ? (
                  <Ionicons name={getChatIcon(chat.type)} size={24} color="#fff" />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
            )}
            {chat.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                {chat.isPinned && (
                  <Ionicons name="pin" size={14} color={COLORS.neonBlue} style={styles.pinIcon} />
                )}
                {isMuted && (
                  <Ionicons name="volume-mute" size={14} color={COLORS.textDim} style={styles.muteIcon} />
                )}
                <Text style={styles.title} numberOfLines={1}>{chat.title}</Text>
              </View>
              <Text style={styles.time}>{formatTime(chat.timestamp)}</Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
              {chat.unreadCount > 0 && (
                <View style={[styles.badge, isMuted && styles.badgeMuted]}>
                  <Text style={styles.badgeText}>
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  actionsRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMute: {
    backgroundColor: '#7B68EE',
  },
  actionPin: {
    backgroundColor: COLORS.neonBlue,
  },
  actionHide: {
    backgroundColor: COLORS.warning,
  },
  actionDelete: {
    backgroundColor: COLORS.error,
  },
  chatItem: {
    backgroundColor: COLORS.background,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  pinIcon: {
    marginRight: 4,
  },
  muteIcon: {
    marginRight: 4,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.neonBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeMuted: {
    backgroundColor: COLORS.textDim,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.background,
  },
});
