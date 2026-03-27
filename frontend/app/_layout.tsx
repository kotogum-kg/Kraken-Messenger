/**
 * Root Layout for Kraken Messenger
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="pin-setup" />
        <Stack.Screen name="pin-auth" />
        <Stack.Screen name="hidden-chats" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </>
  );
}
