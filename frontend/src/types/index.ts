/**
 * Type definitions for Kraken Messenger
 */

// Chat types matching Telegram
export type ChatType = 'private' | 'group' | 'supergroup' | 'channel' | 'bot';

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  isHidden: boolean;
  isPinned: boolean;
  unreadCount: number;
  type: ChatType;
  avatar?: string;
  isOnline?: boolean;
  isMuted?: boolean;
  folderId?: string;
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  isOwn: boolean;
  isRead: boolean;
  type: 'text' | 'voice' | 'image' | 'video' | 'document' | 'sticker';
  media?: {
    uri: string;
    duration?: number;
    width?: number;
    height?: number;
    filename?: string;
  };
  replyTo?: string;
  reactions?: { emoji: string; count: number; isOwn: boolean }[];
  isPinned?: boolean;
}

export interface ChatFolder {
  id: string;
  name: string;
  icon: string;
  chatIds: string[];
  color?: string;
}

export interface UserSettings {
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  chatWallpaper?: string;
  notificationsEnabled: boolean;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: number;
}
