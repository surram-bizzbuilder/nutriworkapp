// Turns what the user has eaten so far into a target and a suggested plate for the
// next meal, so the day ends balanced.
import { allowedFor, Food, FOODS } from '../data/foods';
import {
  NUTRIENT_KEYS,
  NUTRIENT_META,
  NutrientKey,
  Nutrients,
  scaleNutrients,
  subtractNutrients,
  sumNutrients,
  zeroNutrients,
} from './nutrients';
import { MEAL_SHARE, MEAL_SLOTS, MealSlot, Profile } from './profile';

export type LogEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealSlot;
  name: string;
  grams: number;
  nutrients: Nutrients; // snapshot for this portion
  foodId?: string;
  source: Food['source'];
  createdAt: string;
};

export type PlateItem = { food: Food; grams: number };

export type Focus = { key: NutrientKey; message: string; tone: 'boost' | 'limit' };

export type NextMealPlan = {
  meal: MealSlot;
  target: Nutrients;
  focus: Focus[];
  plate: PlateItem[];
  plateTotals: Nutrients;
  oilAllowanceG: number;
};

export type DayStatus = {
  consumed: Nutrients;
  remaining: Nutrients;
  byMeal: Record<MealSlot, Nutrients>;
  loggedMeals: MealSlot[];
  next?: NextMealPlan;
};

// A plate is built from roles so suggestions look like real meals: a base, a protein,
// vegetables and an optional side. Each role lists the food ids that can fill it.
type Role = { name: string; ids: string[]; optional?: boolean };

const BASES_MAIN = ['rice_white', 'rice_brown', 'roti', 'quinoa', 'pasta', 'tortilla_corn', 'potato', 'sweet_potato', 'naan'];
const PROTEINS_MAIN = ['dal_toor', 'dal_masoor', 'dal_moong', 'chickpeas', 'rajma', 'black_beans', 'tofu', 'soy_chunks', 'paneer', 'egg', 'chicken_breast', 'chicken_thigh', 'mutton', 'beef_lean', 'salmon', 'tuna', 'fish_white', 'shrimp'];
const VEG = ['spinach', 'broccoli', 'cauliflower', 'okra', 'peas', 'bell_pepper', 'mushroom', 'carrot', 'beetroot', 'lettuce', 'cucumber', 'tomato'];

const ROLES: Record<MealSlot, Role[]> = {
  breakfast: [
    { name: 'base', ids: ['oats', 'poha', 'idli', 'dosa', 'bread_ww', 'sweet_potato'] },
    { name: 'protein', ids: ['egg', 'egg_white', 'greek_yogurt', 'curd', 'paneer', 'tofu', 'sprouts', 'milk_toned', 'soy_milk', 'peanut_butter'] },
    { name: 'side', ids: ['banana', 'apple', 'orange', 'papaya', 'guava', 'strawberries', 'mango', 'almonds', 'walnuts', 'chia', 'pumpkin_seeds'], optional: true },
  ],
  lunch: [
    { name: 'base', ids: BASES_MAIN },
    { name: 'protein', ids: PROTEINS_MAIN },
    { name: 'veg', ids: VEG },
    { name: 'side', ids: ['curd', 'greek_yogurt', 'lettuce', 'cucumber', 'sprouts'], optional: true },
  ],
  snack: [
    { name: 'fruit', ids: ['banana', 'apple', 'orange', 'papaya', 'guava', 'strawberries', 'mango'] },
    { name: 'protein', ids: ['almonds', 'peanuts', 'walnuts', 'pumpkin_seeds', 'greek_yogurt', 'curd', 'egg', 'sprouts', 'hummus', 'milk_toned', 'soy_milk', 'whey'], optional: true },
  ],
  dinner: [
    { name: 'base', ids: BASES_MAIN },
    { name: 'protein', ids: PROTEINS_MAIN },
    { name: 'veg', ids: VEG },
    { name: 'side', ids: ['curd', 'greek_yogurt', 'lettuce', 'cucumber'], optional: true },
  ],
};

const WEIGHTS: Partial<Record<NutrientKey, number>> = {
  kcal: 3,
  protein: 3,
  fiber: 1.5,
  carbs: 1,
  fat: 0.8,
};
const MICRO_WEIGHT = 0.5;

export function summarizeDay(
  entries: LogEntry[],
  target: Nutrients,
  profile: Profile,
  now: Date = new Date(),
): DayStatus {
  const byMeal = Object.fromEntries(MEAL_SLOTS.map((m) => [m, zeroNutrients()])) as Record<MealSlot, Nutrients>;
  for (const e of entries) {
    byMeal[e.meal] = sumNutrients([byMeal[e.meal], e.nutrients]);
  }
  const consumed = sumNutrients(entries.map((e) => e.nutrients));
  const remaining = subtractNutrients(target, consumed);
  const loggedMeals = MEAL_SLOTS.filter((m) => entries.some((e) => e.meal === m));
  const nextMeal = pickNextMeal(loggedMeals, profile, now);
  const next = nextMeal ? planNextMeal(nextMeal, loggedMeals, consumed, target, profile) : undefined;
  return { consumed, remaining, byMeal, loggedMeals, next };
}

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function pickNextMeal(logged: MealSlot[], profile: Profile, now: Date): MealSlot | undefined {
  const lastLoggedIdx = Math.max(-1, ...logged.map((m) => MEAL_SLOTS.indexOf(m)));
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // The next meal is the first unlogged slot after the last logged one whose time
  // hasn't long passed (90 min grace), falling back to the last slot of the day.
  const candidates = MEAL_SLOTS.filter((m, i) => i > lastLoggedIdx && !logged.includes(m));
  const upcoming = candidates.find((m) => minutes(profile.mealTimes[m]) + 90 >= nowMin);
  return upcoming ?? candidates[candidates.length - 1];
}

function remainingSlots(logged: MealSlot[], next: MealSlot): MealSlot[] {
  const start = MEAL_SLOTS.indexOf(next);
  return MEAL_SLOTS.filter((m, i) => i >= start && !logged.includes(m));
}

export function planNextMeal(
  meal: MealSlot,
  logged: MealSlot[],
  consumed: Nutrients,
  dayTarget: Nutrients,
  profile: Profile,
): NextMealPlan {
  const slots = remainingSlots(logged, meal);
  const shareSum = slots.reduce((s, m) => s + MEAL_SHARE[m], 0) || 1;
  const fraction = MEAL_SHARE[meal] / shareSum;
  const remaining = subtractNutrients(dayTarget, consumed);
  const target = zeroNutrients();
  for (const k of NUTRIENT_KEYS) {
    // An unlogged earlier meal shouldn't push its whole share into this one.
    const cap = dayTarget[k] * MEAL_SHARE[meal] * 1.5;
    target[k] = Math.min(cap, Math.max(0, remaining[k] * fraction));
  }

  const focus = buildFocus(consumed, dayTarget, logged);

  // Leave room for cooking oil in main meals so the plate stays honest.
  const oilAllowanceG = meal === 'lunch' || meal === 'dinner' ? 5 : 0;
  const plateTarget = { ...target, kcal: Math.max(0, target.kcal - oilAllowanceG * 8.84), fat: Math.max(0, target.fat - oilAllowanceG) };
  const plate = buildPlate(meal, plateTarget, profile);
  const plateTotals = sumNutrients(plate.map((p) => scaleNutrients(p.food.per100g, p.grams / 100)));
  return { meal, target, focus, plate, plateTotals, oilAllowanceG };
}

function buildFocus(consumed: Nutrients, target: Nutrients, logged: MealSlot[]): Focus[] {
  const expected = logged.reduce((s, m) => s + MEAL_SHARE[m], 0);
  const out: Focus[] = [];
  const lagging: { key: NutrientKey; gap: number }[] = [];
  for (const k of NUTRIENT_KEYS) {
    const t = target[k];
    if (!t || k === 'kcal') continue;
    const ratio = consumed[k] / t;
    if (NUTRIENT_META[k].kind === 'limit') {
      if (ratio >= 1) out.push({ key: k, tone: 'limit', message: `${NUTRIENT_META[k].label} is over today's limit. Keep the rest of the day low in it.` });
      else if (ratio >= Math.max(0.75, expected + 0.25)) out.push({ key: k, tone: 'limit', message: `${NUTRIENT_META[k].label} is running high (${Math.round(ratio * 100)}% of the limit).` });
    } else if (expected > 0 && ratio < expected * 0.7) {
      lagging.push({ key: k, gap: (expected - ratio) * (WEIGHTS[k] ?? 1) });
    }
  }
  lagging.sort((a, b) => b.gap - a.gap);
  for (const l of lagging.slice(0, 3)) {
    out.push({ key: l.key, tone: 'boost', message: `Low on ${NUTRIENT_META[l.key].label.toLowerCase()} so far. This meal is a good place to catch up.` });
  }
  return out;
}

// Lower is better: how far `got` is from `need` (shortfalls on goals, overshoot on limits).
export function score(got: Nutrients, need: Nutrients): number {
  let s = 0;
  for (const k of NUTRIENT_KEYS) {
    const n = need[k];
    if (!n) continue;
    const meta = NUTRIENT_META[k];
    if (meta.kind === 'limit') {
      const over = Math.max(0, got[k] - n) / n;
      s += 2 * over * over;
      continue;
    }
    const w = WEIGHTS[k] ?? MICRO_WEIGHT;
    const short = Math.max(0, n - got[k]) / n;
    s += w * short * short;
    if (k === 'kcal' || k === 'fat' || k === 'carbs') {
      const over = Math.max(0, got[k] - n * 1.05) / n;
      s += w * 4 * over * over;
    }
  }
  return s;
}

function stepGrams(food: Food): number {
  const unit = food.unit?.grams ?? 100;
  return Math.min(150, Math.max(food.category === 'nut' ? 10 : 30, unit));
}

function cuisinePenalty(foods: Food[], profile: Profile): number {
  let p = 0;
  for (const f of foods) {
    if (f.cuisines && !f.cuisines.some((c) => profile.cuisines.includes(c))) p += 0.03;
  }
  // Mixing dishes from unrelated cuisines (pasta with dal) reads as odd.
  for (let i = 0; i < foods.length; i++) {
    for (let j = i + 1; j < foods.length; j++) {
      const a = foods[i].cuisines;
      const b = foods[j].cuisines;
      if (a && b && !a.some((c) => b.includes(c))) p += 0.08;
    }
  }
  return p;
}

// Greedily adds portions of the chosen foods (each starts with one portion) until
// the meal target is met or nothing improves the fit.
function fillPortions(foods: Food[], need: Nutrients): { grams: number[]; got: Nutrients; s: number } {
  const grams = foods.map((f) => stepGrams(f));
  let got = sumNutrients(foods.map((f, i) => scaleNutrients(f.per100g, grams[i] / 100)));
  let current = score(got, need);
  for (let step = 0; step < 12; step++) {
    let best: { i: number; s: number; next: Nutrients } | undefined;
    foods.forEach((f, i) => {
      const add = stepGrams(f);
      if (grams[i] + add > maxPortion(f)) return;
      const next = sumNutrients([got, scaleNutrients(f.per100g, add / 100)]);
      const s = score(next, need);
      if (!best || s < best.s) best = { i, s, next };
    });
    if (!best || best.s >= current - 1e-4) break;
    grams[best.i] += stepGrams(foods[best.i]);
    got = best.next;
    current = best.s;
  }
  return { grams, got, s: current };
}

export function buildPlate(meal: MealSlot, need: Nutrients, profile: Profile, pool: Food[] = FOODS): PlateItem[] {
  if (need.kcal < 60) return [];
  const byId = new Map(pool.map((f) => [f.id, f]));
  const roleFoods = ROLES[meal].map((role) => ({
    role,
    foods: role.ids
      .map((id) => byId.get(id))
      .filter((f): f is Food => !!f && allowedFor(f, profile.diet, profile.allergies))
      .map((f) => {
        const liked = f.cuisines?.some((c) => profile.cuisines.includes(c)) ? -0.05 : 0;
        return { f, s: score(scaleNutrients(f.per100g, stepGrams(f) / 100 * 2), need) + liked };
      })
      // Only the most useful few per role are combined, which keeps this fast on a phone.
      .sort((a, b) => a.s - b.s)
      .slice(0, 4)
      .map((x) => x.f),
  }));

  let best: { foods: Food[]; grams: number[]; s: number } | undefined;
  const walk = (i: number, chosen: Food[]) => {
    if (i === roleFoods.length) {
      if (!chosen.length) return;
      const { grams, s } = fillPortions(chosen, need);
      const total = s + cuisinePenalty(chosen, profile);
      if (!best || total < best.s) best = { foods: [...chosen], grams, s: total };
      return;
    }
    const { role, foods } = roleFoods[i];
    if (role.optional || !foods.length) walk(i + 1, chosen);
    for (const f of foods) walk(i + 1, [...chosen, f]);
  };
  walk(0, []);

  if (!best) return [];
  const result = best;
  return result.foods.map((food, i) => ({ food, grams: Math.round(result.grams[i]) }));
}

const MAX_PORTION_BY_ID: Record<string, number> = {
  soy_chunks: 50,
  egg: 150,
  egg_white: 132,
  hummus: 60,
  whey: 30,
  peanut_butter: 32,
  chia: 24,
  pumpkin_seeds: 30,
  paneer: 150,
};

function maxPortion(f: Food): number {
  if (MAX_PORTION_BY_ID[f.id]) return MAX_PORTION_BY_ID[f.id];
  switch (f.category) {
    case 'nut':
      return 40;
    case 'meat':
    case 'seafood':
      return 200;
    case 'grain':
      return f.id === 'oats' || f.id === 'poha' ? 80 : 250;
    case 'vegetable':
      return 250;
    case 'dairy':
      return 250;
    default:
      return 300;
  }
}
