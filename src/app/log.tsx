import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, Card, Chip, colors, Field, Muted, space, styles } from '../components/ui';
import { allowedFor, COOKING_OILS, Food, FOOD_BY_ID, searchFoods } from '../data/foods';
import { LogEntry } from '../lib/guidance';
import { scaleNutrients } from '../lib/nutrients';
import { MEAL_LABEL, MEAL_SLOTS, MealSlot } from '../lib/profile';
import { dateKey, newId, useStore } from '../lib/store';

const OIL_TSP = [0, 0.5, 1, 2, 3];
const TSP_G = 4.5;

export default function LogMeal() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const { profile, addEntries } = useStore();
  const [meal, setMeal] = useState<MealSlot>(
    MEAL_SLOTS.includes(params.meal as MealSlot) ? (params.meal as MealSlot) : 'breakfast',
  );
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food>();
  const [grams, setGrams] = useState('');
  const [oilId, setOilId] = useState('oil_sunflower');
  const [oilTsp, setOilTsp] = useState(0);

  const results = useMemo(() => {
    const list = searchFoods(query, 40).filter((f) => f.category !== 'fat');
    // Show foods that fit the user's diet first, but still allow logging anything.
    return profile
      ? [...list].sort((a, b) => Number(allowedFor(b, profile.diet, profile.allergies)) - Number(allowedFor(a, profile.diet, profile.allergies)))
      : list;
  }, [query, profile]);

  const g = Number(grams.replace(',', '.'));
  const preview = selected && g > 0 ? scaleNutrients(selected.per100g, g / 100) : undefined;
  const cookable = selected && ['grain', 'legume', 'vegetable', 'meat', 'seafood', 'egg', 'dairy'].includes(selected.category);

  const choose = (f: Food) => {
    setSelected(f);
    setGrams(String(f.unit?.grams ?? 100));
    setOilTsp(0);
  };

  const save = async () => {
    if (!selected || !(g > 0)) return;
    const date = dateKey();
    const createdAt = new Date().toISOString();
    const out: LogEntry[] = [
      { id: newId(), date, meal, name: selected.name, grams: g, foodId: selected.id, nutrients: scaleNutrients(selected.per100g, g / 100), source: selected.source, createdAt },
    ];
    if (cookable && oilTsp > 0) {
      const oil = FOOD_BY_ID[oilId];
      const og = oilTsp * TSP_G;
      out.push({ id: newId(), date, meal, name: `${oil.name} (cooking)`, grams: og, foodId: oil.id, nutrients: scaleNutrients(oil.per100g, og / 100), source: 'builtin', createdAt });
    }
    await addEntries(out);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: space(4), paddingBottom: 0 }}>
        <View style={styles.wrap}>
          {MEAL_SLOTS.map((m) => (
            <Chip key={m} label={MEAL_LABEL[m]} selected={m === meal} onPress={() => setMeal(m)} />
          ))}
        </View>
      </View>

      {selected ? (
        <ScrollView contentContainerStyle={{ padding: space(4) }} keyboardShouldPersistTaps="handled">
          <Card>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: space(3) }}>{selected.name}</Text>
            <Field label="How much?" value={grams} onChangeText={setGrams} keyboardType="decimal-pad" suffix="g" />
            {selected.unit ? (
              <View style={[styles.wrap, { marginTop: -space(2), marginBottom: space(3) }]}>
                {[0.5, 1, 2, 3].map((n) => (
                  <Chip
                    key={n}
                    label={`${n} ${selected.unit!.name}`}
                    selected={Math.abs(g - n * selected.unit!.grams) < 0.5}
                    onPress={() => setGrams(String(Math.round(n * selected.unit!.grams)))}
                  />
                ))}
              </View>
            ) : null}
            {cookable ? (
              <>
                <Text style={styles.label}>Oil or ghee used for your portion</Text>
                <View style={styles.wrap}>
                  {OIL_TSP.map((n) => (
                    <Chip key={n} label={n === 0 ? 'None' : `${n} tsp`} selected={n === oilTsp} onPress={() => setOilTsp(n)} />
                  ))}
                </View>
                {oilTsp > 0 ? (
                  <View style={styles.wrap}>
                    {COOKING_OILS.map((o) => (
                      <Chip key={o.id} label={o.name.split(' /')[0].replace(', salted', '')} selected={o.id === oilId} onPress={() => setOilId(o.id)} />
                    ))}
                  </View>
                ) : null}
                <Muted style={{ marginBottom: space(3) }}>Restaurant curries often carry 2–3 tsp of oil per serving.</Muted>
              </>
            ) : null}
            {preview ? (
              <Muted>
                {`${Math.round(preview.kcal + (cookable ? oilTsp * TSP_G * 8.84 : 0))} kcal · ${Math.round(preview.protein)} g protein · ${Math.round(preview.carbs)} g carbs · ${Math.round(preview.fat + (cookable ? oilTsp * TSP_G : 0))} g fat`}
              </Muted>
            ) : null}
          </Card>
          <Button title={`Add to ${MEAL_LABEL[meal].toLowerCase()}`} onPress={save} disabled={!(g > 0)} />
          <Button title="Pick a different food" variant="ghost" onPress={() => setSelected(undefined)} style={{ marginTop: space(2) }} />
        </ScrollView>
      ) : (
        <>
          <View style={{ paddingHorizontal: space(4) }}>
            <Button
              title="📷  Snap your plate instead"
              variant="secondary"
              onPress={() => router.replace({ pathname: '/photo', params: { meal } })}
              style={{ marginBottom: space(3) }}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search foods: dal, egg, roti, chicken…"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: space(3), fontSize: 16, color: colors.ink }}
            />
          </View>
          <FlatList
            data={results}
            keyExtractor={(f) => f.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: space(4) }}
            renderItem={({ item }) => {
              const fits = !profile || allowedFor(item, profile.diet, profile.allergies);
              return (
                <Pressable onPress={() => choose(item)} style={({ pressed }) => [{ paddingVertical: space(3), borderBottomWidth: 1, borderBottomColor: colors.line, opacity: pressed ? 0.6 : fits ? 1 : 0.55 }]}>
                  <Text style={{ color: colors.ink, fontSize: 16 }}>{item.name}</Text>
                  <Muted>{`${Math.round(item.per100g.kcal)} kcal · ${item.per100g.protein} g protein per 100 g${fits ? '' : ' · outside your diet'}`}</Muted>
                </Pressable>
              );
            }}
            ListEmptyComponent={<Muted>No match in the offline list yet.</Muted>}
          />
        </>
      )}
    </View>
  );
}
