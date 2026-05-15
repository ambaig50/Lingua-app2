import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import SplashScreen from '../src/components/SplashScreen';
import { HistoryProvider } from '../src/hooks/useTranslationHistory';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await Camera.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch {}
    }
    init();
  }, []);

  return (
    // ✅ HistoryProvider wraps everything — all tabs share same history state
    <HistoryProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A6EBD" translucent={false} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </SafeAreaProvider>
    </HistoryProvider>
  );
}
