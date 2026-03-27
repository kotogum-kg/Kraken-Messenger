/**
 * Type definitions for Kraken Messenger
 */

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  isHidden: boolean;
  isPinned: boolean;
  avatar?: string;
  unreadCount?: number;
  type: 'personal' | 'group' | 'channel';
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  isMine: boolean;
}

export interface PINData {
  hash: string;
  failedAttempts: number;
}

export interface HiddenChatsData {
  chatIds: string[];
}
