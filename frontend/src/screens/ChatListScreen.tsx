/**
 * Chat List Screen - Main screen showing all visible chats
 * With filter tabs, swipe actions, and modern UI
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ScrollView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SwipeableChatItem } from '../components/SwipeableChatItem';
import { ChatListSkeleton } from '../components/SkeletonLoader';
import { useChats } from '../hooks/useChats';
import { useTelegram } from '../context/TelegramContext';
import { useChatFolders } from '../hooks/useChatFolders';
import { Chat, ChatType } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

// Filter tabs
const FILTER_TABS = [
  { id: 'all', label: 'Все', icon: 'chatbubbles' },
  { id: 'private', label: 'Личные', icon: 'person' },
  { id: 'groups', label: 'Группы', icon: 'people' },
  { id: 'channels', label: 'Каналы', icon: 'megaphone' },
  { id: 'bots', label: 'Боты', icon: 'hardware-chip' },
];

export default function ChatListScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, accountId, user } = useTelegram();
  const { visibleChats, loading, error, hideChat, reload } = useChats(accountId);
  const { activeFilter, setActiveFilter, filterChats } = useChatFolders();
  const [refreshing, setRefreshing] = useState(false);

  // Filter chats based on active tab
  const filteredChats = useMemo(() => {
    return filterChats(visibleChats, activeFilter);
  }, [visibleChats, activeFilter, filterChats]);

  const handleChatPress = (chat: Chat) => {
    // Kraken News - open channel feed
    if (chat.id === 'kraken_news') {
      router.push('/channel/kraken_news');
      return;
    }
    
    // Regular chat
    router.push(`/chat/${chat.id}`);
  };

  const handleChatDelete = (chatId: string) => {
    Alert.alert(
      'Удалить чат',
      'Чат будет удалён из списка',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => hideChat(chatId) },
      ]
    );
  };

  const handleChatHide = async (chatId: string) => {
    const success = await hideChat(chatId);
    if (success) {
      Alert.alert('Готово', 'Чат скрыт. Найти его можно в скрытых чатах.');
    }
  };

  const handleChatPin = (chatId: string) => {
    Alert.alert('Закрепить', 'Функция закрепления в разработке');
  };

  const handleChatMarkRead = (chatId: string) => {
    Alert.alert('Прочитано', 'Чат отмечен как прочитанный');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const handleLoginPress = () => {
    router.push('/telegram-login');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.neonBlue} />
          <Text style={styles.loadingText}>Проверка сессии...</Text>
        </View>
      </View>
    );
  }

  const renderChatItem = ({ item }: { item: Chat }) => (
    <SwipeableChatItem
      chat={item}
      onPress={() => handleChatPress(item)}
      onDelete={item.isPinned ? undefined : () => handleChatDelete(item.id)}
      onHide={item.isPinned ? undefined : () => handleChatHide(item.id)}
      onPin={() => handleChatPin(item.id)}
      onMarkRead={() => handleChatMarkRead(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={28} color={COLORS.neonBlue} />
          <Text style={styles.headerTitle}>Kraken</Text>
        </View>
        <View style={styles.headerRight}>
          {!isAuthenticated && (
            <TouchableOpacity onPress={handleLoginPress} style={styles.loginButton}>
              <Ionicons name="log-in-outline" size={22} color={COLORS.neonBlue} />
              <Text style={styles.loginButtonText}>Войти</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* User info banner */}
      {isAuthenticated && user && (
        <View style={styles.userBanner}>
          <Ionicons name="person-circle" size={24} color={COLORS.neonBlue} />
          <Text style={styles.userName}>
            {user.first_name} {user.last_name || ''}
          </Text>
          <Text style={styles.userPhone}>+{user.phone}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeFilter === tab.id && styles.tabActive,
              ]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeFilter === tab.id ? COLORS.neonBlue : COLORS.textSecondary} 
              />
              <Text style={[
                styles.tabLabel,
                activeFilter === tab.id && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <TouchableOpacity style={styles.loginPrompt} onPress={handleLoginPress}>
          <Ionicons name="paper-plane" size={32} color={COLORS.neonBlue} />
          <View style={styles.loginPromptText}>
            <Text style={styles.loginPromptTitle}>Войдите в Telegram</Text>
            <Text style={styles.loginPromptSubtitle}>Чтобы видеть свои чаты</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Chat List */}
      {loading && !refreshing ? (
        <ChatListSkeleton count={8} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={72}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.neonBlue}
                colors={[COLORS.neonBlue]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textDim} />
                <Text style={styles.emptyText}>
                  {activeFilter === 'all' ? 'Нет чатов' : 'Нет чатов в этой категории'}
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl + 10,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 242, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  loginButtonText: {
    color: COLORS.neonBlue,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0, 242, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  userPhone: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.sm,
  },
  tabsContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundCard,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 242, 255, 0.15)',
  },
  tabLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  tabLabelActive: {
    color: COLORS.neonBlue,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neonBlue,
  },
  loginPromptText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  loginPromptTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  loginPromptSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    marginTop: SPACING.md,
  },
});
