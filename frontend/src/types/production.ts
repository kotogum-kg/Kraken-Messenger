/**
 * Extended types for production version
 */

export interface Account {
  id: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: number;
}

export interface ProxySettings {
  id: string;
  name: string;
  type: 'HTTP' | 'SOCKS5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  isActive: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  enableGeotags: boolean;
  watermarkText: string;
  autoLockTimeout: number; // minutes
  language: 'ru' | 'en';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  location?: LocationData;
  hasWatermark: boolean;
}
