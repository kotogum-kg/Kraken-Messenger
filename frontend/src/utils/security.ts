/**
 * Security utilities for PIN management and mirror password detection
 */
import * as SecureStore from 'expo-secure-store';
import { PINData } from '../types';

const PIN_KEY = 'kraken_pin';
const FAILED_ATTEMPTS_KEY = 'kraken_failed_attempts';
const MAX_FAILED_ATTEMPTS = 3;

/**
 * Simple hash function for PIN (for demo purposes)
 * In production, use stronger hashing like bcrypt
 */
export const hashPIN = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

/**
 * Reverse PIN for mirror password detection
 */
export const reversePIN = (pin: string): string => {
  return pin.split('').reverse().join('');
};

/**
 * Save PIN to secure storage
 */
export const savePIN = async (pin: string): Promise<void> => {
  const hashed = hashPIN(pin);
  await SecureStore.setItemAsync(PIN_KEY, hashed);
  await SecureStore.setItemAsync(FAILED_ATTEMPTS_KEY, '0');
};

/**
 * Check if PIN is set
 */
export const isPINSet = async (): Promise<boolean> => {
  const pin = await SecureStore.getItemAsync(PIN_KEY);
  return pin !== null;
};

/**
 * Verify PIN and handle mirror password
 * Returns: { success: boolean, isMirrorPassword: boolean }
 */
export const verifyPIN = async (enteredPIN: string): Promise<{
  success: boolean;
  isMirrorPassword: boolean;
  shouldWipeData: boolean;
}> => {
  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  const enteredHash = hashPIN(enteredPIN);
  const reversedHash = hashPIN(reversePIN(enteredPIN));
  
  // Check if it's the mirror password (reversed PIN)
  if (storedHash === reversedHash && storedHash !== enteredHash) {
    // This is the mirror password - increment failed attempts
    const failedAttempts = await incrementFailedAttempts();
    return {
      success: false,
      isMirrorPassword: true,
      shouldWipeData: failedAttempts >= MAX_FAILED_ATTEMPTS,
    };
  }
  
  // Check if PIN is correct
  if (storedHash === enteredHash) {
    // Reset failed attempts on success
    await SecureStore.setItemAsync(FAILED_ATTEMPTS_KEY, '0');
    return {
      success: true,
      isMirrorPassword: false,
      shouldWipeData: false,
    };
  }
  
  // Wrong PIN
  const failedAttempts = await incrementFailedAttempts();
  return {
    success: false,
    isMirrorPassword: false,
    shouldWipeData: failedAttempts >= MAX_FAILED_ATTEMPTS,
  };
};

/**
 * Increment failed attempts counter
 */
const incrementFailedAttempts = async (): Promise<number> => {
  const current = await SecureStore.getItemAsync(FAILED_ATTEMPTS_KEY);
  const count = current ? parseInt(current, 10) + 1 : 1;
  await SecureStore.setItemAsync(FAILED_ATTEMPTS_KEY, count.toString());
  return count;
};

/**
 * Get current failed attempts count
 */
export const getFailedAttempts = async (): Promise<number> => {
  const attempts = await SecureStore.getItemAsync(FAILED_ATTEMPTS_KEY);
  return attempts ? parseInt(attempts, 10) : 0;
};

/**
 * Clear all security data (used for data wipe)
 */
export const clearSecurityData = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(FAILED_ATTEMPTS_KEY);
};
