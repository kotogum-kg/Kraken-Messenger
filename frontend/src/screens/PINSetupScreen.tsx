/**
 * PIN Setup Screen - First time PIN creation
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PINInput } from '../components/PINInput';
import { savePIN } from '../utils/security';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PINSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPIN, setFirstPIN] = useState('');
  const [error, setError] = useState(false);

  const handlePINComplete = async (pin: string) => {
    if (step === 'create') {
      setFirstPIN(pin);
      setStep('confirm');
      setError(false);
    } else {
      // Confirm PIN
      if (pin === firstPIN) {
        try {
          await savePIN(pin);
          Alert.alert(
            'Успех!',
            'PIN-код установлен',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось сохранить PIN-код');
        }
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setStep('create');
          setFirstPIN('');
        }, 500);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройка PIN</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={COLORS.neonBlue} />
        </View>

        <Text style={styles.title}>
          {step === 'create' ? 'Создайте PIN-код' : 'Подтвердите PIN-код'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'create'
            ? 'Введите 4-значный PIN-код для защиты скрытых чатов'
            : 'Повторите PIN-код для подтверждения'}
        </Text>

        <View style={styles.pinContainer}>
          <PINInput onComplete={handlePINComplete} error={error} />
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>PIN-коды не совпадают</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.warning} />
          <Text style={styles.infoText}>
            Важно: После 3 неверных попыток ввода все данные будут удалены
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl + 10,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.neonBlue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  pinContainer: {
    marginVertical: SPACING.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
  },
});
