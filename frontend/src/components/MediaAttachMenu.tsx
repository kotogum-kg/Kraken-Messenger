/**
 * Media Attachment Menu Component
 * Shows options for sending media with optional self-destruct
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useMediaPicker } from '../hooks/useMediaPicker';
import { api } from '../services/api';

interface MediaAttachMenuProps {
  visible: boolean;
  onClose: () => void;
  accountId: string;
  chatId: string;
  onMediaSent: () => void;
}

const TTL_OPTIONS = [
  { label: '3 сек', value: 3 },
  { label: '10 сек', value: 10 },
  { label: '30 сек', value: 30 },
  { label: '1 мин', value: 60 },
];

export function MediaAttachMenu({ visible, onClose, accountId, chatId, onMediaSent }: MediaAttachMenuProps) {
  const { pickFromLibrary, takePhoto, getBase64, loading: pickerLoading } = useMediaPicker();
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [ttlSeconds, setTtlSeconds] = useState(10);
  const [sending, setSending] = useState(false);

  const handlePickMedia = async () => {
    const media = await pickFromLibrary();
    if (media) {
      await sendMedia(media.base64 || await getBase64(media.uri), media.fileName);
    }
  };

  const handleTakePhoto = async () => {
    const media = await takePhoto();
    if (media) {
      await sendMedia(media.base64 || await getBase64(media.uri), media.fileName);
    }
  };

  const sendMedia = async (base64: string | null, fileName: string) => {
    if (!base64) {
      Alert.alert('Ошибка', 'Не удалось обработать медиа');
      return;
    }

    setSending(true);
    try {
      const result = await api.sendMedia(
        accountId,
        chatId,
        base64,
        fileName,
        '',
        selfDestruct ? ttlSeconds : undefined
      );

      if (result.success) {
        onMediaSent();
        onClose();
        
        if (result.is_self_destructing) {
          Alert.alert('Отправлено', `Медиа удалится через ${ttlSeconds} сек после просмотра`);
        }
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось отправить медиа');
      }
    } catch (error) {
      console.error('Error sending media:', error);
      Alert.alert('Ошибка', 'Не удалось отправить медиа');
    } finally {
      setSending(false);
    }
  };

  const isLoading = pickerLoading || sending;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Отправить медиа</Text>

          {/* Self-destruct toggle */}
          <View style={styles.selfDestructRow}>
            <View style={styles.selfDestructInfo}>
              <Ionicons name="flame" size={24} color={selfDestruct ? COLORS.error : COLORS.textDim} />
              <View style={styles.selfDestructText}>
                <Text style={styles.selfDestructTitle}>Одноразовый просмотр</Text>
                <Text style={styles.selfDestructHint}>Удалится после просмотра</Text>
              </View>
            </View>
            <Switch
              value={selfDestruct}
              onValueChange={setSelfDestruct}
              trackColor={{ false: COLORS.backgroundCard, true: COLORS.error }}
              thumbColor={selfDestruct ? COLORS.textPrimary : COLORS.textDim}
            />
          </View>

          {/* TTL selector */}
          {selfDestruct && (
            <View style={styles.ttlContainer}>
              <Text style={styles.ttlLabel}>Время просмотра:</Text>
              <View style={styles.ttlOptions}>
                {TTL_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.ttlOption,
                      ttlSeconds === option.value && styles.ttlOptionActive,
                    ]}
                    onPress={() => setTtlSeconds(option.value)}
                  >
                    <Text
                      style={[
                        styles.ttlOptionText,
                        ttlSeconds === option.value && styles.ttlOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickMedia}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.neonBlue} />
              ) : (
                <>
                  <Ionicons name="images" size={32} color={COLORS.neonBlue} />
                  <Text style={styles.actionText}>Галерея</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.neonPurple} />
              ) : (
                <>
                  <Ionicons name="camera" size={32} color={COLORS.neonPurple} />
                  <Text style={styles.actionText}>Камера</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  selfDestructRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  selfDestructInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selfDestructText: {
    marginLeft: SPACING.md,
  },
  selfDestructTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  selfDestructHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ttlContainer: {
    marginBottom: SPACING.lg,
  },
  ttlLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ttlOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ttlOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  ttlOptionActive: {
    backgroundColor: COLORS.error,
  },
  ttlOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ttlOptionTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.lg,
    minWidth: 100,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
