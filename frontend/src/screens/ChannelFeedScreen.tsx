/**
 * Channel Feed Screen
 * Displays posts with media support
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Linking,
  Image,
  Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { ChannelPost, MediaItem, getChannelPosts, formatViews, formatPostTime } from '../data/mockChannelPosts';
import { PostSkeleton } from '../components/SkeletonLoader';
import { MediaViewer } from '../components/MediaViewer';

export default function ChannelFeedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [posts, setPosts] = useState<ChannelPost[]>(getChannelPosts(id || 'kraken_news'));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);

  const channelTitle = id === 'kraken_news' ? 'Kraken News' : 'Канал';

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(r => setTimeout(r, 1000));
    setPosts(getChannelPosts(id || 'kraken_news'));
    setRefreshing(false);
  }, [id]);

  const handleOpenTelegram = () => {
    Alert.alert(
      'Перейти в Telegram',
      'Вы переходите во внешний канал Telegram. Приложение будет свёрнуто.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Перейти',
          onPress: async () => {
            const telegramUrl = 'https://t.me/+GsJRkVsUS6U5OTc5';
            const canOpen = await Linking.canOpenURL(telegramUrl);
            if (canOpen) {
              Linking.openURL(telegramUrl);
            } else {
              // Fallback to web
              Linking.openURL(telegramUrl);
            }
          },
        },
      ]
    );
  };

  const handleMediaPress = (media: MediaItem) => {
    if (media.type === 'image' || media.type === 'video') {
      setSelectedMedia(media);
      setShowMediaViewer(true);
    } else if (media.type === 'document') {
      Alert.alert('Документ', `Файл: ${media.filename}`);
    }
  };

  const renderMediaGrid = (media: MediaItem[]) => {
    if (media.length === 0) return null;
    
    const images = media.filter(m => m.type === 'image');
    const videos = media.filter(m => m.type === 'video');
    const audio = media.filter(m => m.type === 'audio');
    const docs = media.filter(m => m.type === 'document');

    return (
      <View style={styles.mediaContainer}>
        {/* Images Grid */}
        {images.length > 0 && (
          <View style={[
            styles.imageGrid,
            images.length === 1 && styles.imageGridSingle,
            images.length === 2 && styles.imageGridTwo,
            images.length >= 3 && styles.imageGridThree,
          ]}>
            {images.slice(0, 4).map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageWrapper,
                  images.length === 1 && styles.imageSingle,
                  images.length === 2 && styles.imageHalf,
                  images.length >= 3 && index === 0 && styles.imageLarge,
                ]}
                onPress={() => handleMediaPress(img)}
              >
                <ExpoImage
                  source={{ uri: img.uri }}
                  style={styles.mediaImage}
                  contentFit="cover"
                  transition={200}
                />
                {images.length > 4 && index === 3 && (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreText}>+{images.length - 4}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Video */}
        {videos.map((video, index) => (
          <TouchableOpacity
            key={`video-${index}`}
            style={styles.videoContainer}
            onPress={() => handleMediaPress(video)}
          >
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={48} color={COLORS.textPrimary} />
              <Text style={styles.videoDuration}>
                {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Видео'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Audio */}
        {audio.map((aud, index) => (
          <TouchableOpacity
            key={`audio-${index}`}
            style={styles.audioContainer}
            onPress={() => handleMediaPress(aud)}
          >
            <Ionicons name="musical-notes" size={24} color={COLORS.neonBlue} />
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>{aud.filename || 'Аудио'}</Text>
              <Text style={styles.audioDuration}>
                {aud.duration ? `${Math.floor(aud.duration / 60)}:${(aud.duration % 60).toString().padStart(2, '0')}` : ''}
              </Text>
            </View>
            <Ionicons name="play" size={24} color={COLORS.neonBlue} />
          </TouchableOpacity>
        ))}

        {/* Documents */}
        {docs.map((doc, index) => (
          <TouchableOpacity
            key={`doc-${index}`}
            style={styles.docContainer}
            onPress={() => handleMediaPress(doc)}
          >
            <Ionicons name="document" size={24} color={COLORS.neonPurple} />
            <View style={styles.docInfo}>
              <Text style={styles.docName} numberOfLines={1}>{doc.filename || 'Документ'}</Text>
              <Text style={styles.docSize}>
                {doc.size ? `${(doc.size / 1024).toFixed(0)} KB` : ''}
              </Text>
            </View>
            <Ionicons name="download" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPost = ({ item }: { item: ChannelPost }) => (
    <View style={[styles.post, item.isPinned && styles.postPinned]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.channelAvatar}>
          <Ionicons name="megaphone" size={20} color={COLORS.neonBlue} />
        </View>
        <View style={styles.postHeaderInfo}>
          <View style={styles.postTitleRow}>
            <Text style={styles.channelName}>{channelTitle}</Text>
            {item.isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={12} color={COLORS.neonBlue} />
                <Text style={styles.pinnedText}>Закреплено</Text>
              </View>
            )}
          </View>
          <Text style={styles.postTime}>{formatPostTime(item.timestamp)}</Text>
        </View>
      </View>

      {/* Content */}
      {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
      <Text style={styles.postText}>{item.text}</Text>

      {/* Media */}
      {renderMediaGrid(item.media)}

      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <Ionicons name="eye-outline" size={16} color={COLORS.textDim} />
          <Text style={styles.statText}>{formatViews(item.views)}</Text>
        </View>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="heart-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{formatViews(item.likes)}</Text>
        </TouchableOpacity>
        {item.hasReplies && (
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>{item.replyCount}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{channelTitle}</Text>
          <Text style={styles.headerSubtitle}>{posts.length} публикаций</Text>
        </View>
        
        <TouchableOpacity onPress={handleOpenTelegram} style={styles.externalButton}>
          <Ionicons name="open-outline" size={22} color={COLORS.neonBlue} />
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlashList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        estimatedItemSize={300}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.neonBlue}
            colors={[COLORS.neonBlue]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={COLORS.textDim} />
            <Text style={styles.emptyText}>Нет публикаций</Text>
          </View>
        }
      />

      {/* Media Viewer Modal */}
      <MediaViewer
        visible={showMediaViewer}
        media={selectedMedia}
        onClose={() => {
          setShowMediaViewer(false);
          setSelectedMedia(null);
        }}
      />
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
  headerCenter: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  externalButton: {
    padding: SPACING.sm,
  },
  post: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postPinned: {
    backgroundColor: 'rgba(0, 242, 255, 0.05)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 242, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  postTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    backgroundColor: 'rgba(0, 242, 255, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  pinnedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.neonBlue,
    marginLeft: 4,
  },
  postTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  postText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  mediaContainer: {
    marginTop: SPACING.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  imageGridSingle: {},
  imageGridTwo: {
    gap: 2,
  },
  imageGridThree: {
    gap: 2,
  },
  imageWrapper: {
    overflow: 'hidden',
  },
  imageSingle: {
    width: '100%',
    height: 250,
    borderRadius: BORDER_RADIUS.lg,
  },
  imageHalf: {
    width: '49.5%',
    height: 180,
  },
  imageLarge: {
    width: '100%',
    height: 200,
    marginBottom: 2,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#fff',
  },
  videoContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  audioInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  audioTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  audioDuration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  docContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  docInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  docName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  docSize: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginLeft: 4,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
    padding: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    marginTop: SPACING.md,
  },
});
