/**
 * API Service for Kraken Messenger
 * Handles all communication with the backend
 */

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE}/api`;
    console.log('[ApiService] Initialized with base URL:', this.baseUrl);
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('[ApiService] Request:', options?.method || 'GET', url);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ApiService] Error response:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[ApiService] Response:', data);
      return data;
    } catch (error) {
      console.error('[ApiService] Request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; telegram_api_configured: boolean }> {
    return this.request('/health');
  }

  // Telegram Auth - Send Code
  async sendCode(phone: string): Promise<{
    success: boolean;
    phone: string;
    phone_code_hash: string;
  }> {
    return this.request('/telegram/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  // Telegram Auth - Sign In
  async signIn(phone: string, code: string, password?: string): Promise<{
    success: boolean;
    account_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string | null;
      username: string | null;
      phone: string;
    };
    error?: string;
    needs_password?: boolean;
  }> {
    return this.request('/telegram/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ phone, code, password }),
    });
  }

  // Telegram - Get Chats
  async getChats(accountId: string, limit: number = 50): Promise<{
    chats: Array<{
      id: string;
      title: string;
      type: 'personal' | 'group' | 'channel' | 'supergroup';
      unread_count: number;
      last_message: string | null;
      last_message_date: string | null;
      is_pinned: boolean;
      is_muted: boolean;
    }>;
  }> {
    return this.request(`/telegram/chats?account_id=${accountId}&limit=${limit}`);
  }

  // Telegram - Get Messages
  async getMessages(accountId: string, chatId: string, limit: number = 50): Promise<{
    messages: Array<{
      id: number;
      text: string;
      date: string;
      is_mine: boolean;
      from_id: number | null;
    }>;
  }> {
    return this.request(`/telegram/messages/${chatId}?account_id=${accountId}&limit=${limit}`);
  }

  // Telegram - Send Message
  async sendMessage(accountId: string, chatId: string, text: string): Promise<{
    success: boolean;
    message_id?: number;
    date?: string;
    error?: string;
  }> {
    return this.request('/telegram/send-message', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        chat_id: chatId,
        text,
      }),
    });
  }

  // Telegram - Get Active Accounts
  async getAccounts(): Promise<{ accounts: string[] }> {
    return this.request('/telegram/accounts');
  }

  // Telegram - Logout
  async logout(accountId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/telegram/logout?account_id=${accountId}`, {
      method: 'POST',
    });
  }

  // Telegram - Restore all sessions
  async restoreSessions(): Promise<{
    success: boolean;
    sessions: Array<{
      phone: string;
      success: boolean;
      account_id?: string;
      user?: {
        id: number;
        first_name: string;
        last_name: string | null;
        username: string | null;
        phone: string;
      };
      error?: string;
    }>;
  }> {
    return this.request('/telegram/restore-sessions', {
      method: 'POST',
    });
  }

  // Telegram - Send Voice Message
  async sendVoice(accountId: string, chatId: string, voiceData: string, duration: number): Promise<{
    success: boolean;
    message_id?: number;
    date?: string;
    error?: string;
  }> {
    return this.request('/telegram/send-voice', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        chat_id: chatId,
        voice_data: voiceData, // base64
        duration,
      }),
    });
  }

  // Telegram - Send Media (photo/video/file)
  async sendMedia(accountId: string, chatId: string, mediaData: string, filename: string, caption: string = '', ttlSeconds?: number): Promise<{
    success: boolean;
    message_id?: number;
    date?: string;
    is_self_destructing?: boolean;
    error?: string;
  }> {
    return this.request('/telegram/send-media', {
      method: 'POST',
      body: JSON.stringify({
        account_id: accountId,
        chat_id: chatId,
        media_data: mediaData, // base64
        filename,
        caption,
        ttl_seconds: ttlSeconds,
      }),
    });
  }

  // Telegram - Get Messages Extended (with media info)
  async getMessagesExtended(accountId: string, chatId: string, limit: number = 50): Promise<{
    messages: Array<{
      id: number;
      text: string;
      date: string;
      is_mine: boolean;
      from_id: number | null;
      type: 'text' | 'voice' | 'video_note' | 'photo' | 'video' | 'document' | 'sticker';
      media?: {
        duration?: number;
        size?: number;
        has_ttl?: boolean;
        ttl_seconds?: number;
        filename?: string;
        emoji?: string;
      };
    }>;
  }> {
    return this.request(`/telegram/messages-extended/${chatId}?account_id=${accountId}&limit=${limit}`);
  }

  // Telegram - Download Media
  async downloadMedia(accountId: string, chatId: string, messageId: number): Promise<{
    success: boolean;
    data?: string; // base64
    size?: number;
    filename?: string;
    error?: string;
  }> {
    return this.request(`/telegram/download-media/${chatId}/${messageId}?account_id=${accountId}`);
  }
}

export const api = new ApiService();
