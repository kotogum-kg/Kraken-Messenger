/**
 * Individual Chat Screen - Real Telegram Messages
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useTelegram } from '../context/TelegramContext';
import { api } from '../services/api';
import { useVoiceRecording, formatDuration } from '../hooks/useVoiceRecording';
import { MediaAttachMenu } from '../components/MediaAttachMenu';

interface TelegramMessage {
  id: number;
  text: string;
  date: string;
  is_mine: boolean;
  from_id: number | null;
  type?: string;
  media?: {
    duration?: number;
    size?: number;
    has_ttl?: boolean;
  };
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accountId, isAuthenticated } = useTelegram();
  
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatTitle, setChatTitle] = useState('Чат');
  const [chatType, setChatType] = useState<string>('personal');
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [canSendMessages, setCanSendMessages] = useState(true);
  
  const flashListRef = useRef<FlashList<TelegramMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Voice recording
  const {
    isRecording,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    getBase64,
  } = useVoiceRecording();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!accountId || !id || id === 'kraken_news') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.getMessages(accountId, id, 50);
      // Reverse to show oldest first (Telegram returns newest first)
      setMessages(response.messages.reverse());
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    } finally {
      setLoading(false);
    }
  }, [accountId, id]);

  // Load chat info
  const loadChatInfo = useCallback(async () => {
    if (!accountId || !id || id === 'kraken_news') {
      if (id === 'kraken_news') {
        setChatTitle('Kraken News');
        setChatType('channel');
        setCanSendMessages(false);
      }
      return;
    }

    try {
      // Use new chat info API to get permissions
      const chatInfo = await api.getChatInfo(accountId, id);
      
      if (chatInfo.success) {
        setChatTitle(chatInfo.title || 'Чат');
        setChatType(chatInfo.type || 'personal');
        setCanSendMessages(chatInfo.can_send_messages !== false);
        console.log('[ChatScreen] Chat info:', chatInfo.title, 'canSend:', chatInfo.can_send_messages);
      } else {
        // Fallback to old method
        const response = await api.getChats(accountId, 100);
        const chat = response.chats.find(c => c.id === id);
        if (chat) {
          setChatTitle(chat.title);
          setChatType(chat.type);
          // Channels are read-only by default unless we're admin
          setCanSendMessages(chat.type !== 'channel');
        }
      }
    } catch (error) {
      console.error('Error loading chat info:', error);
      // Default to allowing messages for non-channels
      setCanSendMessages(true);
    }
  }, [accountId, id]);

  useEffect(() => {
    loadChatInfo();
    loadMessages();
  }, [loadChatInfo, loadMessages]);

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || !accountId || !id || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const result = await api.sendMessage(accountId, id, text);
      
      if (result.success) {
        // Add message locally
        const newMessage: TelegramMessage = {
          id: result.message_id || Date.now(),
          text: text,
          date: result.date || new Date().toISOString(),
          is_mine: true,
          from_id: null,
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          flashListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось отправить сообщение');
        setInputText(text); // Restore text
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      setInputText(text); // Restore text
    } finally {
      setSending(false);
    }
  };

  // Handle voice recording
  const handleVoicePress = async () => {
    if (isRecording) {
      // Stop recording and send
      const result = await stopRecording();
      if (result && result.uri && accountId && id) {
        setSending(true);
        try {
          const base64 = await getBase64(result.uri);
          if (base64) {
            const sendResult = await api.sendVoice(accountId, id, base64, result.duration);
            if (sendResult.success) {
              // Add voice message locally
              const newMessage: TelegramMessage = {
                id: sendResult.message_id || Date.now(),
                text: '',
                date: sendResult.date || new Date().toISOString(),
                is_mine: true,
                from_id: null,
                type: 'voice',
                media: { duration: result.duration },
              };
              setMessages(prev => [...prev, newMessage]);
              flashListRef.current?.scrollToEnd({ animated: true });
            } else {
              Alert.alert('Ошибка', sendResult.error || 'Не удалось отправить голосовое');
            }
          }
        } catch (error) {
          console.error('Error sending voice:', error);
          Alert.alert('Ошибка', 'Не удалось отправить голосовое сообщение');
        } finally {
          setSending(false);
        }
      }
    } else {
      // Start recording
      await startRecording();
    }
  };

  const handleCancelVoice = () => {
    cancelRecording();
  };

  // Refresh messages
  const handleRefresh = () => {
    loadMessages();
  };

  // Render message bubble
  const renderMessage = ({ item }: { item: TelegramMessage }) => {
    const date = new Date(item.date);
    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageBubble, item.is_mine ? styles.myMessage : styles.theirMessage]}>
        {item.text ? (
          <Text style={[styles.messageText, item.is_mine && styles.myMessageText]}>
            {item.text}
          </Text>
        ) : (
          <Text style={[styles.messageText, styles.mediaPlaceholder]}>
            [Медиа-сообщение]
          </Text>
        )}
        <Text style={[styles.messageTime, item.is_mine && styles.myMessageTime]}>
          {timeStr}
        </Text>
      </View>
    );
  };

  // Check if it's Kraken News channel
  if (id === 'kraken_news') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundLight} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Kraken News</Text>
            <View style={styles.channelBadge}>
              <Ionicons name="megaphone" size={12} color={COLORS.neonBlue} />
              <Text style={styles.channelText}>Официальный канал</Text>
            </View>
          </View>
        </View>
        <View style={styles.krakenNewsContainer}>
          <Ionicons name="newspaper-outline" size={64} color={COLORS.neonBlue} />
          <Text style={styles.krakenNewsTitle}>Kraken News</Text>
          <Text style={styles.krakenNewsText}>
            Откройте канал в Telegram для просмотра новостей
          </Text>
          <TouchableOpacity 
            style={styles.openTelegramButton}
            onPress={() => {
              Alert.alert(
                'Перейти в Telegram',
                'Вы переходите во внешний канал Telegram.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  {
                    text: 'Перейти',
                    onPress: () => Linking.openURL('https://t.me/+GsJRkVsUS6U5OTc5'),
                  },
                ]
              );
            }}
          >
            <Ionicons name="open-outline" size={20} color={COLORS.background} />
            <Text style={styles.openTelegramText}>Открыть в Telegram</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Check if authenticated
  if (!isAuthenticated || !accountId) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundLight} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Чат</Text>
          </View>
        </View>
        <View style={styles.authRequired}>
          <Ionicons name="lock-closed-outline" size={64} color={COLORS.textDim} />
          <Text style={styles.authRequiredText}>Войдите в Telegram для просмотра сообщений</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/telegram-login')}
          >
            <Text style={styles.loginButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{chatTitle}</Text>
          <View style={styles.channelBadge}>
            <Ionicons 
              name={chatType === 'channel' ? 'megaphone' : chatType === 'group' || chatType === 'supergroup' ? 'people' : 'person'} 
              size={12} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.chatTypeText}>
              {chatType === 'channel' ? 'Канал' : chatType === 'group' || chatType === 'supergroup' ? 'Группа' : 'Личный чат'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.menuButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.neonBlue} />
          <Text style={styles.loadingText}>Загрузка сообщений...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            ref={flashListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            estimatedItemSize={80}
            contentContainerStyle={styles.messagesContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color={COLORS.textDim} />
                <Text style={styles.emptyText}>Нет сообщений</Text>
              </View>
            }
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flashListRef.current?.scrollToEnd({ animated: false });
              }
            }}
          />
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        {isRecording ? (
          // Recording mode
          <View style={styles.recordingContainer}>
            <TouchableOpacity onPress={handleCancelVoice} style={styles.cancelButton}>
              <Ionicons name="close" size={24} color={COLORS.error} />
            </TouchableOpacity>
            
            <View style={styles.recordingInfo}>
              <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
              <Text style={styles.recordingHint}>Отпустите для отправки</Text>
            </View>
            
            <TouchableOpacity onPress={handleVoicePress} style={styles.sendVoiceButton}>
              <Ionicons name="send" size={20} color={COLORS.background} />
            </TouchableOpacity>
          </View>
        ) : (
          // Normal input mode
          <>
            {canSendMessages ? (
              <>
                <TouchableOpacity 
                  style={styles.attachButton}
                  onPress={() => setShowMediaMenu(true)}
                >
                  <Ionicons name="attach" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
                
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Сообщение..."
                  placeholderTextColor={COLORS.textDim}
                  multiline
                  maxLength={4096}
                  editable={!sending}
                />
                
                {inputText.trim() ? (
                  <TouchableOpacity 
                    style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={sending}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color={COLORS.background} />
                    ) : (
                      <Ionicons name="send" size={20} color={COLORS.background} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.micButton}
                    onPress={handleVoicePress}
                    disabled={sending}
                  >
                    <Ionicons name="mic" size={24} color={COLORS.neonBlue} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              // Read-only channel message
              <View style={styles.readOnlyMessage}>
                <Ionicons name="megaphone-outline" size={20} color={COLORS.textDim} />
                <Text style={styles.readOnlyText}>Только для чтения</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Media Attach Menu */}
      {accountId && id && (
        <MediaAttachMenu
          visible={showMediaMenu}
          onClose={() => setShowMediaMenu(false)}
          accountId={accountId}
          chatId={id}
          onMediaSent={loadMessages}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
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
    marginRight: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  channelText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neonBlue,
    marginLeft: SPACING.xs,
  },
  chatTypeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  messagesContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.neonBlue,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.backgroundCard,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  myMessageText: {
    color: COLORS.background,
  },
  mediaPlaceholder: {
    fontStyle: 'italic',
    color: COLORS.textDim,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  myMessageTime: {
    color: 'rgba(10, 15, 26, 0.6)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    marginTop: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachButton: {
    padding: SPACING.sm,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neonBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundCard,
  },
  authRequired: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  authRequiredText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loginButton: {
    backgroundColor: COLORS.neonBlue,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  loginButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  krakenNewsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  krakenNewsTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  krakenNewsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  openTelegramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neonBlue,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  openTelegramText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  // Voice recording styles
  micButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  recordingTime: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  recordingHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sendVoiceButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neonBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Voice message display
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  voiceIcon: {
    marginRight: SPACING.sm,
  },
  voiceDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Read-only channel message
  readOnlyMessage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  readOnlyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginLeft: SPACING.sm,
  },
});
