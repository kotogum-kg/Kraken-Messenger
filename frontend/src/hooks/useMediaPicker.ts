/**
 * Media Picker Hook
 * Uses expo-image-picker for selecting photos/videos
 */
import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface MediaResult {
  uri: string;
  type: 'image' | 'video';
  fileName: string;
  base64?: string;
}

export function useMediaPicker() {
  const [loading, setLoading] = useState(false);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Требуется разрешение',
          'Для отправки фото нужен доступ к камере и галерее'
        );
        return false;
      }
    }
    return true;
  }, []);

  // Pick from library
  const pickFromLibrary = useCallback(async (): Promise<MediaResult | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      const isVideo = asset.type === 'video';
      
      return {
        uri: asset.uri,
        type: isVideo ? 'video' : 'image',
        fileName: asset.fileName || `media_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
        base64: asset.base64,
      };
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать медиа');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermissions]);

  // Take photo with camera
  const takePhoto = useCallback(async (): Promise<MediaResult | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      
      return {
        uri: asset.uri,
        type: 'image',
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        base64: asset.base64,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermissions]);

  // Record video
  const recordVideo = useCallback(async (): Promise<MediaResult | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      
      // Read as base64 for video (not included by default)
      let base64 = undefined;
      if (Platform.OS !== 'web') {
        try {
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (e) {
          console.warn('Could not read video as base64:', e);
        }
      }
      
      return {
        uri: asset.uri,
        type: 'video',
        fileName: asset.fileName || `video_${Date.now()}.mp4`,
        base64,
      };
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Ошибка', 'Не удалось записать видео');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermissions]);

  // Get base64 from URI
  const getBase64 = useCallback(async (uri: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        return await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
    } catch (error) {
      console.error('Error converting to base64:', error);
      return null;
    }
  }, []);

  return {
    loading,
    pickFromLibrary,
    takePhoto,
    recordVideo,
    getBase64,
  };
}
