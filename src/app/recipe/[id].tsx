import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CookingMode } from '../../components/CookingMode';
import { Button, Card, Chip, colors, H2, Muted, space, styles } from '../../components/ui';
import { perServing, RECIPE_BY_ID, servingGrams } from '../../data/recipes';
import { pickNextMeal } from '../../lib/guidance';
import { MEAL_LABEL, MEAL_SLOTS, MealSlot } from '../../lib/profile';
import { dateKey, newId, useStore } from '../../lib/store';

function scaleText(text: string, grams: number | undefined, factor: number): string {
  if (factor === 1) return text;
  const f = Math.round(factor * 100) / 100;
  return grams ? `${text}  → use ${Math.round(grams * factor)} g` : `${text} (×${f})`;
}

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = RECIPE_BY_ID[id ?? ''];
  const { profile, addEntries, entriesFor } = useStore();
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [cooking, setCooking] = useState(false);
  const logged = entriesFor(dateKey()).map((e) => e.meal);
  const [meal, setMeal] = useState<MealSlot>(() => (profile ? pickNextMeal([...new Set(logged)], profile, new Date()) : undefined) ?? 'lunch');
  const [saved, setSaved] = useState(false);

  if (!recipe) return <Muted>Recipe not found.</Muted>;
  const ps = perServing(recipe);
  const factor = servings / recipe.servings;

  const logServing = async () => {
    await addEntries([
      {
        id: newId(),
        date: dateKey(),
        meal,
        name: `${recipe.name} (1 serving)`,
        grams: Math.round(servingGrams(recipe)),
        nutrients: ps,
        source: 'recipe',
        createdAt: new Date().toISOString(),
      },
    ]);
    setSaved(true);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
      <Stack.Screen options={{ title: recipe.name }} />
      {cooking ? (
        <CookingMode steps={recipe.steps} onExit={() => setCooking(false)} onDone={() => setCooking(false)} />
      ) : (
        <>
          <Text style={{ fontSize: 56, textAlign: 'center' }}>{recipe.emoji}</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.ink, textAlign: 'center' }}>{recipe.name}</Text>
          <Muted style={{ textAlign: 'center', marginBottom: space(4) }}>{`${recipe.minutes} min · serves ${recipe.servings}`}</Muted>

          <Card>
            <H2>Per serving</H2>
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              {([['kcal', 'kcal'], ['protein', 'g protein'], ['carbs', 'g carbs'], ['fat', 'g fat'], ['fiber', 'g fiber']] as const).map(([k, l]) => (
                <View key={k} style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>{Math.round(ps[k])}</Text>
                  <Muted style={{ fontSize: 12 }}>{l}</Muted>
                </View>
              ))}
            </View>
            <Muted style={{ marginTop: space(3) }}>Includes the cooking oil in the recipe.</Muted>
          </Card>

          <Card>
            <View style={[styles.row, { justifyContent: 'space-between', marginBottom: space(2) }]}>
              <H2>Ingredients</H2>
              <View style={styles.row}>
                <Button title="−" variant="secondary" onPress={() => setServings(Math.max(1, servings - 1))} style={{ paddingVertical: 4, paddingHorizontal: 12 }} />
                <Text style={{ marginHorizontal: space(3), color: colors.ink, fontWeight: '600' }}>{`${servings} serving${servings > 1 ? 's' : ''}`}</Text>
                <Button title="+" variant="secondary" onPress={() => setServings(servings + 1)} style={{ paddingVertical: 4, paddingHorizontal: 12 }} />
              </View>
            </View>
            {recipe.ingredients.map((ing) => (
              <Text key={ing.text} style={{ color: colors.ink, paddingVertical: space(1.5), lineHeight: 20 }}>{`•  ${scaleText(ing.text, ing.grams, factor)}`}</Text>
            ))}
          </Card>

          <Card>
            <H2>Steps</H2>
            {recipe.steps.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: space(3) }}>
                <Text style={{ color: colors.brand, fontWeight: '800', width: 24 }}>{i + 1}</Text>
                <Text style={{ color: colors.ink, flex: 1, lineHeight: 21 }}>{s}</Text>
              </View>
            ))}
          </Card>
          <Button title="👩‍🍳  Start cooking mode" onPress={() => setCooking(true)} />
        </>
      )}

      <Card style={{ marginTop: space(4) }}>
        <H2>Ate it?</H2>
        <View style={styles.wrap}>
          {MEAL_SLOTS.map((m) => (
            <Chip key={m} label={MEAL_LABEL[m]} selected={m === meal} onPress={() => setMeal(m)} />
          ))}
        </View>
        <Button
          title={saved ? 'Logged ✓' : `Log 1 serving to ${MEAL_LABEL[meal].toLowerCase()}`}
          disabled={saved}
          onPress={logServing}
        />
        {saved ? <Button title="Back to today" variant="ghost" onPress={() => router.navigate('/today')} style={{ marginTop: space(2) }} /> : null}
      </Card>
    </ScrollView>
  );
}
