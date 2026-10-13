import { router } from 'expo-router';
import React from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, colors, H1, H2, Muted, space, styles } from '../../components/ui';
import { MEAL_LABEL, MEAL_SLOTS } from '../../lib/profile';
import { useStore } from '../../lib/store';

const LABELS: Record<string, string> = {
  home: 'Works from home',
  office: 'Goes to the office',
  hybrid: 'Hybrid work',
  lose: 'Lose fat',
  maintain: 'Stay healthy',
  gain: 'Build muscle',
  nonveg: 'Non-vegetarian',
  eggetarian: 'Eggetarian',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
};

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.row, { justifyContent: 'space-between', paddingVertical: space(2) }]}>
      <Muted>{label}</Muted>
      <Text style={{ color: colors.ink, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, targets, resetAll } = useStore();
  if (!profile || !targets) return null;

  const reset = () => {
    const go = async () => {
      await resetAll();
      router.replace('/onboarding');
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (globalThis.confirm?.('Delete your profile and food log?')) go();
    } else {
      Alert.alert('Start over?', 'This deletes your profile and food log on this device.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: go },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
        <H1>{profile.name}</H1>
        <Muted style={{ marginBottom: space(4) }}>{`${LABELS[profile.goal]} · ${LABELS[profile.diet]}`}</Muted>
        <Card>
          <H2>You</H2>
          <Line label="Age" value={`${profile.age}`} />
          <Line label="Height" value={`${profile.heightCm} cm`} />
          <Line label="Weight" value={`${profile.weightKg} kg${profile.targetWeightKg ? ` → ${profile.targetWeightKg} kg` : ''}`} />
          <Line label="Work" value={LABELS[profile.workMode]} />
          <Line label="Workouts" value={profile.workoutPlace === 'none' ? 'None yet' : `${profile.workoutDays}× ${profile.workoutMinutes} min, ${profile.workoutIntensity}`} />
        </Card>
        <Card>
          <H2>Daily energy</H2>
          <Line label="Resting burn (BMR)" value={`${targets.bmr} kcal`} />
          <Line label="Activity level" value={`× ${targets.pal}`} />
          <Line label="Daily burn" value={`${targets.tdee} kcal`} />
          <Line label="Your target" value={`${targets.nutrients.kcal} kcal`} />
          <Line label="Protein" value={`${targets.proteinPerKg} g per kg`} />
        </Card>
        <Card>
          <H2>Meal reminders</H2>
          {MEAL_SLOTS.map((m) => (
            <Line key={m} label={MEAL_LABEL[m]} value={profile.remindersOn ? profile.mealTimes[m] : 'Off'} />
          ))}
        </Card>
        <Button title="Edit my answers" variant="secondary" onPress={() => router.push('/onboarding')} />
        <Button title="Start over" variant="ghost" onPress={reset} style={{ marginTop: space(2) }} />
      </ScrollView>
    </SafeAreaView>
  );
}
