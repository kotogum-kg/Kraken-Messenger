/**
 * AsyncStorage utilities for chat data management
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat } from '../types';

const CHATS_KEY = 'kraken_chats';
const HIDDEN_CHATS_KEY = 'kraken_hidden_chats';

/**
 * Get all chats from storage
 */
export const getChats = async (): Promise<Chat[]> => {
  try {
    const data = await AsyncStorage.getItem(CHATS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting chats:', error);
    return [];
  }
};

/**
 * Save chats to storage
 */
export const saveChats = async (chats: Chat[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats:', error);
  }
};

/**
 * Get hidden chat IDs
 */
export const getHiddenChatIds = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(HIDDEN_CHATS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting hidden chats:', error);
    return [];
  }
};

/**
 * Save hidden chat IDs
 */
export const saveHiddenChatIds = async (chatIds: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HIDDEN_CHATS_KEY, JSON.stringify(chatIds));
  } catch (error) {
    console.error('Error saving hidden chats:', error);
  }
};

/**
 * Hide a chat
 */
export const hideChat = async (chatId: string): Promise<void> => {
  const hiddenIds = await getHiddenChatIds();
  if (!hiddenIds.includes(chatId)) {
    await saveHiddenChatIds([...hiddenIds, chatId]);
  }
};

/**
 * Unhide a chat
 */
export const unhideChat = async (chatId: string): Promise<void> => {
  const hiddenIds = await getHiddenChatIds();
  await saveHiddenChatIds(hiddenIds.filter(id => id !== chatId));
};

/**
 * Wipe all user data (security feature)
 */
export const wipeAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHATS_KEY);
    await AsyncStorage.removeItem(HIDDEN_CHATS_KEY);
  } catch (error) {
    console.error('Error wiping data:', error);
  }
};

/**
 * Clear all data (for testing/reset)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
