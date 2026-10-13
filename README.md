# NutriWork

A personal nutrition planner (React Native + Expo + TypeScript). It asks about your body, workday,
exercise, goal and food preferences, sets daily macro and micronutrient targets, and after every
meal you log it plans the next one so the day ends balanced.

## What works today

- **Onboarding**: age, sex, height, weight, target weight, work from home / office / hybrid, job
  activity, daily steps, sleep, workout place / days / minutes / intensity, goal, health conditions
  (diabetes, high blood pressure, pregnancy, breastfeeding), diet, allergies and cuisines, meal times.
- **Daily targets** (`src/lib/targets.ts`): Mifflin-St Jeor BMR x activity level, goal-adjusted
  calories, protein per kg by training and goal, fat/carb split, fiber 14 g / 1000 kcal, sugar and
  saturated fat under 10% of energy, and DRI (RDA/AI) values for sodium, potassium, calcium, iron,
  magnesium, zinc and vitamins A, C, D, B12 and folate.
- **Meal logging** (`src/app/log.tsx`): search ~85 common foods (Indian staples included) by name
  or Hindi alias, enter grams or tap a household unit, and record the oil or ghee used for cooking
  so it is always counted.
- **Next-meal guidance** (`src/lib/guidance.ts`): splits what's left of the day across the
  remaining meals, flags nutrients that are lagging or over the limit, and builds a realistic
  plate (base + protein + vegetables + side) in grams that fits your diet, allergies and cuisines.
- **Consistency**: day streak and a nudge for meals you forgot to log.

## Coming next

Photo recognition of meals with gram estimates (including oil), meal reminders, recipes with
step-by-step cooking, and "photo of my ingredients → best dish".

## Run it

Requires Node 20+.

```bash
npm install
npx expo start          # then press "a" for an Android emulator, "i" for iOS simulator, "w" for web
```

- **Android emulator**: install Android Studio, create a virtual device (Pixel, API 35+), start
  it, then press `a` in the Expo terminal.
- **Your phone**: install Expo Go and scan the QR code shown by `npx expo start`.

## Checks

```bash
npm run typecheck
npm test
```
