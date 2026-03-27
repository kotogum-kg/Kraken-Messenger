/**
 * Voice Recording Hook
 * Uses expo-audio for recording audio on mobile
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';

interface VoiceRecordingResult {
  uri: string | null;
  duration: number;
}

export function useVoiceRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500); // Update every 500ms
  
  const [permissionGranted, setPermissionGranted] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      try {
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        setPermissionGranted(granted);
        
        if (granted) {
          await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
        }
      } catch (error) {
        console.error('Error requesting audio permissions:', error);
      }
    })();
  }, []);

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      if (!permissionGranted) {
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert(
            'Требуется разрешение',
            'Для записи голосовых сообщений нужен доступ к микрофону'
          );
          return false;
        }
        setPermissionGranted(true);
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      startTimeRef.current = Date.now();

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
      return false;
    }
  }, [permissionGranted, recorder]);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<VoiceRecordingResult | null> => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      return { uri, duration };
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }, [recorder]);

  // Cancel recording
  const cancelRecording = useCallback(async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }
      
      await setAudioModeAsync({
        allowsRecording: false,
      });
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }, [recorder, recorderState.isRecording]);

  // Get base64 from uri
  const getBase64 = useCallback(async (uri: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        // For web, fetch the blob and convert to base64
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
        // For native, use FileSystem
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
      }
    } catch (error) {
      console.error('Error converting to base64:', error);
      return null;
    }
  }, []);

  // Computed duration in seconds
  const duration = Math.floor((recorderState.durationMillis || 0) / 1000);

  return {
    isRecording: recorderState.isRecording,
    duration,
    uri: recorder.uri,
    startRecording,
    stopRecording,
    cancelRecording,
    getBase64,
  };
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
