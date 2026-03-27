/**
 * Chat List Screen - Main screen showing all visible chats
 */
import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatItem } from '../components/ChatItem';
import { useChats } from '../hooks/useChats';
import { Chat } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function ChatListScreen() {
  const router = useRouter();
  const { visibleChats, loading, hideChat, reload } = useChats();
  const [refreshing, setRefreshing] = useState(false);
  const [, forceUpdate] = useState({});

  // Debug logging
  console.log('[ChatListScreen] Render - visibleChats:', visibleChats.length, 'loading:', loading);

  // Force re-render when visibleChats changes
  React.useEffect(() => {
    console.log('[ChatListScreen] useEffect - visibleChats changed:', visibleChats.length);
    forceUpdate({});
  }, [visibleChats.length]);

  const handleChatPress = (chat: Chat) => {
    // @ts-ignore - dynamic route
    router.push(`/chat/${chat.id}`);
  };

  const handleChatLongPress = (chat: Chat) => {
    if (chat.isPinned) {
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={28} color={COLORS.neonBlue} />
          <Text style={styles.headerTitle}>Kraken Messenger</Text>
        </View>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {Platform.OS === 'web' ? (
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
  settingsButton: {
    padding: SPACING.sm,
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
