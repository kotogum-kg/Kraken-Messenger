/**
 * Custom hook for managing chats
 */
import { useState, useEffect, useCallback } from 'react';
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
      
      // Initialize with mock data if empty
      if (storedChats.length === 0) {
        storedChats = MOCK_CHATS;
        await saveChats(storedChats);
      }
      
      const hidden = await getHiddenChatIds();
      setChats(storedChats);
      setHiddenChatIds(hidden);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Get visible chats (not hidden)
  const visibleChats = chats.filter(chat => !hiddenChatIds.includes(chat.id));

  // Get hidden chats
  const hiddenChats = chats.filter(chat => hiddenChatIds.includes(chat.id));

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
