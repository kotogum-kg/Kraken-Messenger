/**
 * Custom hook for managing chats
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Chat } from '../types';
import { MOCK_CHATS } from '../data/mockChats';
import { getChats, saveChats, getHiddenChatIds, hideChat as hideChatStorage, unhideChat as unhideChatStorage } from '../utils/storage';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [hiddenChatIds, setHiddenChatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load chats from storage
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      let storedChats = await getChats();
      
      console.log('[useChats] Loaded chats from storage:', storedChats.length);
      
      // Initialize with mock data if empty
      if (storedChats.length === 0) {
        console.log('[useChats] No chats found, initializing with mock data');
        storedChats = MOCK_CHATS;
        await saveChats(storedChats);
        console.log('[useChats] Saved', storedChats.length, 'chats to storage');
      }
      
      const hidden = await getHiddenChatIds();
      console.log('[useChats] Hidden chats:', hidden.length);
      
      setChats(storedChats);
      setHiddenChatIds(hidden);
    } catch (error) {
      console.error('[useChats] Error loading chats:', error);
      // Fallback to mock data if storage fails
      console.log('[useChats] Using fallback mock data');
      setChats(MOCK_CHATS);
      setHiddenChatIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Get visible chats (not hidden) - memoized for FlatList web compatibility
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
    await loadChats();
    return true;
  };

  // Unhide a chat
  const unhideChat = async (chatId: string) => {
    await unhideChatStorage(chatId);
    await loadChats();
  };

  return {
    chats,
    visibleChats,
    hiddenChats,
    loading,
    hideChat,
    unhideChat,
    reload: loadChats,
  };
};
