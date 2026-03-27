/**
 * Media Viewer Component
 * Full-screen viewer for images and videos with pinch-to-zoom
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { MediaItem } from '../data/mockChannelPosts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaViewerProps {
  visible: boolean;
  media: MediaItem | null;
  onClose: () => void;
}

// Video player component with expo-video
function VideoPlayerView({ uri, onLoad }: { uri: string; onLoad: () => void }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <VideoView
      style={styles.video}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls
    />
  );
}

export function MediaViewer({ visible, media, onClose }: MediaViewerProps) {
  const [loading, setLoading] = useState(true);

  // Reset loading state when media changes
  useEffect(() => {
    if (media) {
      setLoading(true);
    }
  }, [media]);

  if (!media) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.neonBlue} />
          </View>
        )}

        {/* Image */}
        {media.type === 'image' && (
          <ExpoImage
            source={{ uri: media.uri }}
            style={styles.image}
            contentFit="contain"
            onLoadEnd={() => setLoading(false)}
            transition={200}
          />
        )}

        {/* Video */}
        {media.type === 'video' && (
          <View style={styles.videoContainer}>
            <VideoPlayerView 
              uri={media.uri} 
              onLoad={() => setLoading(false)} 
            />
          </View>
        )}

        {/* Bottom info */}
        <View style={styles.infoBar}>
          {media.type === 'video' && media.duration && (
            <Text style={styles.infoText}>
              {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  infoBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
});
