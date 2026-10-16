import PostHog from 'posthog-react-native';

import Env from '@app-config/env';

/**
 * Product analytics, behind one small surface.
 *
 * Screens and services call `Analytics`; nothing else imports the SDK. One
 * function per thing you want to know, so the day the backend changes — or a
 * second one is added alongside — no call site moves.
 *
 * PostHog is optional at runtime: without `EXPO_PUBLIC_POSTHOG_API_KEY` every
 * call is a no-op and startup logs one warning. Nothing here throws into the
 * caller — an analytics outage must not take a screen down with it.
 */

/**
 * Keep event properties to primitives. Most analytics backends either drop or
 * stringify anything else, so narrowing here turns a silent drop into a compile
 * error.
 */
export type EventProps = Record<string, string | number | boolean>;

const posthog = Env.posthogApiKey
  ? new PostHog(Env.posthogApiKey, { host: Env.posthogHost })
  : null;

if (!posthog) {
  console.warn(
    '[analytics] no EXPO_PUBLIC_POSTHOG_API_KEY — analytics is off. Set it in .env.development to turn it on.',
  );
}

const Analytics = {
  /**
   * Ties everything that follows to one person.
   *
   * Pass an opaque user id and nothing else by default. A phone number, name or
   * email in here is PII sitting in a third-party tool — add a property only
   * once someone has decided it belongs there.
   */
  identify(userId: string, properties?: EventProps): void {
    posthog?.identify(userId, properties);
  },

  /**
   * Records one thing a person did. Use snake_case names that read as
   * past-tense facts: `order_placed`, `photo_uploaded`.
   */
  track(event: string, properties?: EventProps): void {
    posthog?.capture(event, properties);
  },

  /**
   * Records a screen view. Called for you on every navigation by
   * `useScreenTracking` — call it by hand only for a view that is not a route.
   */
  screen(name: string, properties?: EventProps): void {
    void posthog?.screen(name, properties);
  },

  /**
   * Forgets who the person was, on sign-out. Without this the next user of the
   * device inherits the previous one's identity.
   */
  reset(): void {
    posthog?.reset();
  },
};

export default Analytics;
