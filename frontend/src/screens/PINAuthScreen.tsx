/**
 * PIN Authentication Screen - For accessing hidden chats
 */
import React, { useState, useEffect } from 'react';
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
import { verifyPIN, getFailedAttempts, clearSecurityData } from '../utils/security';
import { wipeAllData } from '../utils/storage';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PINAuthScreen() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    const failed = await getFailedAttempts();
    setAttemptsLeft(3 - failed);
  };

  const handleWipeData = async () => {
    await clearSecurityData();
    await wipeAllData();
    
    Alert.alert(
      'Сброс безопасности',
      'Все данные удалены. Перезапустите приложение.',
      [{ text: 'OK', onPress: () => router.replace('/') }]
    );
  };

  const handlePINComplete = async (pin: string) => {
    try {
      const result = await verifyPIN(pin);

      if (result.shouldWipeData) {
        // Data wipe triggered
        await handleWipeData();
        return;
      }

      if (result.isMirrorPassword) {
        // Mirror password detected - show fake error
        setError(true);
        const failed = await getFailedAttempts();
        setAttemptsLeft(3 - failed);
        
        setTimeout(() => {
          setError(false);
          Alert.alert(
            'Ошибка 0xDEADBEEF',
            'Неверный код. Попыток осталось: ' + (3 - failed),
            [{ text: 'OK' }]
          );
        }, 300);
        return;
      }

      if (result.success) {
        // Correct PIN - navigate to hidden chats
        // @ts-ignore
        router.replace('/hidden-chats');
      } else {
        // Wrong PIN
        setError(true);
        const failed = await getFailedAttempts();
        setAttemptsLeft(3 - failed);
        
        setTimeout(() => {
          setError(false);
          if (attemptsLeft > 1) {
            Alert.alert(
              'Неверный PIN',
              `Попыток осталось: ${3 - failed}`,
              [{ text: 'OK' }]
            );
          }
        }, 300);
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Ошибка', 'Не удалось проверить PIN-код');
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
        <Text style={styles.headerTitle}>Скрытые чаты</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="eye-off" size={64} color={COLORS.purple} />
        </View>

        <Text style={styles.title}>Введите PIN-код</Text>
        <Text style={styles.subtitle}>Для доступа к скрытым чатам</Text>

        <View style={styles.pinContainer}>
          <PINInput onComplete={handlePINComplete} error={error} />
        </View>

        <View style={styles.attemptsContainer}>
          <Ionicons 
            name="warning" 
            size={18} 
            color={attemptsLeft <= 1 ? COLORS.error : COLORS.warning} 
          />
          <Text style={[styles.attemptsText, attemptsLeft <= 1 && styles.attemptsTextDanger]}>
            Попыток осталось: {attemptsLeft}
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.neonBlue} />
          <Text style={styles.warningText}>
            При превышении лимита попыток все данные будут удалены для вашей безопасности
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
    backgroundColor: COLORS.purple + '20',
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
  attemptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  attemptsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  attemptsTextDanger: {
    color: COLORS.error,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.neonBlue + '15',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.neonBlue + '30',
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.neonBlue,
    marginLeft: SPACING.sm,
  },
});
