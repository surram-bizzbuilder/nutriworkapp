import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { colors } from '../../components/ui';

const icon = (glyph: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{glyph}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        // Inset rounded bar with a raised pill behind the active tab.
        tabBarStyle: {
          backgroundColor: colors.bgRaised,
          borderTopWidth: 0,
          borderRadius: 34,
          marginHorizontal: 16,
          marginBottom: 16,
          height: 68,
          paddingHorizontal: 6,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarItemStyle: { borderRadius: 28, marginHorizontal: 2, overflow: 'hidden' },
        tabBarActiveBackgroundColor: colors.cardStrong,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: icon('🥗') }} />
      <Tabs.Screen name="recipes" options={{ title: 'Cook', tabBarIcon: icon('🍳') }} />
      <Tabs.Screen name="nutrients" options={{ title: 'Nutrients', tabBarIcon: icon('📊') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
