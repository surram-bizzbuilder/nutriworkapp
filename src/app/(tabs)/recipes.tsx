import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Chip, colors, H1, Muted, space, styles } from '../../components/ui';
import { perServing, RECIPES, recipeAllowed } from '../../data/recipes';
import { score, summarizeDay } from '../../lib/guidance';
import { Cuisine, MEAL_LABEL } from '../../lib/profile';
import { dateKey, useStore } from '../../lib/store';

const CUISINE_LABEL: Record<Cuisine, string> = {
  indian: 'Indian',
  mediterranean: 'Mediterranean',
  eastAsian: 'East Asian',
  mexican: 'Mexican',
  american: 'American',
  middleEastern: 'Middle Eastern',
};

export default function Recipes() {
  const { profile, targets, entriesFor } = useStore();
  const [cuisine, setCuisine] = useState<Cuisine | 'all'>('all');

  const next = useMemo(
    () => (profile && targets ? summarizeDay(entriesFor(dateKey()), targets.nutrients, profile).next : undefined),
    [profile, targets, entriesFor],
  );

  const list = useMemo(() => {
    if (!profile) return [];
    const ok = RECIPES.filter((r) => recipeAllowed(r, profile.diet, profile.allergies)).filter(
      (r) => cuisine === 'all' || r.cuisine === cuisine,
    );
    const ranked = ok.map((r) => {
      const ps = perServing(r);
      const fits = next ? r.meals.includes(next.meal) : false;
      const s = next ? score(ps, next.target) - (fits ? 0.5 : 0) : 0;
      return { r, ps, s, fits };
    });
    return ranked.sort((a, b) => a.s - b.s);
  }, [profile, cuisine, next]);

  if (!profile) return null;
  const cuisines = (Object.keys(CUISINE_LABEL) as Cuisine[]).filter((c) => RECIPES.some((r) => r.cuisine === c));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
        <H1>Cook</H1>
        <Muted style={{ marginBottom: space(4) }}>
          {next ? `Sorted by how well each dish fits your ${MEAL_LABEL[next.meal].toLowerCase()}.` : 'Step-by-step recipes that fit your diet.'}
        </Muted>

        <Pressable accessibilityRole="button" onPress={() => router.push('/pantry')}>
          <Card style={{ backgroundColor: colors.brand, borderColor: colors.brand }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>📸  What can I cook with what I have?</Text>
            <Text style={{ color: '#E8F5EE', marginTop: space(1) }}>Snap your ingredients and get the most nutritious dish you can make.</Text>
          </Card>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space(2) }}>
          <Chip label="All" selected={cuisine === 'all'} onPress={() => setCuisine('all')} />
          {cuisines.map((c) => (
            <Chip key={c} label={CUISINE_LABEL[c]} selected={cuisine === c} onPress={() => setCuisine(c)} />
          ))}
        </ScrollView>

        {list.map(({ r, ps, fits }, i) => (
          <Pressable key={r.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}>
            <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 34, marginRight: space(3) }}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>{r.name}</Text>
                <Muted>{`${CUISINE_LABEL[r.cuisine]} · ${r.minutes} min · ${Math.round(ps.kcal)} kcal · ${Math.round(ps.protein)} g protein`}</Muted>
                {next && fits && i < 3 ? (
                  <Text style={[styles.label, { color: colors.brand, marginTop: space(1), marginBottom: 0 }]}>{`Great fit for ${MEAL_LABEL[next.meal].toLowerCase()}`}</Text>
                ) : null}
              </View>
              <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
            </Card>
          </Pressable>
        ))}
        {!list.length ? <Muted>No recipes match this filter yet.</Muted> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
