export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type WorkMode = 'home' | 'office' | 'hybrid';
export type JobActivity = 'desk' | 'onFeet' | 'manual';
export type Intensity = 'light' | 'moderate' | 'intense';
export type WorkoutPlace = 'none' | 'home' | 'gym' | 'sports';
export type Diet = 'nonveg' | 'eggetarian' | 'vegetarian' | 'vegan';
export type Condition = 'diabetes' | 'hypertension' | 'pregnant' | 'breastfeeding';
export type Allergy = 'nuts' | 'dairy' | 'gluten' | 'egg' | 'soy' | 'seafood';
export type Cuisine =
  | 'indian'
  | 'mediterranean'
  | 'eastAsian'
  | 'mexican'
  | 'american'
  | 'middleEastern';

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type MealTimes = Record<MealSlot, string>; // "HH:MM"

export type Profile = {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: Goal;
  workMode: WorkMode;
  jobActivity: JobActivity;
  dailySteps: number;
  workoutDays: number;
  workoutMinutes: number;
  workoutIntensity: Intensity;
  workoutPlace: WorkoutPlace;
  sleepHours: number;
  diet: Diet;
  allergies: Allergy[];
  cuisines: Cuisine[];
  conditions: Condition[];
  mealTimes: MealTimes;
  remindersOn: boolean;
  createdAt: string;
};

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

// Share of the day's intake each meal is planned to carry.
export const MEAL_SHARE: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  snack: 0.1,
  dinner: 0.3,
};

export const DEFAULT_MEAL_TIMES: MealTimes = {
  breakfast: '08:30',
  lunch: '13:00',
  snack: '17:00',
  dinner: '20:00',
};
