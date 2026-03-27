/**
 * Theme Context - Manages app theme (light/dark/custom colors)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeColors {
  background: string;
  backgroundLight: string;
  backgroundCard: string;
  textPrimary: string;
  textSecondary: string;
  textDim: string;
  neonBlue: string;
  neonPurple: string;
  neonPink: string;
  success: string;
  warning: string;
  error: string;
  border: string;
}

// Preset themes
export const DARK_THEME: ThemeColors = {
  background: '#0A0F1A',
  backgroundLight: '#141B2D',
  backgroundCard: '#1E2738',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B95A5',
  textDim: '#4A5568',
  neonBlue: '#00F2FF',
  neonPurple: '#7B61FF',
  neonPink: '#FF6B9D',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#FF3B30',
  border: '#2D3748',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#F5F7FA',
  backgroundLight: '#FFFFFF',
  backgroundCard: '#E8ECF0',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textDim: '#A0AEC0',
  neonBlue: '#0088CC',
  neonPurple: '#6B46C1',
  neonPink: '#D53F8C',
  success: '#38A169',
  warning: '#D69E2E',
  error: '#E53E3E',
  border: '#E2E8F0',
};

// Custom accent colors
export const ACCENT_COLORS = [
  { name: 'Kraken Blue', color: '#00F2FF' },
  { name: 'Neon Purple', color: '#7B61FF' },
  { name: 'Hot Pink', color: '#FF6B9D' },
  { name: 'Electric Green', color: '#4ADE80' },
  { name: 'Sunset Orange', color: '#FF8C42' },
  { name: 'Classic Telegram', color: '#0088CC' },
];

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  accentColor: string;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'kraken_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState<string>(DARK_THEME.neonBlue);

  // Load saved theme
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { mode: savedMode, accentColor: savedAccent } = JSON.parse(saved);
        if (savedMode) setModeState(savedMode);
        if (savedAccent) setAccentColorState(savedAccent);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (newMode: ThemeMode, newAccent: string) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode: newMode, accentColor: newAccent })
      );
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    saveTheme(newMode, accentColor);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    saveTheme(mode, color);
  };

  // Determine if dark mode
  const isDark = mode === 'dark' || (mode === 'system' && true); // TODO: use system preference

  // Get theme colors with custom accent
  const baseColors = isDark ? DARK_THEME : LIGHT_THEME;
  const colors: ThemeColors = {
    ...baseColors,
    neonBlue: accentColor,
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors,
        accentColor,
        setMode,
        setAccentColor,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
