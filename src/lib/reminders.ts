// Meal reminders. Instead of fixed repeating alarms, we schedule one-off notifications
// for the rest of today and tomorrow and reschedule whenever the log changes. That way
// a meal that's already logged never triggers a nag, and each reminder can carry the
// current plan ("aim for ~650 kcal and 40 g protein").
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { LogEntry } from './guidance';
import { Profile } from './profile';
import { planReminders } from './reminderPlan';
import { Targets } from './targets';

const CHANNEL = 'meals';

export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

let handlerSet = false;

export async function ensurePermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  if (!handlerSet) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerSet = true;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Meal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function syncReminders(profile: Profile, targets: Targets, todaysEntries: LogEntry[]) {
  if (!remindersSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!profile.remindersOn) return;
  const ok = await ensurePermission();
  if (!ok) return;
  for (const r of planReminders(profile, targets, todaysEntries)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body, data: { url: '/today' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL },
    });
  }
}
