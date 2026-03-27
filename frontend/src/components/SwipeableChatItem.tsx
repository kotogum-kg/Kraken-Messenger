/**
 * Swipeable Chat Item Component
 * With swipe actions: delete, hide, pin, mark as read
 */
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Chat, ChatType } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

interface SwipeableChatItemProps {
  chat: Chat;
  onPress: () => void;
  onDelete?: () => void;
  onHide?: () => void;
  onPin?: () => void;
  onMarkRead?: () => void;
}

export function SwipeableChatItem({
  chat,
  onPress,
  onDelete,
  onHide,
  onPin,
  onMarkRead,
}: SwipeableChatItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isSwipedLeft = useRef(false);
  const isSwipedRight = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -160));
        } else {
          translateX.setValue(Math.min(gestureState.dx, 80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - show actions
          Animated.spring(translateX, {
            toValue: -160,
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

  return (
    <View style={styles.container}>
      {/* Right actions */}
      <View style={styles.actionsRight}>
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
            <View style={[styles.avatar, chat.type === 'channel' && styles.avatarChannel]}>
              <Ionicons name={getChatIcon(chat.type)} size={24} color={COLORS.neonBlue} />
            </View>
            {chat.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                {chat.isPinned && (
                  <Ionicons name="pin" size={14} color={COLORS.neonBlue} style={styles.pinIcon} />
                )}
                {chat.isMuted && (
                  <Ionicons name="volume-mute" size={14} color={COLORS.textDim} style={styles.muteIcon} />
                )}
                <Text style={styles.title} numberOfLines={1}>{chat.title}</Text>
              </View>
              <Text style={styles.time}>{formatTime(chat.timestamp)}</Text>
            </View>
            <View style={styles.messageRow}>
              <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
              {chat.unreadCount > 0 && (
                <View style={[styles.badge, chat.isMuted && styles.badgeMuted]}>
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
    width: 53,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChannel: {
    backgroundColor: 'rgba(0, 242, 255, 0.15)',
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
