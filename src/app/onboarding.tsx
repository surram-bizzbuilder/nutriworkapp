import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip, colors, Field, H1, Muted, space, styles } from '../components/ui';
import { formatAmount } from '../lib/nutrients';
import {
  Allergy,
  Condition,
  Cuisine,
  DEFAULT_MEAL_TIMES,
  Diet,
  Goal,
  Intensity,
  JobActivity,
  MEAL_LABEL,
  MEAL_SLOTS,
  Profile,
  Sex,
  WorkMode,
  WorkoutPlace,
} from '../lib/profile';
import { useStore } from '../lib/store';
import { computeTargets } from '../lib/targets';

type Draft = Omit<Profile, 'age' | 'heightCm' | 'weightKg' | 'targetWeightKg' | 'createdAt'> & {
  age: string;
  heightCm: string;
  weightKg: string;
  targetWeightKg: string;
};

const INITIAL: Draft = {
  name: '',
  sex: 'male',
  age: '',
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  goal: 'maintain',
  workMode: 'home',
  jobActivity: 'desk',
  dailySteps: 4000,
  workoutDays: 3,
  workoutMinutes: 45,
  workoutIntensity: 'moderate',
  workoutPlace: 'home',
  sleepHours: 7,
  diet: 'vegetarian',
  allergies: [],
  cuisines: ['indian'],
  conditions: [],
  mealTimes: DEFAULT_MEAL_TIMES,
  remindersOn: true,
};

function Options<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={[styles.wrap, { marginBottom: space(3) }]}>
      {options.map((o) => (
        <Chip key={String(o.value)} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </View>
  );
}

function MultiOptions<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <View style={[styles.wrap, { marginBottom: space(3) }]}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <Chip
            key={o.value}
            label={o.label}
            selected={on}
            onPress={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
          />
        );
      })}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const num = (s: string) => Number(s.replace(',', '.'));
const validTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export default function Onboarding() {
  const { profile: existing, saveProfile } = useStore();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(() =>
    existing
      ? {
          ...existing,
          age: String(existing.age),
          heightCm: String(existing.heightCm),
          weightKg: String(existing.weightKg),
          targetWeightKg: existing.targetWeightKg ? String(existing.targetWeightKg) : '',
        }
      : INITIAL,
  );
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const profile: Profile | undefined = useMemo(() => {
    const age = num(d.age);
    const h = num(d.heightCm);
    const w = num(d.weightKg);
    if (!(age >= 18 && age <= 100 && h >= 120 && h <= 230 && w >= 30 && w <= 300)) return undefined;
    const tw = num(d.targetWeightKg);
    return {
      ...d,
      name: d.name.trim(),
      age,
      heightCm: h,
      weightKg: w,
      targetWeightKg: tw >= 30 && tw <= 300 ? tw : undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
  }, [d, existing]);

  const steps = [
    {
      title: 'About you',
      subtitle: 'Your body numbers set your energy needs.',
      valid: !!profile && d.name.trim().length > 0,
      body: (
        <>
          <Field label="What should we call you?" value={d.name} onChangeText={(v) => set('name', v)} placeholder="Your name" />
          <Label>Sex (for energy and vitamin needs)</Label>
          <Options<Sex> value={d.sex} onChange={(v) => set('sex', v)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          <Field label="Age" value={d.age} onChangeText={(v) => set('age', v)} keyboardType="number-pad" suffix="years" placeholder="18 – 100" />
          <Field label="Height" value={d.heightCm} onChangeText={(v) => set('heightCm', v)} keyboardType="decimal-pad" suffix="cm" placeholder="e.g. 170" />
          <Field label="Weight" value={d.weightKg} onChangeText={(v) => set('weightKg', v)} keyboardType="decimal-pad" suffix="kg" placeholder="e.g. 70" />
          {d.age !== '' && num(d.age) < 18 ? <Muted style={{ color: colors.danger }}>This version is designed for adults 18 and over.</Muted> : null}
        </>
      ),
    },
    {
      title: 'Your workday',
      subtitle: 'Working from home burns less than commuting and walking around an office.',
      valid: true,
      body: (
        <>
          <Label>Where do you work most days?</Label>
          <Options<WorkMode> value={d.workMode} onChange={(v) => set('workMode', v)} options={[{ value: 'home', label: 'From home' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'office', label: 'Office / on site' }]} />
          <Label>How active is your job?</Label>
          <Options<JobActivity> value={d.jobActivity} onChange={(v) => set('jobActivity', v)} options={[{ value: 'desk', label: 'Mostly sitting' }, { value: 'onFeet', label: 'On my feet' }, { value: 'manual', label: 'Physical labour' }]} />
          <Label>Steps on a typical day</Label>
          <Options<number> value={d.dailySteps} onChange={(v) => set('dailySteps', v)} options={[{ value: 3000, label: 'Under 4k' }, { value: 5500, label: '4k – 7k' }, { value: 8500, label: '7k – 10k' }, { value: 12000, label: '10k+' }]} />
          <Label>Sleep per night</Label>
          <Options<number> value={d.sleepHours} onChange={(v) => set('sleepHours', v)} options={[5, 6, 7, 8, 9].map((h) => ({ value: h, label: `${h}${h === 9 ? '+' : ''} h` }))} />
        </>
      ),
    },
    {
      title: 'Exercise',
      subtitle: 'Workouts raise your calorie and protein needs.',
      valid: true,
      body: (
        <>
          <Label>Where do you work out?</Label>
          <Options<WorkoutPlace> value={d.workoutPlace} onChange={(v) => set('workoutPlace', v)} options={[{ value: 'none', label: "I don't yet" }, { value: 'home', label: 'At home' }, { value: 'gym', label: 'Gym' }, { value: 'sports', label: 'Sports / running' }]} />
          {d.workoutPlace !== 'none' ? (
            <>
              <Label>Days per week</Label>
              <Options<number> value={d.workoutDays} onChange={(v) => set('workoutDays', v)} options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: String(n) }))} />
              <Label>Minutes per session</Label>
              <Options<number> value={d.workoutMinutes} onChange={(v) => set('workoutMinutes', v)} options={[20, 30, 45, 60, 90].map((n) => ({ value: n, label: `${n} min` }))} />
              <Label>How hard?</Label>
              <Options<Intensity> value={d.workoutIntensity} onChange={(v) => set('workoutIntensity', v)} options={[{ value: 'light', label: 'Light (walk, yoga)' }, { value: 'moderate', label: 'Moderate' }, { value: 'intense', label: 'Intense (HIIT, heavy lifting)' }]} />
            </>
          ) : null}
        </>
      ),
    },
    {
      title: 'Your goal',
      subtitle: 'We plan your day around it.',
      valid: true,
      body: (
        <>
          <Options<Goal> value={d.goal} onChange={(v) => set('goal', v)} options={[{ value: 'lose', label: 'Lose fat' }, { value: 'maintain', label: 'Stay healthy' }, { value: 'gain', label: 'Build muscle' }]} />
          {d.goal !== 'maintain' ? (
            <Field label="Target weight (optional)" value={d.targetWeightKg} onChangeText={(v) => set('targetWeightKg', v)} keyboardType="decimal-pad" suffix="kg" />
          ) : null}
          <Label>Anything we should plan around?</Label>
          <MultiOptions<Condition>
            value={d.conditions}
            onChange={(v) => set('conditions', v)}
            options={[
              { value: 'diabetes', label: 'Diabetes / prediabetes' },
              { value: 'hypertension', label: 'High blood pressure' },
              ...(d.sex === 'female'
                ? ([{ value: 'pregnant', label: 'Pregnant' }, { value: 'breastfeeding', label: 'Breastfeeding' }] as { value: Condition; label: string }[])
                : []),
            ]}
          />
          <Muted>This app gives general guidance, not medical advice.</Muted>
        </>
      ),
    },
    {
      title: 'What you eat',
      subtitle: 'Suggestions and recipes will match these.',
      valid: d.cuisines.length > 0,
      body: (
        <>
          <Label>Diet</Label>
          <Options<Diet> value={d.diet} onChange={(v) => set('diet', v)} options={[{ value: 'nonveg', label: 'Non-vegetarian' }, { value: 'eggetarian', label: 'Eggetarian' }, { value: 'vegetarian', label: 'Vegetarian' }, { value: 'vegan', label: 'Vegan' }]} />
          <Label>Allergies or foods to avoid</Label>
          <MultiOptions<Allergy> value={d.allergies} onChange={(v) => set('allergies', v)} options={[{ value: 'nuts', label: 'Nuts' }, { value: 'dairy', label: 'Dairy' }, { value: 'gluten', label: 'Gluten' }, { value: 'egg', label: 'Egg' }, { value: 'soy', label: 'Soy' }, { value: 'seafood', label: 'Seafood' }]} />
          <Label>Cuisines you enjoy</Label>
          <MultiOptions<Cuisine> value={d.cuisines} onChange={(v) => set('cuisines', v)} options={[{ value: 'indian', label: 'Indian' }, { value: 'mediterranean', label: 'Mediterranean' }, { value: 'eastAsian', label: 'East Asian' }, { value: 'mexican', label: 'Mexican' }, { value: 'american', label: 'American' }, { value: 'middleEastern', label: 'Middle Eastern' }]} />
        </>
      ),
    },
    {
      title: 'Meal times',
      subtitle: 'A gentle nudge at each meal keeps your log complete.',
      valid: MEAL_SLOTS.every((m) => validTime(d.mealTimes[m])),
      body: (
        <>
          {MEAL_SLOTS.map((m) => (
            <Field
              key={m}
              label={MEAL_LABEL[m]}
              value={d.mealTimes[m]}
              onChangeText={(v) => set('mealTimes', { ...d.mealTimes, [m]: v })}
              placeholder="HH:MM"
              suffix={validTime(d.mealTimes[m]) ? '' : '24h, e.g. 13:00'}
            />
          ))}
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.label}>Meal reminders</Text>
            <Switch value={d.remindersOn} onValueChange={(v) => set('remindersOn', v)} trackColor={{ true: colors.brand }} />
          </View>
        </>
      ),
    },
  ];

  const isSummary = step === steps.length;
  const current = steps[step];
  const targets = profile ? computeTargets(profile) : undefined;

  const finish = async () => {
    if (!profile) return;
    await saveProfile(profile);
    router.replace('/today');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space(5), paddingBottom: space(10) }} keyboardShouldPersistTaps="handled">
          <View style={[styles.row, { marginBottom: space(5) }]}>
            {[...steps, null].map((_, i) => (
              <View
                key={i}
                style={{ flex: 1, height: 4, borderRadius: 2, marginRight: 4, backgroundColor: i <= step ? colors.brand : colors.line }}
              />
            ))}
          </View>
          {isSummary && profile && targets ? (
            <>
              <H1>{`Your daily plan, ${profile.name}`}</H1>
              <Muted style={{ marginBottom: space(4) }}>
                {`Based on a resting burn of ${targets.bmr} kcal and an activity level of ${targets.pal}, you use about ${targets.tdee} kcal a day.`}
              </Muted>
              <Card>
                <Text style={{ fontSize: 40, fontWeight: '800', color: colors.brand }}>{targets.nutrients.kcal}</Text>
                <Muted>calories per day</Muted>
                <View style={[styles.row, { marginTop: space(4), justifyContent: 'space-between' }]}>
                  {(['protein', 'carbs', 'fat', 'fiber'] as const).map((k) => (
                    <View key={k}>
                      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>{formatAmount(k, targets.nutrients[k])}</Text>
                      <Muted>{k[0].toUpperCase() + k.slice(1)}</Muted>
                    </View>
                  ))}
                </View>
              </Card>
              {targets.notes.map((n) => (
                <Muted key={n} style={{ marginBottom: space(2) }}>{`• ${n}`}</Muted>
              ))}
              <Muted style={{ marginBottom: space(6) }}>
                Vitamin and mineral targets follow the Dietary Reference Intakes for your age and sex. You can see them all on the Nutrients tab.
              </Muted>
              <Button title="Start tracking" onPress={finish} />
              <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ marginTop: space(2) }} />
            </>
          ) : current ? (
            <>
              <H1>{current.title}</H1>
              <Muted style={{ marginBottom: space(5) }}>{current.subtitle}</Muted>
              {current.body}
              <View style={{ marginTop: space(4) }}>
                <Button title="Continue" disabled={!current.valid} onPress={() => setStep(step + 1)} />
                {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={{ marginTop: space(2) }} /> : null}
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

