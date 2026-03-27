/**
 * Settings Screen
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isPINSet, clearSecurityData } from '../utils/security';
import { clearAllData } from '../utils/storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
  rightComponent?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
  rightComponent,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? COLORS.error : COLORS.neonBlue}
      />
    </View>
    
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    
    {rightComponent || (showArrow && onPress && (
      <Ionicons name="chevron-forward" size={20} color={COLORS.textDim} />
    ))}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [pinSet, setPinSet] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    checkPINStatus();
  }, []);

  const checkPINStatus = async () => {
    const isSet = await isPINSet();
    setPinSet(isSet);
  };

  const handleHiddenChatsPress = async () => {
    const isSet = await isPINSet();
    
    if (!isSet) {
      Alert.alert(
        'PIN не установлен',
        'Сначала установите PIN-код для защиты скрытых чатов',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Установить PIN', onPress: () => {
            // @ts-ignore
            router.push('/pin-setup');
          }},
        ]
      );
    } else {
      // @ts-ignore
      router.push('/pin-auth');
    }
  };

  const handleChangePIN = () => {
    Alert.alert(
      'Сменить PIN',
      'Для смены PIN-кода сначала удалите текущий',
      [{ text: 'OK' }]
    );
  };

  const handleRemovePIN = () => {
    Alert.alert(
      'Удалить PIN',
      'Вы уверены? Это отключит защиту скрытых чатов.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await clearSecurityData();
            setPinSet(false);
            Alert.alert('Готово', 'PIN-код удалён');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Очистить данные',
      'Удалить все данные? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await clearSecurityData();
            await clearAllData();
            Alert.alert('Готово', 'Все данные удалены');
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Конфиденциальность</Text>
          
          <SettingItem
            icon="eye-off"
            title="Скрытые чаты"
            subtitle="Просмотр скрытых чатов"
            onPress={handleHiddenChatsPress}
          />
          
          {!pinSet ? (
            <SettingItem
              icon="lock-closed"
              title="Установить PIN-код"
              subtitle="Защитите скрытые чаты"
              onPress={() => router.push('/pin-setup')}
            />
          ) : (
            <>
              <SettingItem
                icon="key"
                title="Сменить PIN"
                subtitle="Изменить PIN-код"
                onPress={handleChangePIN}
              />
              <SettingItem
                icon="trash"
                title="Удалить PIN"
                subtitle="Отключить защиту"
                onPress={handleRemovePIN}
                danger
              />
            </>
          )}
          
          <SettingItem
            icon="finger-print"
            title="Биометрия"
            subtitle="Доступно в следующей версии"
            showArrow={false}
            rightComponent={
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.neonBlue + '60' }}
                thumbColor={biometricsEnabled ? COLORS.neonBlue : COLORS.textDim}
                disabled
              />
            }
          />
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Приложение</Text>
          
          <SettingItem
            icon="notifications"
            title="Уведомления"
            subtitle="Настройки уведомлений"
            onPress={() => Alert.alert('Скоро', 'Функция в разработке')}
          />
          
          <SettingItem
            icon="color-palette"
            title="Тема"
            subtitle="Тёмная (дефолт)"
            onPress={() => Alert.alert('Тема', 'Другие темы будут доступны позже')}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          
          <SettingItem
            icon="information-circle"
            title="Версия"
            subtitle="1.0.0 (MVP)"
            showArrow={false}
          />
          
          <SettingItem
            icon="help-circle"
            title="Помощь"
            subtitle="FAQ и поддержка"
            onPress={() => Alert.alert('Kraken Messenger', 'Ваш защищённый мессенджер 🦑')}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleDanger]}>Опасная зона</Text>
          
          <SettingItem
            icon="trash"
            title="Очистить все данные"
            subtitle="Удалить все чаты и настройки"
            onPress={handleClearData}
            danger
          />
        </View>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.neonBlue} />
          <Text style={styles.footerText}>Kraken Messenger</Text>
          <Text style={styles.footerSubtext}>Защищённые чаты</Text>
        </View>
      </ScrollView>
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
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitleDanger: {
    color: COLORS.error,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neonBlue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconContainerDanger: {
    backgroundColor: COLORS.error + '20',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingTitleDanger: {
    color: COLORS.error,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  footerText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.neonBlue,
    marginTop: SPACING.sm,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
