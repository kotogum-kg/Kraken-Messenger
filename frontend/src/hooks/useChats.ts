/**
 * Custom hook for managing chats
 * Now fetches real chats from Telegram API
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Chat } from '../types';
import { api } from '../services/api';
import { getHiddenChatIds, hideChat as hideChatStorage, unhideChat as unhideChatStorage } from '../utils/storage';

// Kraken News channel - always pinned
const KRAKEN_NEWS_CHAT: Chat = {
  id: 'kraken_news',
  title: 'Kraken News',
  lastMessage: 'Официальный канал Kraken Messenger',
  timestamp: Date.now(),
  isHidden: false,
  isPinned: true,
  unreadCount: 0,
  type: 'channel',
};

export const useChats = (accountId: string | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [hiddenChatIds, setHiddenChatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chats from Telegram API
  const loadChats = useCallback(async () => {
    if (!accountId) {
      console.log('[useChats] No accountId, showing only Kraken News');
      setChats([KRAKEN_NEWS_CHAT]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[useChats] Loading chats for account:', accountId);

      const response = await api.getChats(accountId, 100);
      const hidden = await getHiddenChatIds();
      
      // Transform Telegram chats to our format
      const telegramChats: Chat[] = response.chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        lastMessage: chat.last_message || '',
        timestamp: chat.last_message_date ? new Date(chat.last_message_date).getTime() : Date.now(),
        isHidden: hidden.includes(chat.id),
        isPinned: chat.is_pinned,
        unreadCount: chat.unread_count,
        type: chat.type === 'supergroup' ? 'group' : chat.type,
      }));

      // Add Kraken News at the top
      const allChats = [KRAKEN_NEWS_CHAT, ...telegramChats];
      
      console.log('[useChats] Loaded', telegramChats.length, 'chats from Telegram');
      
      setChats(allChats);
      setHiddenChatIds(hidden);
    } catch (err: any) {
      console.error('[useChats] Error loading chats:', err);
      setError(err.message || 'Ошибка загрузки чатов');
      // Show only Kraken News on error
      setChats([KRAKEN_NEWS_CHAT]);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Get visible chats (not hidden) - memoized
  const visibleChats = useMemo(
    () => chats.filter(chat => !hiddenChatIds.includes(chat.id)),
    [chats, hiddenChatIds]
  );

  // Get hidden chats - memoized
  const hiddenChats = useMemo(
    () => chats.filter(chat => hiddenChatIds.includes(chat.id)),
    [chats, hiddenChatIds]
  );

  // Hide a chat
  const hideChat = async (chatId: string) => {
    // Prevent hiding the pinned channel
    const chat = chats.find(c => c.id === chatId);
    if (chat?.isPinned) {
      return false;
    }
    
    await hideChatStorage(chatId);
    setHiddenChatIds(prev => [...prev, chatId]);
    return true;
  };

  // Unhide a chat
  const unhideChat = async (chatId: string) => {
    await unhideChatStorage(chatId);
    setHiddenChatIds(prev => prev.filter(id => id !== chatId));
  };

  return {
    chats,
    visibleChats,
    hiddenChats,
    loading,
    error,
    hideChat,
    unhideChat,
    reload: loadChats,
  };
};
