/**
 * Chat Folder Management
 * Hook for managing chat folders and filtering
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, ChatFolder, ChatType } from '../types';

const FOLDERS_STORAGE_KEY = 'kraken_chat_folders';

// Default folders
const DEFAULT_FOLDERS: ChatFolder[] = [
  { id: 'all', name: 'Все', icon: 'chatbubbles', chatIds: [] },
  { id: 'private', name: 'Личные', icon: 'person', chatIds: [] },
  { id: 'groups', name: 'Группы', icon: 'people', chatIds: [] },
  { id: 'channels', name: 'Каналы', icon: 'megaphone', chatIds: [] },
  { id: 'bots', name: 'Боты', icon: 'hardware-chip', chatIds: [] },
];

export function useChatFolders() {
  const [folders, setFolders] = useState<ChatFolder[]>(DEFAULT_FOLDERS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [customFolders, setCustomFolders] = useState<ChatFolder[]>([]);

  // Load custom folders from storage
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const saved = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomFolders(parsed);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const saveFolders = async (newFolders: ChatFolder[]) => {
    try {
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(newFolders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  };

  // All folders combined
  const allFolders = useMemo(() => {
    return [...DEFAULT_FOLDERS, ...customFolders];
  }, [customFolders]);

  // Filter chats by folder/type
  const filterChats = useCallback((chats: Chat[], filterId: string): Chat[] => {
    if (filterId === 'all') return chats;

    // Check if it's a type filter
    const typeFilters: Record<string, ChatType[]> = {
      'private': ['private'],
      'groups': ['group', 'supergroup'],
      'channels': ['channel'],
      'bots': ['bot'],
    };

    if (typeFilters[filterId]) {
      return chats.filter(chat => typeFilters[filterId].includes(chat.type));
    }

    // Check custom folder
    const customFolder = customFolders.find(f => f.id === filterId);
    if (customFolder) {
      return chats.filter(chat => customFolder.chatIds.includes(chat.id));
    }

    return chats;
  }, [customFolders]);

  // Create custom folder
  const createFolder = async (name: string, icon: string, color?: string) => {
    const newFolder: ChatFolder = {
      id: `custom_${Date.now()}`,
      name,
      icon,
      chatIds: [],
      color,
    };
    const updated = [...customFolders, newFolder];
    setCustomFolders(updated);
    await saveFolders(updated);
    return newFolder;
  };

  // Delete custom folder
  const deleteFolder = async (folderId: string) => {
    const updated = customFolders.filter(f => f.id !== folderId);
    setCustomFolders(updated);
    await saveFolders(updated);
    if (activeFilter === folderId) {
      setActiveFilter('all');
    }
  };

  // Add chat to folder
  const addChatToFolder = async (chatId: string, folderId: string) => {
    const updated = customFolders.map(folder => {
      if (folder.id === folderId && !folder.chatIds.includes(chatId)) {
        return { ...folder, chatIds: [...folder.chatIds, chatId] };
      }
      return folder;
    });
    setCustomFolders(updated);
    await saveFolders(updated);
  };

  // Remove chat from folder
  const removeChatFromFolder = async (chatId: string, folderId: string) => {
    const updated = customFolders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, chatIds: folder.chatIds.filter(id => id !== chatId) };
      }
      return folder;
    });
    setCustomFolders(updated);
    await saveFolders(updated);
  };

  // Get folder for chat
  const getChatFolders = (chatId: string): ChatFolder[] => {
    return customFolders.filter(f => f.chatIds.includes(chatId));
  };

  return {
    folders: allFolders,
    customFolders,
    activeFilter,
    setActiveFilter,
    filterChats,
    createFolder,
    deleteFolder,
    addChatToFolder,
    removeChatFromFolder,
    getChatFolders,
  };
}
