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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isPINSet, clearSecurityData } from '../utils/security';
import { clearAllData } from '../utils/storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useTelegram } from '../context/TelegramContext';
import { ACCENT_COLORS } from '../context/ThemeContext';

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
  const { isAuthenticated, user, logout } = useTelegram();
  const [pinSet, setPinSet] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(COLORS.neonBlue);

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

  const handleLogout = () => {
    Alert.alert(
      'Выйти из Telegram',
      'Вы уверены? Для входа потребуется новый код.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  // Theme modal component
  const ThemeModal = () => (
    <Modal
      visible={showThemeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={() => setShowThemeModal(false)}
      >
        <View style={styles.themeModalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Выберите цвет</Text>
          
          <View style={styles.colorsGrid}>
            {ACCENT_COLORS.map((item) => (
              <TouchableOpacity
                key={item.color}
                style={[
                  styles.colorOption,
                  { backgroundColor: item.color },
                  selectedAccent === item.color && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  setSelectedAccent(item.color);
                  // Here you would update the theme context
                  Alert.alert('Цвет изменён', `Выбран: ${item.name}`);
                  setShowThemeModal(false);
                }}
              >
                {selectedAccent === item.color && (
                  <Ionicons name="checkmark" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.closeModalButton}
            onPress={() => setShowThemeModal(false)}
          >
            <Text style={styles.closeModalText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
        {/* Account Section */}
        {isAuthenticated && user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Аккаунт Telegram</Text>
            
            <View style={styles.accountCard}>
              <View style={styles.accountIcon}>
                <Ionicons name="person" size={32} color={COLORS.neonBlue} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {user.first_name} {user.last_name || ''}
                </Text>
                <Text style={styles.accountPhone}>+{user.phone}</Text>
                {user.username && (
                  <Text style={styles.accountUsername}>@{user.username}</Text>
                )}
              </View>
            </View>
            
            <SettingItem
              icon="log-out"
              title="Выйти из Telegram"
              subtitle="Потребуется новый код"
              onPress={handleLogout}
              danger
            />
          </View>
        )}

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
            title="Цвет акцента"
            subtitle="Выберите ваш цвет"
            onPress={() => setShowThemeModal(true)}
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
      
      {/* Theme Modal */}
      <ThemeModal />
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
  // Account styles
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neonBlue + '40',
  },
  accountIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.neonBlue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  accountPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  accountUsername: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neonBlue,
    marginTop: SPACING.xs,
  },
  // Theme Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  themeModalContent: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    margin: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
  },
  closeModalButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeModalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
