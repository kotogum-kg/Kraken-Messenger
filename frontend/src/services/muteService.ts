/**
 * Mute Service
 * Manages muted chats/users/channels/groups
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const MUTED_CHATS_KEY = 'muted_chats';

export interface MutedChat {
  chatId: string;
  mutedAt: number;
  mutedUntil?: number; // null = forever
}

class MuteServiceClass {
  private mutedChats: Map<string, MutedChat> = new Map();
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    try {
      const data = await AsyncStorage.getItem(MUTED_CHATS_KEY);
      if (data) {
        const parsed: MutedChat[] = JSON.parse(data);
        parsed.forEach(chat => {
          // Check if mute expired
          if (!chat.mutedUntil || chat.mutedUntil > Date.now()) {
            this.mutedChats.set(chat.chatId, chat);
          }
        });
      }
      this.initialized = true;
    } catch (e) {
      console.error('Error loading muted chats:', e);
    }
  }

  async muteChat(chatId: string, duration?: number): Promise<void> {
    await this.init();
    
    const mutedChat: MutedChat = {
      chatId,
      mutedAt: Date.now(),
      mutedUntil: duration ? Date.now() + duration : undefined,
    };
    
    this.mutedChats.set(chatId, mutedChat);
    await this.save();
  }

  async unmuteChat(chatId: string): Promise<void> {
    await this.init();
    this.mutedChats.delete(chatId);
    await this.save();
  }

  async isMuted(chatId: string): Promise<boolean> {
    await this.init();
    const muted = this.mutedChats.get(chatId);
    
    if (!muted) return false;
    
    // Check if mute expired
    if (muted.mutedUntil && muted.mutedUntil <= Date.now()) {
      this.mutedChats.delete(chatId);
      await this.save();
      return false;
    }
    
    return true;
  }

  isMutedSync(chatId: string): boolean {
    const muted = this.mutedChats.get(chatId);
    if (!muted) return false;
    if (muted.mutedUntil && muted.mutedUntil <= Date.now()) {
      return false;
    }
    return true;
  }

  getMutedChats(): string[] {
    return Array.from(this.mutedChats.keys());
  }

  private async save(): Promise<void> {
    const data = Array.from(this.mutedChats.values());
    await AsyncStorage.setItem(MUTED_CHATS_KEY, JSON.stringify(data));
  }
}

export const MuteService = new MuteServiceClass();

// Mute duration options in milliseconds
export const MUTE_DURATIONS = {
  '1_HOUR': 1000 * 60 * 60,
  '8_HOURS': 1000 * 60 * 60 * 8,
  '1_DAY': 1000 * 60 * 60 * 24,
  '7_DAYS': 1000 * 60 * 60 * 24 * 7,
  'FOREVER': undefined,
};
