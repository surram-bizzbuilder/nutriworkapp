import { FOOD_BY_ID } from '../data/foods';
import type { RecognizedItem } from './api';
import { LogEntry } from './guidance';
import { Nutrients, scaleNutrients, zeroNutrients } from './nutrients';
import { MealSlot } from './profile';

export function per100gFor(item: RecognizedItem): Nutrients {
  const food = item.catalogueId ? FOOD_BY_ID[item.catalogueId] : undefined;
  if (food) return food.per100g;
  // Composite dishes come with a macro estimate; micronutrients stay unknown (0).
  return { ...zeroNutrients(), ...(item.per100g ?? {}) };
}

export function photoEntries(
  items: RecognizedItem[],
  meal: MealSlot,
  date: string,
  newId: () => string,
  now = new Date().toISOString(),
): LogEntry[] {
  const out: LogEntry[] = [];
  for (const item of items) {
    if (item.grams > 0) {
      const food = item.catalogueId ? FOOD_BY_ID[item.catalogueId] : undefined;
      out.push({
        id: newId(),
        date,
        meal,
        name: item.name,
        grams: item.grams,
        foodId: food?.id,
        nutrients: scaleNutrients(per100gFor(item), item.grams / 100),
        source: 'photo',
        createdAt: now,
      });
    }
    const fat = item.cookingFat;
    if (fat && fat.grams > 0) {
      const oil = FOOD_BY_ID[fat.catalogueId] ?? FOOD_BY_ID.oil_sunflower;
      out.push({
        id: newId(),
        date,
        meal,
        name: `${oil.name} (in ${item.name.toLowerCase()})`,
        grams: fat.grams,
        foodId: oil.id,
        nutrients: scaleNutrients(oil.per100g, fat.grams / 100),
        source: 'photo',
        createdAt: now,
      });
    }
  }
  return out;
}
