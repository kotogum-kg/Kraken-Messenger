/**
 * Cache Service
 * Handles caching of messages and media
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const MESSAGES_CACHE_PREFIX = 'kraken_messages_';
const MAX_CACHED_MESSAGES = 100;
const MEDIA_CACHE_DIR = FileSystem.cacheDirectory + 'kraken_media/';

// Ensure media cache directory exists
async function ensureMediaCacheDir() {
  const dirInfo = await FileSystem.getInfoAsync(MEDIA_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MEDIA_CACHE_DIR, { intermediates: true });
  }
}

// Cache messages for a chat
export async function cacheMessages(chatId: string, messages: any[]) {
  try {
    const key = MESSAGES_CACHE_PREFIX + chatId;
    const toCache = messages.slice(0, MAX_CACHED_MESSAGES);
    await AsyncStorage.setItem(key, JSON.stringify({
      messages: toCache,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error caching messages:', error);
  }
}

// Get cached messages
export async function getCachedMessages(chatId: string): Promise<any[] | null> {
  try {
    const key = MESSAGES_CACHE_PREFIX + chatId;
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { messages, timestamp } = JSON.parse(cached);
      // Cache valid for 1 hour
      if (Date.now() - timestamp < 3600000) {
        return messages;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached messages:', error);
    return null;
  }
}

// Clear messages cache for a chat
export async function clearMessagesCache(chatId: string) {
  try {
    const key = MESSAGES_CACHE_PREFIX + chatId;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing messages cache:', error);
  }
}

// Cache media file
export async function cacheMediaFile(url: string): Promise<string | null> {
  try {
    await ensureMediaCacheDir();
    
    // Generate filename from URL
    const filename = url.split('/').pop() || `media_${Date.now()}`;
    const localPath = MEDIA_CACHE_DIR + filename;
    
    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      return localPath;
    }
    
    // Download and cache
    const download = await FileSystem.downloadAsync(url, localPath);
    return download.uri;
  } catch (error) {
    console.error('Error caching media:', error);
    return null;
  }
}

// Get cached media file
export async function getCachedMedia(url: string): Promise<string | null> {
  try {
    const filename = url.split('/').pop() || '';
    const localPath = MEDIA_CACHE_DIR + filename;
    
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      return localPath;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Clear all media cache
export async function clearMediaCache() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(MEDIA_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(MEDIA_CACHE_DIR, { idempotent: true });
    }
  } catch (error) {
    console.error('Error clearing media cache:', error);
  }
}

// Get cache size
export async function getCacheSize(): Promise<number> {
  try {
    await ensureMediaCacheDir();
    const files = await FileSystem.readDirectoryAsync(MEDIA_CACHE_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(MEDIA_CACHE_DIR + file);
      if (fileInfo.exists && 'size' in fileInfo) {
        totalSize += fileInfo.size || 0;
      }
    }
    
    return totalSize;
  } catch (error) {
    return 0;
  }
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
