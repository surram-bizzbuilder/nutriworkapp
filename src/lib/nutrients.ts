// Nutrient catalogue shared by targets, the food database and the guidance engine.

export const NUTRIENT_KEYS = [
  'kcal',
  'protein',
  'carbs',
  'fat',
  'fiber',
  'sugar',
  'satFat',
  'sodium',
  'potassium',
  'calcium',
  'iron',
  'magnesium',
  'zinc',
  'vitA',
  'vitC',
  'vitD',
  'b12',
  'folate',
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];
export type Nutrients = Record<NutrientKey, number>;

export type NutrientMeta = {
  label: string;
  unit: string;
  group: 'energy' | 'macro' | 'micro';
  // 'limit' nutrients should stay under target; everything else should reach it.
  kind: 'goal' | 'limit';
};

export const NUTRIENT_META: Record<NutrientKey, NutrientMeta> = {
  kcal: { label: 'Calories', unit: 'kcal', group: 'energy', kind: 'goal' },
  protein: { label: 'Protein', unit: 'g', group: 'macro', kind: 'goal' },
  carbs: { label: 'Carbs', unit: 'g', group: 'macro', kind: 'goal' },
  fat: { label: 'Fat', unit: 'g', group: 'macro', kind: 'goal' },
  fiber: { label: 'Fiber', unit: 'g', group: 'macro', kind: 'goal' },
  sugar: { label: 'Sugar', unit: 'g', group: 'macro', kind: 'limit' },
  satFat: { label: 'Saturated fat', unit: 'g', group: 'macro', kind: 'limit' },
  sodium: { label: 'Sodium', unit: 'mg', group: 'micro', kind: 'limit' },
  potassium: { label: 'Potassium', unit: 'mg', group: 'micro', kind: 'goal' },
  calcium: { label: 'Calcium', unit: 'mg', group: 'micro', kind: 'goal' },
  iron: { label: 'Iron', unit: 'mg', group: 'micro', kind: 'goal' },
  magnesium: { label: 'Magnesium', unit: 'mg', group: 'micro', kind: 'goal' },
  zinc: { label: 'Zinc', unit: 'mg', group: 'micro', kind: 'goal' },
  vitA: { label: 'Vitamin A', unit: 'µg', group: 'micro', kind: 'goal' },
  vitC: { label: 'Vitamin C', unit: 'mg', group: 'micro', kind: 'goal' },
  vitD: { label: 'Vitamin D', unit: 'µg', group: 'micro', kind: 'goal' },
  b12: { label: 'Vitamin B12', unit: 'µg', group: 'micro', kind: 'goal' },
  folate: { label: 'Folate', unit: 'µg', group: 'micro', kind: 'goal' },
};

export const MICRO_KEYS = NUTRIENT_KEYS.filter((k) => NUTRIENT_META[k].group === 'micro');

export function zeroNutrients(): Nutrients {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as Nutrients;
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  const out = zeroNutrients();
  for (const k of NUTRIENT_KEYS) out[k] = (a[k] ?? 0) + (b[k] ?? 0);
  return out;
}

export function subtractNutrients(a: Nutrients, b: Nutrients): Nutrients {
  const out = zeroNutrients();
  for (const k of NUTRIENT_KEYS) out[k] = (a[k] ?? 0) - (b[k] ?? 0);
  return out;
}

export function scaleNutrients(n: Nutrients, factor: number): Nutrients {
  const out = zeroNutrients();
  for (const k of NUTRIENT_KEYS) out[k] = (n[k] ?? 0) * factor;
  return out;
}

export function sumNutrients(list: Nutrients[]): Nutrients {
  return list.reduce(addNutrients, zeroNutrients());
}

export function formatAmount(key: NutrientKey, value: number): string {
  const v = Math.max(0, value);
  const rounded = v >= 100 ? Math.round(v) : v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${rounded} ${NUTRIENT_META[key].unit}`;
}
