/**
 * Telegram Context - Manages Telegram authentication state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  phone: string;
}

interface TelegramContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accountId: string | null;
  user: TelegramUser | null;
  login: (accountId: string, user: TelegramUser) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

const STORAGE_KEY = 'telegram_session';

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First, try to restore sessions on the backend
      try {
        const restoreResult = await api.restoreSessions();
        console.log('[TelegramContext] Restore sessions result:', restoreResult);
      } catch (e) {
        console.log('[TelegramContext] Could not restore sessions:', e);
      }
      
      // Then check if we have a saved session locally
      const sessionData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (sessionData) {
        const { accountId: savedAccountId, user: savedUser } = JSON.parse(sessionData);
        
        // Verify session is still valid by checking active accounts
        const { accounts } = await api.getAccounts();
        
        if (accounts.includes(savedAccountId)) {
          setAccountId(savedAccountId);
          setUser(savedUser);
          setIsAuthenticated(true);
          console.log('[TelegramContext] Session restored for:', savedUser?.first_name);
          return true;
        } else {
          // Session expired, clear storage
          await AsyncStorage.removeItem(STORAGE_KEY);
          console.log('[TelegramContext] Session expired, cleared');
        }
      }
      
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error('[TelegramContext] Error checking session:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newAccountId: string, newUser: TelegramUser) => {
    try {
      // Save to storage
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accountId: newAccountId, user: newUser })
      );
      
      setAccountId(newAccountId);
      setUser(newUser);
      setIsAuthenticated(true);
      console.log('[TelegramContext] Logged in:', newUser.first_name);
    } catch (error) {
      console.error('[TelegramContext] Error saving session:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accountId) {
        await api.logout(accountId);
      }
    } catch (error) {
      console.error('[TelegramContext] Error logging out from API:', error);
    }
    
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAccountId(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log('[TelegramContext] Logged out');
  };

  return (
    <TelegramContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        accountId,
        user,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}
