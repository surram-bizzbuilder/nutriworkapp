import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReminderSync } from '../components/ReminderSync';
import { colors } from '../components/ui';
import { StoreProvider } from '../lib/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.bg }}>
      <StoreProvider>
        <StatusBar style="light" />
        <ReminderSync />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.ink,
            headerTitleAlign: 'center',
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="log" options={{ title: 'Log a meal', presentation: 'modal' }} />
          <Stack.Screen name="photo" options={{ title: 'Snap your plate', presentation: 'modal' }} />
          <Stack.Screen name="pantry" options={{ title: 'Cook from what I have' }} />
          <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
