// Daily targets from the user's profile.
// Energy: Mifflin-St Jeor BMR x physical activity level (PAL).
// Micronutrients: US/Canada Dietary Reference Intakes (RDA or AI; CDRR for sodium).
import { Nutrients, zeroNutrients } from './nutrients';
import { Profile } from './profile';

export type Targets = {
  nutrients: Nutrients;
  bmr: number;
  tdee: number;
  pal: number;
  proteinPerKg: number;
  notes: string[];
};

export function bmr(p: Pick<Profile, 'sex' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === 'male' ? base + 5 : base - 161;
}

const JOB_PAL = { desk: 1.2, onFeet: 1.45, manual: 1.65 } as const;
// Commuting and moving around an office adds activity over working from home.
const WORK_MODE_BONUS = { home: 0, hybrid: 0.05, office: 0.1 } as const;
// PAL added per weekly hour of exercise: (MET - 1) / 24 / 7 for ~3, 5 and 8 MET.
const PAL_PER_WEEKLY_HOUR = { light: 0.012, moderate: 0.024, intense: 0.042 } as const;

export function activityLevel(p: Profile): number {
  let pal = JOB_PAL[p.jobActivity] + WORK_MODE_BONUS[p.workMode];
  // Each 1000 steps above a 4000-step baseline adds roughly 0.02.
  pal += Math.max(0, (p.dailySteps - 4000) / 1000) * 0.02;
  if (p.workoutPlace !== 'none') {
    const weeklyHours = (p.workoutDays * p.workoutMinutes) / 60;
    pal += weeklyHours * PAL_PER_WEEKLY_HOUR[p.workoutIntensity];
  }
  return Math.min(2.2, Math.round(pal * 100) / 100);
}

function round(n: number) {
  return Math.round(n);
}

export function computeTargets(p: Profile): Targets {
  const notes: string[] = [];
  const base = bmr(p);
  const pal = activityLevel(p);
  const tdee = base * pal;

  let kcal = tdee;
  if (p.goal === 'lose') {
    const deficit = Math.min(500, tdee * 0.2);
    kcal = tdee - deficit;
    notes.push(`A ${round(deficit)} kcal daily deficit targets about ${(deficit * 7 / 7700).toFixed(1)} kg loss per week.`);
  } else if (p.goal === 'gain') {
    kcal = tdee + Math.min(350, tdee * 0.12);
    notes.push('A small surplus supports lean muscle gain alongside strength training.');
  }
  const pregnant = p.conditions.includes('pregnant');
  const breastfeeding = p.conditions.includes('breastfeeding');
  if (pregnant) kcal += 340;
  if (breastfeeding) kcal += 330;
  // Never plan below a safe floor without medical supervision.
  const floor = p.sex === 'male' ? 1500 : 1200;
  if (kcal < floor) {
    kcal = floor;
    notes.push('Calories were raised to a safe minimum.');
  }

  const trains = p.workoutPlace !== 'none' && p.workoutDays >= 2;
  let proteinPerKg = trains ? 1.4 : 1.0;
  if (p.goal === 'lose') proteinPerKg = Math.max(proteinPerKg, 1.6);
  if (p.goal === 'gain') proteinPerKg = 1.8;
  if (pregnant || breastfeeding) proteinPerKg = Math.max(proteinPerKg, 1.1);
  // Use target weight for protein when the user is aiming to lose a lot.
  const refWeight =
    p.goal === 'lose' && p.targetWeightKg && p.targetWeightKg < p.weightKg
      ? (p.weightKg + p.targetWeightKg) / 2
      : p.weightKg;
  const protein = proteinPerKg * refWeight;

  const fatShare = p.conditions.includes('diabetes') ? 0.33 : 0.28;
  const fat = (kcal * fatShare) / 9;
  const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
  if (p.conditions.includes('diabetes')) {
    notes.push('Carbs are moderated and spread across meals for steadier blood sugar.');
  }

  const n = zeroNutrients();
  n.kcal = round(kcal);
  n.protein = round(protein);
  n.fat = round(fat);
  n.carbs = round(carbs);
  n.fiber = round((kcal / 1000) * 14);
  n.sugar = round((kcal * 0.1) / 4);
  n.satFat = round((kcal * 0.1) / 9);

  const male = p.sex === 'male';
  const age = p.age;
  n.sodium = p.conditions.includes('hypertension') ? 1500 : 2300;
  n.potassium = male ? 3400 : 2600;
  n.calcium = age >= 71 || (!male && age >= 51) ? 1200 : 1000;
  n.iron = male || age >= 51 ? 8 : 18;
  n.magnesium = male ? (age <= 30 ? 400 : 420) : age <= 30 ? 310 : 320;
  n.zinc = male ? 11 : 8;
  n.vitA = male ? 900 : 700;
  n.vitC = male ? 90 : 75;
  n.vitD = age >= 71 ? 20 : 15;
  n.b12 = 2.4;
  n.folate = 400;
  if (p.diet === 'vegetarian' || p.diet === 'vegan') {
    // Non-heme iron is absorbed less well; DRI recommends 1.8x for vegetarians.
    n.iron = round(n.iron * 1.8);
    notes.push('Iron target is raised because plant iron is absorbed less efficiently.');
  }
  if (pregnant) {
    n.iron = 27;
    n.folate = 600;
    n.zinc = 11;
    n.b12 = 2.6;
    n.vitA = 770;
    n.vitC = 85;
    n.potassium = 2900;
    notes.push('Pregnancy targets are applied. Please confirm them with your doctor.');
  }
  if (breastfeeding) {
    n.iron = 9;
    n.folate = 500;
    n.zinc = 12;
    n.b12 = 2.8;
    n.vitA = 1300;
    n.vitC = 120;
    n.potassium = 2800;
  }

  return { nutrients: n, bmr: round(base), tdee: round(tdee), pal, proteinPerKg, notes };
}
