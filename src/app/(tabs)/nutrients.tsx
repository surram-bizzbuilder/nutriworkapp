import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, colors, H1, H2, Muted, ProgressBar, space, styles } from '../../components/ui';
import { formatAmount, NUTRIENT_KEYS, NUTRIENT_META, NutrientKey, sumNutrients } from '../../lib/nutrients';
import { dateKey, useStore } from '../../lib/store';

function Row({ k, value, target }: { k: NutrientKey; value: number; target: number }) {
  const meta = NUTRIENT_META[k];
  const pct = target ? Math.round((value / target) * 100) : 0;
  const limit = meta.kind === 'limit';
  return (
    <View style={{ marginBottom: space(3.5) }}>
      <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
        <Text style={{ color: colors.ink, fontWeight: '600' }}>{`${meta.label}${limit ? ' (limit)' : ''}`}</Text>
        <Muted>{`${formatAmount(k, value)} / ${formatAmount(k, target)} · ${pct}%`}</Muted>
      </View>
      <ProgressBar value={value} max={target} limit={limit} color={limit ? colors.accent : colors.brand} />
    </View>
  );
}

export default function NutrientsScreen() {
  const { targets, entriesFor } = useStore();
  if (!targets) return null;
  const consumed = sumNutrients(entriesFor(dateKey()).map((e) => e.nutrients));
  const t = targets.nutrients;
  const macros = NUTRIENT_KEYS.filter((k) => NUTRIENT_META[k].group !== 'micro');
  const micros = NUTRIENT_KEYS.filter((k) => NUTRIENT_META[k].group === 'micro');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space(4), paddingBottom: space(12) }}>
        <H1>Today's nutrients</H1>
        <Muted style={{ marginBottom: space(4) }}>Everything you've logged today against your personal targets.</Muted>
        <Card>
          <H2>Energy and macros</H2>
          {macros.map((k) => (
            <Row key={k} k={k} value={consumed[k]} target={t[k]} />
          ))}
        </Card>
        <Card>
          <H2>Vitamins and minerals</H2>
          {micros.map((k) => (
            <Row key={k} k={k} value={consumed[k]} target={t[k]} />
          ))}
          <Muted>Targets follow the Dietary Reference Intakes (RDA/AI) for your age and sex.</Muted>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
