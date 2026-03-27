/**
 * Emoji Reactions Component
 * Shows quick emoji reactions for messages
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

// Common reaction emojis (Telegram supported)
const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉', '😢', '😂', '🤔', '👎'];

const ALL_REACTIONS = [
  '👍', '👎', '❤️', '🔥', '🥰', '👏', '😁', '🤔',
  '🤯', '😱', '🤬', '😢', '🎉', '🤩', '🤮', '💩',
  '🙏', '👌', '🕊️', '🤡', '🥱', '🥴', '😍', '🐳',
  '❤️‍🔥', '🌚', '🌭', '💯', '🤣', '⚡', '🍌', '🏆',
  '💔', '🤨', '😐', '🍓', '🍾', '💋', '🖕', '😈',
  '😴', '😭', '🤓', '👻', '👨‍💻', '👀', '🎃', '🙈',
  '😇', '😨', '🤝', '✍️', '🤗', '🫡', '🎅', '🎄',
  '☃️', '💅', '🤪', '🗿', '🆒', '💘', '🙉', '🦄',
  '😘', '💊', '🙊', '😎', '👾', '🤷‍♂️', '🤷', '🤷‍♀️',
];

interface EmojiReactionsProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  currentReaction?: string;
}

export function EmojiReactions({ visible, onClose, onSelectEmoji, currentReaction }: EmojiReactionsProps) {
  const [showAll, setShowAll] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
    setShowAll(false);
  };

  const handleRemove = () => {
    onSelectEmoji(''); // Empty string removes reaction
    onClose();
    setShowAll(false);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          {!showAll ? (
            // Quick reactions bar
            <View style={styles.quickBar}>
              {QUICK_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    currentReaction === emoji && styles.emojiButtonActive,
                  ]}
                  onPress={() => handleSelect(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => setShowAll(true)}
              >
                <Text style={styles.moreText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Full emoji picker
            <View style={styles.fullPicker}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Выберите реакцию</Text>
                <TouchableOpacity onPress={() => setShowAll(false)}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.emojiGrid} contentContainerStyle={styles.emojiGridContent}>
                {ALL_REACTIONS.map((emoji, index) => (
                  <TouchableOpacity
                    key={`${emoji}-${index}`}
                    style={[
                      styles.gridEmoji,
                      currentReaction === emoji && styles.emojiButtonActive,
                    ]}
                    onPress={() => handleSelect(emoji)}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {currentReaction && (
                <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                  <Text style={styles.removeText}>Убрать реакцию</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// Inline reaction display
interface MessageReactionProps {
  emoji: string;
  count?: number;
  isMine?: boolean;
  onPress?: () => void;
}

export function MessageReaction({ emoji, count = 1, isMine, onPress }: MessageReactionProps) {
  if (!emoji) return null;

  return (
    <TouchableOpacity
      style={[styles.reactionBadge, isMine && styles.reactionBadgeMine]}
      onPress={onPress}
    >
      <Text style={styles.reactionEmoji}>{emoji}</Text>
      {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.xl,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  emojiButtonActive: {
    backgroundColor: COLORS.neonBlue + '30',
  },
  emoji: {
    fontSize: 24,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    marginLeft: SPACING.xs,
  },
  moreText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  fullPicker: {
    width: 320,
    maxHeight: 400,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  emojiGrid: {
    maxHeight: 280,
  },
  emojiGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    justifyContent: 'flex-start',
  },
  gridEmoji: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  removeButton: {
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  removeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  // Reaction badge (shown on messages)
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  reactionBadgeMine: {
    backgroundColor: 'rgba(0, 242, 255, 0.2)',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
});
