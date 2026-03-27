/**
 * Hidden Chats Screen - Shows hidden chats after PIN authentication
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatItem } from '../components/ChatItem';
import { useChats } from '../hooks/useChats';
import { Chat } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function HiddenChatsScreen() {
  const router = useRouter();
  const { hiddenChats, loading, unhideChat, reload } = useChats();
  const [refreshing, setRefreshing] = useState(false);

  const handleChatPress = (chat: Chat) => {
    // @ts-ignore
    router.push(`/chat/${chat.id}`);
  };

  const handleChatLongPress = (chat: Chat) => {
    Alert.alert(
      'Показать чат',
      `Вернуть чат "${chat.title}" в основной список?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Показать',
          onPress: async () => {
            await unhideChat(chat.id);
            Alert.alert('Чат восстановлен', 'Чат возвращён в основной список');
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Ionicons name="eye-off" size={24} color={COLORS.purple} />
          <Text style={styles.headerTitle}>Скрытые чаты</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="lock-closed" size={16} color={COLORS.purple} />
        <Text style={styles.infoText}>
          Эти чаты защищены PIN-кодом
        </Text>
      </View>

      {/* Hidden Chats List */}
      <FlatList
        data={hiddenChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem
            chat={item}
            onPress={handleChatPress}
            onLongPress={handleChatLongPress}
            showHideOption={false}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.purple}
            colors={[COLORS.purple]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="eye-off-outline" size={64} color={COLORS.textDim} />
            <Text style={styles.emptyText}>Нет скрытых чатов</Text>
            <Text style={styles.emptySubtext}>
              Чтобы скрыть чат, удерживайте его в основном списке
            </Text>
          </View>
        }
      />
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
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl + 10,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple + '20',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.purple + '40',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.purple,
    marginLeft: SPACING.sm,
  },
  listContent: {
    paddingVertical: SPACING.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textDim,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
