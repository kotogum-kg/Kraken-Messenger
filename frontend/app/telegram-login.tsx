/**
 * Telegram Login Screen
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';
import { api } from '../src/services/api';
import { useTelegram } from '../src/context/TelegramContext';

type Step = 'phone' | 'code' | 'password';

export default function TelegramLoginScreen() {
  const router = useRouter();
  const { login } = useTelegram();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');

  const codeInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSendCode = async () => {
    if (phone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.sendCode(phone);
      
      if (result.success) {
        setPhoneCodeHash(result.phone_code_hash);
        setStep('code');
        setTimeout(() => codeInputRef.current?.focus(), 100);
      } else {
        setError('Не удалось отправить код');
      }
    } catch (err: any) {
      console.error('Send code error:', err);
      setError(err.message || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (code.length < 5) {
      setError('Введите код из 5 цифр');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.signIn(phone, code, password || undefined);
      
      if (result.success && result.account_id && result.user) {
        await login(result.account_id, result.user);
        router.replace('/');
      } else if (result.needs_password) {
        setStep('password');
        setTimeout(() => passwordInputRef.current?.focus(), 100);
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('phone');
      setCode('');
    } else if (step === 'password') {
      setStep('code');
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {step !== 'phone' && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
            <Ionicons name="send" size={80} color={COLORS.neonBlue} />
            <Text style={styles.title}>Вход в Telegram</Text>
            <Text style={styles.subtitle}>
              {step === 'phone' && 'Введите номер телефона'}
              {step === 'code' && 'Введите код из Telegram'}
              {step === 'password' && 'Введите пароль 2FA'}
            </Text>
          </View>

          {/* Phone Input */}
          {step === 'phone' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+7 999 123 45 67"
                placeholderTextColor={COLORS.textDim}
                keyboardType="phone-pad"
                autoFocus
                editable={!loading}
              />
              <Text style={styles.hint}>
                Код будет отправлен в приложение Telegram или по SMS
              </Text>
            </View>
          )}

          {/* Code Input */}
          {step === 'code' && (
            <View style={styles.inputContainer}>
              <TextInput
                ref={codeInputRef}
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="12345"
                placeholderTextColor={COLORS.textDim}
                keyboardType="number-pad"
                maxLength={5}
                editable={!loading}
              />
              <Text style={styles.hint}>
                Проверьте сообщения в Telegram на номере {phone}
              </Text>
            </View>
          )}

          {/* Password Input (2FA) */}
          {step === 'password' && (
            <View style={styles.inputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Пароль двухфакторной аутентификации"
                placeholderTextColor={COLORS.textDim}
                secureTextEntry
                editable={!loading}
              />
              <Text style={styles.hint}>
                У вас включена двухфакторная аутентификация
              </Text>
            </View>
          )}

          {/* Error */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={step === 'phone' ? handleSendCode : handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>
                {step === 'phone' ? 'Получить код' : 'Войти'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: BORDER_RADIUS.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.neonBlue,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.background,
  },
});
