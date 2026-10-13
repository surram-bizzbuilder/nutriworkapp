import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, colors, H2, Muted, ProgressBar, Ring, space, styles } from '../../components/ui';
import { LogEntry, summarizeDay } from '../../lib/guidance';
import { formatAmount, scaleNutrients } from '../../lib/nutrients';
import { MEAL_LABEL, MEAL_SLOTS } from '../../lib/profile';
import { dateKey, newId, useStore } from '../../lib/store';
import { streakDays } from '../../lib/streak';

const MACROS = [
  { key: 'protein', color: colors.protein },
  { key: 'carbs', color: colors.carbs },
  { key: 'fat', color: colors.fat },
  { key: 'fiber', color: colors.fiber },
] as const;

function greeting(d: Date) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Today() {
  const { profile, targets, entries, entriesFor, addEntries, removeEntry } = useStore();
  const now = new Date();
  const today = dateKey(now);
  const todays = useMemo(() => entriesFor(today), [entriesFor, today]);
  const hour = now.getHours();
  const day = useMemo(
    () => (profile && targets ? summarizeDay(todays, targets.nutrients, profile, new Date()) : undefined),
    // Re-plan when the hour changes so the "next meal" follows the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todays, profile, targets, hour],
  );
  const streak = streakDays(entries, now);

  if (!profile || !targets || !day) return null;
  const t = targets.nutrients;
  const next = day.next;
  // Earlier meals the user hasn't logged (snacks are optional, so they're not nagged).
  const missed = next
    ? MEAL_SLOTS.slice(0, MEAL_SLOTS.indexOf(next.meal)).filter((m) => m !== 'snack' && !day.loggedMeals.includes(m))
    : [];

  const logPlate = () => {
    if (!next) return;
    const createdAt = new Date().toISOString();
    addEntries(
      next.plate.map(
        (p): LogEntry => ({
          id: newId(),
          date: today,
          meal: next.meal,
          name: p.food.name,
          grams: p.grams,
          foodId: p.food.id,
          nutrients: scaleNutrients(p.food.per100g, p.grams / 100),
          source: 'builtin',
          createdAt,
        }),
      ),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
        <View style={[styles.row, { justifyContent: 'space-between', marginBottom: space(1) }]}>
          <View style={{ flex: 1 }}>
            <Muted>{greeting(now)}</Muted>
            <Text style={{ fontSize: 30, fontWeight: '600', color: colors.ink, letterSpacing: -0.5 }}>{profile.name}</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.cardStrong, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.ink, fontSize: 18, fontWeight: '600' }}>{profile.name.slice(0, 1).toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.row, { marginTop: space(3), marginBottom: space(4) }]}>
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: space(3.5), paddingVertical: space(2), marginRight: space(2) }}>
            <Text style={{ color: colors.ink, fontSize: 13 }}>{now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
          </View>
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: space(3.5), paddingVertical: space(2) }}>
            <Text style={{ color: colors.ink, fontSize: 13 }}>
              {`🔥 ${streak} `}
              <Text style={{ color: colors.muted }}>day streak</Text>
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/photo', params: next ? { meal: next.meal } : {} })}
          style={({ pressed }) => [{ backgroundColor: colors.brand, borderRadius: 999, padding: space(1.5), paddingRight: space(5), marginBottom: space(3), flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginRight: space(3) }}>
            <Text style={{ fontSize: 22 }}>📷</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.onBrand, fontWeight: '600', fontSize: 16 }}>Snap your plate</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>We'll weigh every item, oil included</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, letterSpacing: -4 }}>{'›››'}</Text>
        </Pressable>

        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ring value={day.consumed.kcal} max={t.kcal}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink }}>{Math.max(0, Math.round(day.remaining.kcal))}</Text>
            <Muted>{day.remaining.kcal >= 0 ? 'kcal left' : 'kcal over'}</Muted>
          </Ring>
          <View style={{ flex: 1, marginLeft: space(4) }}>
            {MACROS.map((m) => (
              <View key={m.key} style={{ marginBottom: space(2.5) }}>
                <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                  <Text style={{ fontWeight: '600', color: colors.ink, textTransform: 'capitalize' }}>{m.key}</Text>
                  <Muted>{`${Math.round(day.consumed[m.key])} / ${t[m.key]} g`}</Muted>
                </View>
                <ProgressBar value={day.consumed[m.key]} max={t[m.key]} color={m.color} />
              </View>
            ))}
          </View>
        </Card>

        {missed.length ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/log', params: { meal: missed[0] } })}
            style={{ backgroundColor: colors.accentSoft, borderRadius: 20, padding: space(4), marginBottom: space(3) }}
          >
            <Text style={{ color: colors.ink }}>
              {`Forgot to log ${missed.map((m) => MEAL_LABEL[m].toLowerCase()).join(' and ')}? `}
              <Text style={{ color: colors.accent, fontWeight: '700' }}>Add it now</Text>
              {' so the rest of your day is planned right.'}
            </Text>
          </Pressable>
        ) : null}

        {next ? (
          <Card style={{ backgroundColor: colors.cardStrong }}>
            <Text style={{ color: colors.brand, fontWeight: '600', fontSize: 12, letterSpacing: 1, marginBottom: space(1.5) }}>{`NEXT UP · ${MEAL_LABEL[next.meal].toUpperCase()}`}</Text>
            <H2>{`Aim for about ${Math.round(next.target.kcal)} kcal and ${Math.round(next.target.protein)} g protein`}</H2>
            {next.focus.map((f) => (
              <View
                key={f.key}
                style={{
                  backgroundColor: f.tone === 'limit' ? colors.dangerSoft : colors.brandSoft,
                  borderRadius: 16,
                  padding: space(3),
                  marginBottom: space(2),
                }}
              >
                <Text style={{ color: f.tone === 'limit' ? colors.danger : colors.ink }}>{f.message}</Text>
              </View>
            ))}
            {next.plate.length ? (
              <>
                <Text style={[styles.label, { marginTop: space(2) }]}>A plate that fits</Text>
                {next.plate.map((p) => (
                  <View key={p.food.id} style={[styles.row, { justifyContent: 'space-between', paddingVertical: space(1.5) }]}>
                    <Text style={{ color: colors.ink, flex: 1 }}>{p.food.name}</Text>
                    <Muted>{`${p.grams} g${p.food.unit ? ` · ~${Math.round((p.grams / p.food.unit.grams) * 10) / 10} ${p.food.unit.name}` : ''}`}</Muted>
                  </View>
                ))}
                {next.oilAllowanceG ? <Muted>{`Cook with up to ${next.oilAllowanceG} g (about 1 tsp) of oil.`}</Muted> : null}
                <Muted style={{ marginTop: space(1) }}>
                  {`Plate total: ${Math.round(next.plateTotals.kcal)} kcal · ${Math.round(next.plateTotals.protein)} g protein · ${Math.round(next.plateTotals.fiber)} g fiber`}
                </Muted>
                <View style={[styles.row, { marginTop: space(3) }]}>
                  <Button title="I ate this" onPress={logPlate} style={{ flex: 1, marginRight: space(2) }} />
                  <Button title="Log other food" variant="secondary" onPress={() => router.push({ pathname: '/log', params: { meal: next.meal } })} style={{ flex: 1 }} />
                </View>
              </>
            ) : (
              <Muted>You have met today's energy target. If you're hungry, choose vegetables, fruit or plain curd.</Muted>
            )}
          </Card>
        ) : (
          <Card>
            <H2>All meals logged</H2>
            <Muted>Nice work. Check the Nutrients tab to see how your day balanced out.</Muted>
          </Card>
        )}

        {MEAL_SLOTS.map((m) => {
          const items = todays.filter((e) => e.meal === m);
          return (
            <Card key={m}>
              <View style={[styles.row, { justifyContent: 'space-between' }]}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>{MEAL_LABEL[m]}</Text>
                  <Muted>{items.length ? `${Math.round(day.byMeal[m].kcal)} kcal · ${Math.round(day.byMeal[m].protein)} g protein` : profile.mealTimes[m]}</Muted>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Add food to ${MEAL_LABEL[m]}`}
                  onPress={() => router.push({ pathname: '/log', params: { meal: m } })}
                  style={{ backgroundColor: colors.cardStrong, borderRadius: 999, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: colors.ink, fontSize: 22, fontWeight: '400', marginTop: -2 }}>+</Text>
                </Pressable>
              </View>
              {items.map((e) => (
                <View key={e.id} style={[styles.row, { paddingTop: space(2.5) }]}>
                  <Text style={{ flex: 1, color: colors.ink }}>{e.name}</Text>
                  <Muted>{`${Math.round(e.grams)} g · ${Math.round(e.nutrients.kcal)} kcal`}</Muted>
                  <Pressable accessibilityLabel={`Remove ${e.name}`} onPress={() => removeEntry(e.id)} hitSlop={10} style={{ marginLeft: space(3) }}>
                    <Text style={{ color: colors.muted }}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          );
        })}

        <Muted style={{ textAlign: 'center', marginTop: space(2) }}>
          {`Sodium ${formatAmount('sodium', day.consumed.sodium)} of ${formatAmount('sodium', t.sodium)} limit`}
        </Muted>
      </ScrollView>
    </SafeAreaView>
  );
}
