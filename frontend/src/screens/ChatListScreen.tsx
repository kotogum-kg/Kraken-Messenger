/**
 * Chat List Screen - Main screen showing all visible chats
 * Now connected to real Telegram API
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatItem } from '../components/ChatItem';
import { useChats } from '../hooks/useChats';
import { useTelegram } from '../context/TelegramContext';
import { Chat } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function ChatListScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, accountId, user } = useTelegram();
  const { visibleChats, loading, error, hideChat, reload } = useChats(accountId);
  const [refreshing, setRefreshing] = useState(false);

  // Debug logging
  console.log('[ChatListScreen] Auth:', isAuthenticated, 'AccountId:', accountId, 'Chats:', visibleChats.length);

  const handleChatPress = (chat: Chat) => {
    // Если это канал Kraken News, открываем Telegram
    if (chat.id === 'kraken_news') {
      const telegramUrl = 'https://t.me/+GsJRkVsUS6U5OTc5';
      
      Linking.canOpenURL(telegramUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(telegramUrl);
          } else {
            Alert.alert(
              'Kraken News',
              'Подпишитесь на наш Telegram канал: https://t.me/+GsJRkVsUS6U5OTc5',
              [
                { text: 'Копировать ссылку', onPress: () => {
                  if (Platform.OS === 'web') {
                    navigator.clipboard.writeText(telegramUrl);
                  }
                }},
                { text: 'Закрыть', style: 'cancel' }
              ]
            );
          }
        })
        .catch((err) => {
          console.error('Error opening Telegram:', err);
          Alert.alert('Ошибка', 'Не удалось открыть Telegram канал');
        });
      return;
    }
    
    // Для обычных чатов открываем экран чата
    // @ts-ignore - dynamic route
    router.push(`/chat/${chat.id}`);
  };

  const handleChatLongPress = (chat: Chat) => {
    if (chat.isPinned || chat.id === 'kraken_news') {
      return;
    }

    Alert.alert(
      'Скрыть чат',
      `Скрыть чат с "${chat.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Скрыть',
          style: 'destructive',
          onPress: async () => {
            const success = await hideChat(chat.id);
            if (success) {
              Alert.alert('Чат скрыт', 'Чат перемещён в скрытые');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleSettingsPress = () => {
    // @ts-ignore
    router.push('/settings');
  };

  const handleLoginPress = () => {
    // @ts-ignore
    router.push('/telegram-login');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.neonBlue} />
        <Text style={styles.loadingText}>Проверка сессии...</Text>
      </View>
    );
  }

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
        <View style={styles.loadingChats}>
          <ActivityIndicator size="small" color={COLORS.neonBlue} />
          <Text style={styles.loadingChatsText}>Загрузка чатов...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.neonBlue}
              colors={[COLORS.neonBlue]}
            />
          }
        >
          {visibleChats.length > 0 ? (
            visibleChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                onPress={handleChatPress}
                onLongPress={handleChatLongPress}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textDim} />
              <Text style={styles.emptyText}>Нет чатов</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          key={`chat-list-${visibleChats.length}`}
          data={visibleChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem
              chat={item}
              onPress={handleChatPress}
              onLongPress={handleChatLongPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={false}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={5}
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
              <Text style={styles.emptyText}>Нет чатов</Text>
            </View>
          }
        />
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
    backgroundColor: COLORS.background,
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
  loadingChats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingChatsText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
  },
  listContent: {
    paddingVertical: SPACING.sm,
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
