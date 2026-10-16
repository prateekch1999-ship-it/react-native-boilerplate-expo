# rn-boilerplate

A React Native / [Expo](https://expo.dev) starting point with the parts every app ends up needing
already wired together and under test: typed file-based routing, design tokens, a themed component
set, i18n, storage, an HTTP client, analytics, an error boundary, and a CI job that gates a merge.

Not a framework — plain Expo SDK 57. Everything here is code you own and are expected to edit.

## Start

```bash
npm install
cp .env.example .env.development     # EXPO_PUBLIC_API_URL is required; the app refuses to start without it
npx expo start
```

Native modules (MMKV, Reanimated, gesture handler, secure store) mean this needs a
[development build](https://docs.expo.dev/develop/development-builds/introduction/), not Expo Go:

```bash
npm run ios        # or: npm run android
```

## Make it yours

Five places carry the name; nothing else does.

| What                                   | Where                                    |
| -------------------------------------- | ---------------------------------------- |
| App name, slug, scheme, icons          | `app.json`                               |
| Bundle id, per-variant name and scheme | `app.config.ts` (+ `app.config.test.ts`) |
| Package name                           | `package.json`                           |
| Colours, spacing, type scale           | `src/experience/tokens/`                 |
| Copy, in every language                | `src/experience/strings.ts`              |

Then: `npm run verify` — lint, typecheck and tests, the same three CI runs.

## What's inside

```
src/app/            routes only — each file is a one-line re-export of a screen
src/screens/        one folder per screen: container, its own components, interface, styles
src/components/     the reusable set: Screen, ThemedText, buttons, Sheet, Icon, Hint, CrashScreen…
src/experience/     tokens/ (colours, metrics, typography), theme.ts, strings.ts
src/hooks/          useTheme, useTypography, useStrings, useNetwork, useScreenTracking
src/services/       http.ts (one axios instance per backend), storage.service.ts
src/helpers/        storage (MMKV), locker (SecureStore), analytics, crash, notifications, phone…
src/store/          Redux Toolkit, preloaded from storage so the first render is already right
src/navigation/     every route path, by name — nothing passes a raw string
jest/               setup + a render helper that wraps a component in the app's providers
```

[AGENTS.md](AGENTS.md) explains how these fit together — read it before adding a feature.
[RULES.md](RULES.md) is the standard everything is held to, including coding agents.

## Deliberately not included

Add these when the app needs them; each one is a seam, not a rewrite.

- **Auth.** No sign-in flow, no session slice. `http.ts` has the interceptor seam, and
  `storage.service.ts` has the profile key and a `UserProfile` type to replace.
- **A crash reporter.** `src/helpers/crash.ts` reports to the console. Point its three functions at
  Sentry or Crashlytics and no call site changes.
- **An EAS project.** `eas.json` has the four build profiles; `eas init` and
  `eas update:configure` fill in the project id and the updates URL.
- **A dark palette.** `Colors` has one `light` key. Add `dark` in the same shape and teach
  `useTheme()` to choose.
