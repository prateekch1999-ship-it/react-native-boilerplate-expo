/**
 * Crash and error reporting, behind one small surface.
 *
 * This is for the errors you *catch* — the ones that would otherwise be a
 * `console.warn` nobody ever reads — plus the breadcrumbs and the user id that
 * make a later report readable.
 *
 * Out of the box reports go to the console, which is enough in development and
 * honest in production: nothing is silently dropped. Wiring a real reporter
 * (Crashlytics, Sentry, Bugsnag) means replacing the three `report*` functions
 * below and nothing else — no call site changes. Unhandled JS errors and native
 * crashes are the reporter's own global handler, not this file's job.
 */

type CrashContext = Record<string, string>;

let userId: string | null = null;
let lastBreadcrumb: string | null = null;

const Crash = {
  /**
   * Leaves a breadcrumb for the next report. Cheap enough to put either side of
   * anything fragile; it is only read if a failure follows.
   */
  breadcrumb(message: string): void {
    lastBreadcrumb = message;
  },

  /**
   * Reports an error the app handled. Takes `unknown` because that is what a
   * `catch` gives you — a thrown string still gets reported instead of being
   * dropped for not being an `Error`.
   *
   * `context` identifies this failure; pass what names it, not a whole payload.
   */
  recordError(error: unknown, context?: CrashContext): void {
    const reportable = error instanceof Error ? error : new Error(String(error));

    console.error('[crash]', reportable, {
      ...context,
      ...(userId ? { userId } : null),
      ...(lastBreadcrumb ? { breadcrumb: lastBreadcrumb } : null),
    });
  },

  /** Names the person a later report happened to, or clears them on sign-out. */
  setUser(id: string | null): void {
    userId = id;
  },
};

export default Crash;
