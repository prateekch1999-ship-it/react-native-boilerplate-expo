import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import Crash from '@app-helpers/crash';

/** The one channel the app posts to until it needs more (orders, offers…). */
export const DEFAULT_CHANNEL_ID = 'default';

/**
 * Asks once for permission to show notifications, with the system's own
 * pop-up. Resolves whether they are allowed; never rejects, because a refused
 * or failed ask must not stop whoever called it from carrying on.
 *
 * Already allowed, or refused for good, it resolves without showing anything:
 * the system only lets an app ask so many times, and asking again after a
 * hard no just does nothing.
 *
 * `channelName` is what Android shows for the channel in the app's settings,
 * so pass it in the user's language. Android 13+ shows no pop-up at all until
 * a channel exists, which is why it is created first.
 */
export async function askNotificationPermission(channelName: string): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
        name: channelName,
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;

    const answer = await Notifications.requestPermissionsAsync();
    return answer.granted;
  } catch (error) {
    // Reported, not thrown: the caller goes on either way, and a broken ask
    // should be visible to us rather than silently swallowed.
    Crash.recordError(error, { stage: 'notification-permission' });
    return false;
  }
}
