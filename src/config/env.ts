/**
 * Every environment value the app reads, resolved once at startup.
 *
 * `EXPO_PUBLIC_*` variables are inlined into the JS bundle at build time and
 * can be read out of a shipped binary, so only public configuration belongs
 * here. Real secrets live in EAS secrets and never reach the client.
 *
 * Services import `Env`, never `process.env` — so there is one place to look
 * when a deployment points at the wrong backend.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.development, set it, and restart the dev server.`,
    );
  }
  return value;
}

/** PostHog's US cloud. EU projects use https://eu.i.posthog.com. */
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

const Env = Object.freeze({
  // Each read must be a literal `process.env.X`: Metro substitutes that exact
  // form at build time, and a computed `process.env[name]` stays undefined in
  // a release bundle.
  apiUrl: required('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),

  // Optional on purpose: analytics must never be the reason the app won't
  // start. Without a key the telemetry helpers no-op and say so once.
  posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? null,
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST,
});

export default Env;
