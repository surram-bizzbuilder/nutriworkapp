/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTargets } from '../targets';
import { summarizeDay, LogEntry } from '../guidance';
import { FOOD_BY_ID } from '../../data/foods';
import { scaleNutrients } from '../nutrients';
import { DEFAULT_MEAL_TIMES, Profile } from '../profile';

const profile: Profile = {
  name: 'Test', sex: 'male', age: 30, heightCm: 175, weightKg: 75, goal: 'maintain',
  workMode: 'home', jobActivity: 'desk', dailySteps: 4000, workoutDays: 4, workoutMinutes: 60,
  workoutIntensity: 'moderate', workoutPlace: 'gym', sleepHours: 7, diet: 'vegetarian',
  allergies: [], cuisines: ['indian'], conditions: [], mealTimes: DEFAULT_MEAL_TIMES,
  remindersOn: true, createdAt: '2026-10-13',
};

test('targets follow Mifflin-St Jeor', () => {
  const t = computeTargets(profile);
  assert.equal(t.bmr, Math.round(10 * 75 + 6.25 * 175 - 5 * 30 + 5));
  assert.ok(t.nutrients.kcal > 2000 && t.nutrients.kcal < 2800, String(t.nutrients.kcal));
  assert.equal(t.nutrients.protein, Math.round(1.4 * 75));
  assert.equal(t.nutrients.iron, 14); // 8 x 1.8 for vegetarians
});

test('office goers get more energy than work-from-home', () => {
  const home = computeTargets(profile).nutrients.kcal;
  const office = computeTargets({ ...profile, workMode: 'office' }).nutrients.kcal;
  assert.ok(office > home);
});

function entry(foodId: string, grams: number, meal: LogEntry['meal']): LogEntry {
  const f = FOOD_BY_ID[foodId];
  return { id: foodId, date: '2026-10-13', meal, name: f.name, grams, nutrients: scaleNutrients(f.per100g, grams / 100), foodId, source: 'builtin', createdAt: '' };
}

test('after a low-protein breakfast, lunch plan carries more protein and respects diet', () => {
  const t = computeTargets(profile);
  const day = summarizeDay([entry('poha', 60, 'breakfast'), entry('oil_sunflower', 10, 'breakfast'), entry('tea', 240, 'breakfast'), entry('sugar', 8, 'breakfast')], t.nutrients, profile, new Date('2026-10-13T11:00:00'));
  assert.equal(day.next?.meal, 'lunch');
  const plan = day.next!;
  // Lunch gets 35 / (35+10+30) of what's left
  const expected = (t.nutrients.kcal - day.consumed.kcal) * 0.35 / 0.75;
  assert.ok(Math.abs(plan.target.kcal - expected) < 1);
  assert.ok(plan.focus.some((f) => f.key === 'protein'));
  assert.ok(plan.plate.length > 0);
  assert.ok(plan.plate.every((p) => !['meat', 'seafood', 'egg'].includes(p.food.category)));
  const kcal = plan.plateTotals.kcal;
  assert.ok(kcal > plan.target.kcal * 0.75 && kcal < plan.target.kcal * 1.15, `plate ${kcal} vs ${plan.target.kcal}`);
  console.log(plan.plate.map((p) => `${p.grams}g ${p.food.name}`).join(', '), Math.round(plan.plateTotals.protein), '/', Math.round(plan.target.protein));
});

test('reminders skip meals already logged and carry the plan', async () => {
  const { planReminders } = await import('../reminderPlan');
  const t = computeTargets(profile);
  const now = new Date('2026-10-13T09:00:00');
  const r = planReminders(profile, t, [entry('oats', 60, 'breakfast')], now);
  const today = r.filter((x) => x.date.getDate() === 13);
  assert.ok(!today.some((x) => x.title.startsWith('Breakfast')));
  const lunch = today.find((x) => x.title.startsWith('Lunch'))!;
  assert.match(lunch.body, /kcal and \d+ g protein/);
  assert.equal(lunch.date.getHours(), 13);
  assert.equal(lunch.date.getMinutes(), 30);
  assert.equal(r.filter((x) => x.date.getDate() === 14).length, 3);
  assert.equal(planReminders({ ...profile, remindersOn: false }, t, [], now).length, 0);
});
