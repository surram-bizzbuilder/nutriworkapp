import { LogEntry, summarizeDay } from './guidance';
import { MEAL_LABEL, MEAL_SLOTS, MealSlot, Profile } from './profile';
import { Targets } from './targets';

const NUDGE_DELAY_MIN = 30; // remind 30 minutes after the planned meal time

export type Reminder = { date: Date; title: string; body: string };

function at(day: Date, hhmm: string, plusMin = 0): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(day);
  d.setHours(h, m + plusMin, 0, 0);
  return d;
}

// Pure planning step, kept separate so it can be unit tested.
export function planReminders(
  profile: Profile,
  targets: Targets,
  todaysEntries: LogEntry[],
  now: Date = new Date(),
): Reminder[] {
  if (!profile.remindersOn) return [];
  const out: Reminder[] = [];
  const day = summarizeDay(todaysEntries, targets.nutrients, profile, now);
  const name = profile.name ? `, ${profile.name}` : '';

  for (const meal of MEAL_SLOTS) {
    if (day.loggedMeals.includes(meal)) continue;
    const when = at(now, profile.mealTimes[meal], NUDGE_DELAY_MIN);
    if (when <= now) continue;
    const plan = day.next?.meal === meal ? day.next : undefined;
    out.push({
      date: when,
      title: `${MEAL_LABEL[meal]} time${name} 🍽️`,
      body: plan
        ? `Aim for about ${Math.round(plan.target.kcal)} kcal and ${Math.round(plan.target.protein)} g protein. Tap to log it in seconds.`
        : `Log your ${MEAL_LABEL[meal].toLowerCase()} to keep the rest of today balanced.`,
    });
  }

  const recap = at(now, '21:30');
  if (recap > now && !day.loggedMeals.includes('dinner')) {
    out.push({ date: recap, title: 'How did today go?', body: 'Log anything you missed and see your nutrient balance for the day.' });
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  for (const meal of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
    out.push({
      date: at(tomorrow, profile.mealTimes[meal], NUDGE_DELAY_MIN),
      title: `${MEAL_LABEL[meal]} time${name} 🍽️`,
      body: `Log your ${MEAL_LABEL[meal].toLowerCase()} and we'll plan your next meal around it.`,
    });
  }
  return out;
}
