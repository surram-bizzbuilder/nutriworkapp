import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '../components/ui';
import { useStore } from '../lib/store';

export default function Index() {
  const { ready, profile } = useStore();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  return <Redirect href={profile ? '/today' : '/onboarding'} />;
}
