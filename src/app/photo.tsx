import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { Button, Card, Chip, colors, Muted, space, styles } from '../components/ui';
import { FOOD_BY_ID } from '../data/foods';
import { apiConfigured, MealRecognition, pickImage, PickedImage, recognizeMeal, RecognizedItem } from '../lib/api';
import { per100gFor, photoEntries } from '../lib/photoLog';
import { MEAL_LABEL, MEAL_SLOTS, MealSlot } from '../lib/profile';
import { dateKey, newId, useStore } from '../lib/store';

const CONFIDENCE_COLOR = { high: colors.brand, medium: colors.accent, low: colors.danger };

function Stepper({ value, onChange, step, unit }: { value: number; onChange: (v: number) => void; step: number; unit: string }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityLabel="Less" onPress={() => onChange(Math.max(0, value - step))} style={stepBtn}>
        <Text style={stepTxt}>−</Text>
      </Pressable>
      <Text style={{ minWidth: 64, textAlign: 'center', color: colors.ink, fontWeight: '600' }}>{`${Math.round(value * 10) / 10} ${unit}`}</Text>
      <Pressable accessibilityLabel="More" onPress={() => onChange(value + step)} style={stepBtn}>
        <Text style={stepTxt}>+</Text>
      </Pressable>
    </View>
  );
}
const stepBtn = { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandSoft, alignItems: 'center' as const, justifyContent: 'center' as const };
const stepTxt = { color: colors.brand, fontSize: 18, fontWeight: '700' as const };

export default function PhotoLog() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const { addEntries } = useStore();
  const [meal, setMeal] = useState<MealSlot>(MEAL_SLOTS.includes(params.meal as MealSlot) ? (params.meal as MealSlot) : 'lunch');
  const [image, setImage] = useState<PickedImage>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<MealRecognition>();

  const analyse = async (source: 'camera' | 'library') => {
    setError(undefined);
    try {
      const img = await pickImage(source);
      if (!img) return;
      setImage(img);
      setResult(undefined);
      setBusy(true);
      setResult(await recognizeMeal(img));
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const update = (i: number, patch: Partial<RecognizedItem>) =>
    setResult((r) => r && { ...r, items: r.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const remove = (i: number) => setResult((r) => r && { ...r, items: r.items.filter((_, j) => j !== i) });

  const totals = (result?.items ?? []).reduce(
    (acc, it) => {
      const p = per100gFor(it);
      const oil = it.cookingFat ? (FOOD_BY_ID[it.cookingFat.catalogueId]?.per100g.kcal ?? 884) * (it.cookingFat.grams / 100) : 0;
      return { kcal: acc.kcal + (p.kcal * it.grams) / 100 + oil, protein: acc.protein + (p.protein * it.grams) / 100 };
    },
    { kcal: 0, protein: 0 },
  );

  const save = async () => {
    if (!result) return;
    await addEntries(photoEntries(result.items, meal, dateKey(), newId));
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
      <View style={styles.wrap}>
        {MEAL_SLOTS.map((m) => (
          <Chip key={m} label={MEAL_LABEL[m]} selected={m === meal} onPress={() => setMeal(m)} />
        ))}
      </View>

      {!apiConfigured ? (
        <Card style={{ backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
          <Text style={{ color: colors.ink }}>Photo recognition needs the NutriWork server to be running. Until then, log foods by searching.</Text>
        </Card>
      ) : null}

      {image ? <Image source={{ uri: image.uri }} style={{ width: '100%', height: 220, borderRadius: 16, marginBottom: space(3) }} /> : null}

      {busy ? (
        <Card style={{ alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} />
          <Muted style={{ marginTop: space(2) }}>Looking at your plate and estimating portions…</Muted>
        </Card>
      ) : null}

      {error ? (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </Card>
      ) : null}

      {result ? (
        <>
          {result.items.map((it, i) => (
            <Card key={`${it.name}-${i}`}>
              <View style={[styles.row, { justifyContent: 'space-between', marginBottom: space(2) }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, flex: 1 }}>{it.name}</Text>
                <Text style={{ color: CONFIDENCE_COLOR[it.confidence], fontSize: 12, marginRight: space(3) }}>{`${it.confidence} confidence`}</Text>
                <Pressable accessibilityLabel={`Remove ${it.name}`} onPress={() => remove(i)} hitSlop={10}>
                  <Text style={{ color: colors.muted }}>✕</Text>
                </Pressable>
              </View>
              <View style={[styles.row, { justifyContent: 'space-between' }]}>
                <Muted>Portion</Muted>
                <Stepper value={it.grams} step={Math.max(10, Math.round(it.grams * 0.1))} unit="g" onChange={(g) => update(i, { grams: g })} />
              </View>
              <View style={[styles.row, { justifyContent: 'space-between', marginTop: space(2) }]}>
                <Muted>Oil or ghee used</Muted>
                <Stepper
                  value={it.cookingFat?.grams ?? 0}
                  step={2.5}
                  unit="g"
                  onChange={(g) => update(i, { cookingFat: { catalogueId: it.cookingFat?.catalogueId ?? 'oil_sunflower', grams: g } })}
                />
              </View>
            </Card>
          ))}
          {result.items.length ? (
            <>
              <Muted style={{ marginBottom: space(1) }}>{result.notes}</Muted>
              <Text style={{ color: colors.ink, fontWeight: '700', marginBottom: space(3) }}>
                {`About ${Math.round(totals.kcal)} kcal · ${Math.round(totals.protein)} g protein`}
              </Text>
              <Button title={`Add to ${MEAL_LABEL[meal].toLowerCase()}`} onPress={save} />
            </>
          ) : (
            <Muted>{result.notes || 'No food found in this photo.'}</Muted>
          )}
        </>
      ) : null}

      {!busy ? (
        <View style={{ marginTop: space(3) }}>
          <Button title={result ? 'Retake photo' : '📷  Take a photo'} variant={result ? 'secondary' : 'primary'} onPress={() => analyse('camera')} />
          <Button title="Choose from gallery" variant="ghost" onPress={() => analyse('library')} style={{ marginTop: space(2) }} />
        </View>
      ) : null}
    </ScrollView>
  );
}
