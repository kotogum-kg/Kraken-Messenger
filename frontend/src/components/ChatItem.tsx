/**
 * Chat item component
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ChatItemProps {
  chat: Chat;
  onPress: (chat: Chat) => void;
  onLongPress?: (chat: Chat) => void;
  showHideOption?: boolean;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, onPress, onLongPress, showHideOption = true }) => {
  const handleLongPress = () => {
    if (chat.isPinned) {
      Alert.alert(
        'Закреплённый канал',
        'Этот канал нельзя удалить или скрыть',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (onLongPress && showHideOption) {
      onLongPress(chat);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Сейчас';
    if (diffMins < 60) return `${diffMins}м`;
    if (diffHours < 24) return `${diffHours}ч`;
    if (diffDays < 7) return `${diffDays}д`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getIcon = () => {
    if (chat.isPinned) return 'megaphone';
    if (chat.type === 'group') return 'people';
    return 'person';
  };

  return (
    <TouchableOpacity
      style={[styles.container, chat.isPinned && styles.pinnedContainer]}
      onPress={() => onPress(chat)}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, chat.isPinned && styles.pinnedAvatar]}>
        <Ionicons 
          name={getIcon()} 
          size={24} 
          color={chat.isPinned ? COLORS.neonBlue : COLORS.textSecondary} 
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, chat.isPinned && styles.pinnedTitle]} numberOfLines={1}>
              {chat.title}
            </Text>
            {chat.isPinned && (
              <Ionicons name="pin" size={14} color={COLORS.neonBlue} style={styles.pinIcon} />
            )}
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(chat.timestamp)}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unreadCount && chat.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinnedContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderColor: COLORS.neonBlueDim,
    borderWidth: 1.5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  pinnedAvatar: {
    backgroundColor: COLORS.neonBlue + '20',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pinnedTitle: {
    color: COLORS.neonBlue,
  },
  pinIcon: {
    marginLeft: SPACING.xs,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginLeft: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.neonBlue,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  unreadText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.background,
  },
});
