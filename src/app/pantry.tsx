import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { CookingMode } from '../components/CookingMode';
import { Button, Card, colors, H2, Muted, space, styles } from '../components/ui';
import { apiConfigured, pantryDishes, PantryDish, PantryIdeas, pickImage, PickedImage } from '../lib/api';
import { summarizeDay } from '../lib/guidance';
import { NUTRIENT_META, zeroNutrients } from '../lib/nutrients';
import { MEAL_LABEL } from '../lib/profile';
import { dateKey, newId, useStore } from '../lib/store';

export default function Pantry() {
  const { profile, targets, entriesFor, addEntries } = useStore();
  const [image, setImage] = useState<PickedImage>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [ideas, setIdeas] = useState<PantryIdeas>();
  const [open, setOpen] = useState<number>();
  const [cooking, setCooking] = useState<PantryDish>();
  const [logged, setLogged] = useState<string>();

  const next = useMemo(
    () => (profile && targets ? summarizeDay(entriesFor(dateKey()), targets.nutrients, profile).next : undefined),
    [profile, targets, entriesFor],
  );

  if (!profile || !targets) return null;

  const run = async (source: 'camera' | 'library') => {
    setError(undefined);
    try {
      const img = await pickImage(source);
      if (!img) return;
      setImage(img);
      setIdeas(undefined);
      setBusy(true);
      setIdeas(
        await pantryDishes(img, {
          diet: profile.diet,
          allergies: profile.allergies,
          cuisines: profile.cuisines,
          meal: next ? MEAL_LABEL[next.meal].toLowerCase() : 'a meal',
          targetKcal: next?.target.kcal ?? targets.nutrients.kcal * 0.3,
          targetProtein: next?.target.protein ?? targets.nutrients.protein * 0.3,
          lowOn: (next?.focus ?? []).filter((f) => f.tone === 'boost').map((f) => NUTRIENT_META[f.key].label.toLowerCase()),
        }),
      );
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const logDish = async (d: PantryDish) => {
    const nutrients = { ...zeroNutrients(), ...d.perServing };
    const meal = next?.meal ?? 'dinner';
    await addEntries([
      {
        id: newId(),
        date: dateKey(),
        meal,
        name: `${d.name} (1 serving)`,
        grams: Math.round(d.ingredients.reduce((s, i) => s + i.grams, 0) / Math.max(1, d.servings)),
        nutrients,
        source: 'recipe',
        createdAt: new Date().toISOString(),
      },
    ]);
    setLogged(d.name);
  };

  if (cooking) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space(4) }}>
        <H2>{cooking.name}</H2>
        <CookingMode steps={cooking.steps} onExit={() => setCooking(undefined)} onDone={() => setCooking(undefined)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
      <Muted style={{ marginBottom: space(4) }}>
        {next
          ? `Take a photo of what's in your fridge or on your counter. We'll suggest the dish that best fills your ${MEAL_LABEL[next.meal].toLowerCase()} target (about ${Math.round(next.target.kcal)} kcal, ${Math.round(next.target.protein)} g protein).`
          : "Take a photo of what's in your fridge or on your counter and we'll suggest the most nutritious dish you can make."}
      </Muted>

      {!apiConfigured ? (
        <Card style={{ backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
          <Text style={{ color: colors.ink }}>This feature needs the NutriWork server to be running.</Text>
        </Card>
      ) : null}

      {image ? <Image source={{ uri: image.uri }} style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: space(3) }} /> : null}
      {busy ? (
        <Card style={{ alignItems: 'center' }}>
          <ActivityIndicator color={colors.brand} />
          <Muted style={{ marginTop: space(2) }}>Spotting ingredients and planning dishes…</Muted>
        </Card>
      ) : null}
      {error ? (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
          <Text style={{ color: colors.danger }}>{error}</Text>
        </Card>
      ) : null}

      {ideas ? (
        <>
          <Muted style={{ marginBottom: space(3) }}>{`Spotted: ${ideas.ingredients.join(', ')}`}</Muted>
          {ideas.dishes.map((d, i) => (
            <Card key={d.name} style={i === 0 ? { borderColor: colors.brand, borderWidth: 1.5 } : undefined}>
              {i === 0 ? <Text style={{ color: colors.brand, fontWeight: '700', marginBottom: space(1) }}>BEST PICK</Text> : null}
              <Pressable onPress={() => setOpen(open === i ? undefined : i)}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>{d.name}</Text>
                <Muted>{`${d.cuisine} · ${d.minutes} min · ${Math.round(d.perServing.kcal)} kcal · ${Math.round(d.perServing.protein)} g protein per serving`}</Muted>
                <Text style={{ color: colors.ink, marginTop: space(2) }}>{d.why}</Text>
              </Pressable>
              {open === i ? (
                <View style={{ marginTop: space(3) }}>
                  <Text style={styles.label}>Ingredients</Text>
                  {d.ingredients.map((ing) => (
                    <Text key={ing.name} style={{ color: colors.ink, paddingVertical: 2 }}>
                      {`•  ${ing.grams} g ${ing.name}${ing.fromPhoto ? '' : ' (pantry)'}`}
                    </Text>
                  ))}
                  <Text style={[styles.label, { marginTop: space(3) }]}>Steps</Text>
                  {d.steps.map((s, j) => (
                    <Text key={j} style={{ color: colors.ink, paddingVertical: 3, lineHeight: 20 }}>{`${j + 1}. ${s}`}</Text>
                  ))}
                  <Button title="👩‍🍳  Cook step by step" onPress={() => setCooking(d)} style={{ marginTop: space(3) }} />
                  <Button
                    title={logged === d.name ? 'Logged ✓' : 'I ate a serving'}
                    variant="secondary"
                    disabled={logged === d.name}
                    onPress={() => logDish(d)}
                    style={{ marginTop: space(2) }}
                  />
                </View>
              ) : (
                <Muted style={{ marginTop: space(2) }}>Tap for ingredients and steps</Muted>
              )}
            </Card>
          ))}
        </>
      ) : null}

      {!busy ? (
        <View style={{ marginTop: space(3) }}>
          <Button title={ideas ? 'Try another photo' : '📷  Photograph my ingredients'} variant={ideas ? 'secondary' : 'primary'} onPress={() => run('camera')} />
          <Button title="Choose from gallery" variant="ghost" onPress={() => run('library')} style={{ marginTop: space(2) }} />
        </View>
      ) : null}
    </ScrollView>
  );
}
