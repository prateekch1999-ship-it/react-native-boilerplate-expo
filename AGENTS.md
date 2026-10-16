This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

**Coding standards live in [RULES.md](RULES.md)** — commit format, branch model, style, test
expectations, and the non-negotiables. Read it first; this file covers how the app is built.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npm test                    # jest (jest-expo preset)
npm run verify              # lint + typecheck + test in one go
npm run format              # prettier --write .
npx expo-doctor             # diagnose dependency and config issues (see the native-folders note)
npx expo install --fix      # fix incompatible package versions
```

Run `npm run verify` before declaring any task done.

Husky hooks enforce it anyway: `pre-commit` runs lint-staged (eslint `--fix` then prettier on
staged files), `tsc --noEmit` and the test suite; `commit-msg` rejects a non-conventional message.
`npm install` installs them via the `prepare` script. Never bypass with `--no-verify`.

Formatting belongs to prettier — `.prettierrc` is the only place it is configured, and eslint
carries no stylistic rules. Do not hand-format around it.

Tests sit next to the code (`src/services/http.test.ts`). `tsconfig.json` sets
`"types": ["jest"]` because TypeScript 6 no longer auto-includes `node_modules/@types`, and the
`@app-*` aliases are restated in the `jest.moduleNameMapper` block of `package.json` — jest-expo
does not read `tsconfig` `paths`.

`moduleNameMapper` also pins `immer` to its CJS entry. immer's `exports` map sends the
`react-native` condition at an ESM build, jest-expo resolves with that condition, and jest then
chokes on `export {` in an untransformed `node_modules` file. Redux Toolkit pulls immer in, so every
store test hits it. Metro is unaffected — this is a jest-only redirect to the same library.

Coverage has a ratchet in `package.json` (`jest.coverageThreshold`). Raise it when coverage rises;
never lower it to make a change fit.

## Project structure

```
src/
  app/          expo-router routes only — thin re-exports, _layout.tsx defines navigators
  components/   reusable UI, one kebab-case folder per component
  screens/      one container folder per screen, rendered by a route in app/
  navigation/   containers.ts — the route-name registry
  services/     http.ts (axios clients), storage.service.ts (key registry), one *.service.ts per API domain
  config/       env.ts — the only place process.env is read
  helpers/      navigation.ts, storage.ts (MMKV), locker.ts (SecureStore), analytics.ts,
                crash.ts, notifications.ts, countdown.ts, phone.ts — primitives, no domain knowledge
  store/        Redux Toolkit store + one *.slice.ts per concern
  experience/   tokens/ (colors, metrics, typography), theme.ts (single entry point), strings.ts
  hooks/        shared hooks (use-theme.ts, use-strings.ts, use-network.ts, …)
jest/           setup.ts (native stand-ins) + render.tsx (mount inside the app's providers)
plugins/        config plugins applied in app.json
```

### Import aliases

One alias per top-level folder, declared **only** in `tsconfig.json` `paths`:

| Alias               | Resolves to        |
| ------------------- | ------------------ |
| `@app-components/*` | `src/components/*` |
| `@app-config/*`     | `src/config/*`     |
| `@app-experience/*` | `src/experience/*` |
| `@app-helpers/*`    | `src/helpers/*`    |
| `@app-hooks/*`      | `src/hooks/*`      |
| `@app-navigation/*` | `src/navigation/*` |
| `@app-screens/*`    | `src/screens/*`    |
| `@app-services/*`   | `src/services/*`   |
| `@app-store/*`      | `src/store/*`      |
| `@app-assets/*`     | `assets/*`         |

There is **no `babel.config.js` and no `babel-plugin-module-resolver`** — Expo's Metro reads
`tsconfig` `paths` natively, so an alias costs one line in one file. Do not add
`@react-native/babel-preset`: it would displace `babel-preset-expo`, which supplies expo-router's
entry, the React Compiler (`experiments.reactCompiler`) and Reanimated's plugin.

Adding a folder under `src/` means adding its alias in two places: `tsconfig.json` `paths` and
`jest.moduleNameMapper` in `package.json`. No deep relative imports (`../../components/x`);
relative imports are for files inside the same folder.

Import design tokens from `@app-experience/theme` (it re-exports `tokens/`), never from the token
files, so there is one path to update if tokens move into a shared package. Use `Spacing` and
`MaxContentWidth` instead of raw numbers, and `useTheme()` instead of reading `Colors` directly in
components.

### Component folder layout

Every component is a folder of up to three files:

```
src/components/order-card/
  index.tsx     the component; imports its own styles and props type
  interface.ts  props and any other types the component exposes
  style.ts      StyleSheet, built from `Spacing` and other tokens
```

Import it by folder: `import { OrderCard } from '@app-components/order-card'`. Keep styles out of
`index.tsx` and types out of `style.ts`.

This template targets iOS and Android — there are no `.web.tsx` variants, so do not add any. If a
component ever needs platform-specific code, put `index.ios.tsx` / `index.android.tsx` in the same
folder; Metro resolves the right one and importers never change.

`interface.ts` and `style.ts` exist when there is something to put in them: a component with no
props gets no `interface.ts`, one with no static styles gets no `style.ts`. Do not commit empty
placeholder files.

### Screen (container) folder layout

Every screen's outermost element is `<Screen>` from `@app-components/screen`. It owns the background,
the safe-area insets, the keyboard lift and the scrolling content area, and takes `header` for a top
bar, `footer` for the action bar and `centered` for a centred layout. **Do not reach for
`SafeAreaView` in a screen** — besides the repetition, content in a plain `View` does not clip, so
when the keyboard takes the height it draws straight through whatever is below it.

The action bar **floats over** the content rather than sitting beside it, which is what gives the
frosted bar something to frost. `Screen` measures it and pads the scroll content by that much, so a
screen never has to leave room for its own button — but it does mean nothing else may assume the
bottom of the content area is the bottom of the screen.

A screen is a container folder under `src/screens/` plus a one-line route file. Copy the shape of
`src/screens/home/`:

```
src/screens/order-history/
  order-history-container.tsx             default export, composes the screen
  order-history-container.components.tsx  pieces used only by this screen
  order-history-container.interface.ts    props and types
  order-history-container.styles.ts       StyleSheet
src/app/order-history.tsx                 route -> export { default } from the container
```

Three edits go with it: register the path in `src/navigation/containers.ts`, add a `<Stack.Screen>`
in `src/app/_layout.tsx`, and add the screen's copy to `src/experience/strings.ts`.

`tsc` may fail straight after adding a route, with errors in `src/helpers/navigation.ts` rather than
in the new screen. Nothing is wrong with the code: `containers.ts` declares a path that
expo-router's generated `.expo/types/router.d.ts` has not caught up to, so the path is not yet in
its `Href` union. That file is written by the dev server, not by `tsc` — start Metro once and the
typecheck goes clean.

Dynamic segments keep their brackets in the route (`order/[id]`, `docs/[...slug]`) and lose them in
the screen folder; the container reads them with a typed `useLocalSearchParams`. Route groups like
`(tabs)` live in the file path only.

The container lives outside `src/app/` on purpose: expo-router builds its route table from every
`.ts`/`.tsx` file under `src/app/` (see the `require.context` regex in
`node_modules/expo-router/_ctx.ios.js`), so a colocated `.styles.ts` would register as a route with
no default export. Route files stay a single re-export — put logic in the container.

Promote a piece out of `*-container.components.tsx` into its own `src/components/` folder as soon as
a second screen needs it.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Rules for this app's navigation

- **No raw path strings.** Every destination comes from `Containers` in
  `src/navigation/containers.ts`, so a name arriving from a server or a push payload can be resolved
  with `resolveContainer(name)`.
- **One navigator.** `src/app/_layout.tsx` holds the only `<Stack>`. When a screen set depends on
  state — signed in or not, onboarded or not — select it with `<Stack.Protected guard={...}>`;
  never branch `initialRouteName` and never mount a second navigator.
- **Outside the component tree, use `NavigationHelper`** (`src/helpers/navigation.ts`), which wraps
  expo-router's imperative `router`. Services, deep-link and notification handlers cannot call
  `useRouter()`. Inside components use `useRouter()` or `<Link />`.
- **No data fetching in layouts or navigators** — it belongs in the screen container.
- Deep links work off the file route + the `scheme` in `app.json`; there is no hand-written URL map
  to maintain. Add `src/app/+native-intent.tsx` if an incoming URL needs rewriting.

## State

Redux Toolkit, in `src/store/`. One slice per concern, `language.slice.ts` being the worked example:
a `createAsyncThunk` that writes through `StorageService` and tracks an event, plain selectors, and
an `initial*State()` reader that the store takes as `preloadedState`.

The store is built from storage rather than rehydrated into afterwards. MMKV and SecureStore both
read synchronously, so the first render is already correct — redux-persist would rehydrate a tick
later and bring back the flash of the wrong screen. Do not add a hydration/loading state for it.

Use `useAppSelector` / `useAppDispatch` from `@app-store/index`, never the untyped hooks.

## Services & data

### Where data goes

Call `StorageService` (`src/services/storage.service.ts`), never `Locker` or `Storage` directly. It
owns `STORAGE_KEYS` — the only place a key string is written — and routes each key to the right
store:

| Primitive                            | Holds                                                | Backed by                            |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------ |
| `Locker` (`src/helpers/locker.ts`)   | secrets: tokens, biometric flags                     | Keychain / Keystore, ~2 KB per value |
| `Storage` (`src/helpers/storage.ts`) | everything else: preferences, cached payloads, flags | MMKV, fast, unencrypted              |

Accessors group by intent: `check.*` reads, `save.*` writes, `remove.removeUser()` drops every
user-scoped key in one call (sign-out and a 401 both use it), `removeAll()` is a factory reset. Name
them for the domain concept — `check.getUserProfile()`, not `get('profile')`. Reads are synchronous;
deleting a secret is async because SecureStore has no sync delete.

Never put a secret in `Storage`, never bulk data in `Locker`. Both primitives JSON-serialise and
return `null`/`false` instead of throwing.

### HTTP

- **One axios instance per backend**, built by `createClient()` in `src/services/http.ts`, with
  interceptors attached to that instance. Never register on the global `axios` default: the last
  registration wins and silently decides every other caller's auth header.
- **Nothing outside `src/services/` imports axios.**
- Every response is assumed to be `{ message, data }`; the response interceptor resolves with that
  `data`, so callers get the payload directly. Failures reject with one `ApiError`
  (`{ status, code, message, data }`) — no screen parses an `AxiosError`.
- The client assumes **cookie-based sessions**: `withCredentials` is set, the native networking
  layer stores and sends the cookies, and nothing reads or attaches a token. A **401** refreshes the
  session (`REFRESH_PATH`) and retries the request once, and **only one refresh is ever in flight**
  because a refresh token is single-use. If the refresh is refused, user storage is cleared and the
  session ends — the interceptor never navigates.
- Bearer tokens instead? Change two things and nothing else: attach the header in the request
  interceptor, and point `REFRESH_PATH` at your endpoint (or delete the refresh branch).
- **403 resolves** with the error body instead of rejecting — a 403 payload is something screens
  need to read. Deliberate; do not "fix" it.
- Requests whose 401 is an answer rather than an expiry — login with a wrong password, signup,
  logout, the refresh itself — pass `{ skipAuth: true }` per request: no refresh, no sign-out,
  nothing reported. Never match on URL substrings.

### Domain services

One file per API domain (`orders.service.ts`, …), each a module of plain exported async functions —
typed argument in, typed result out. No static-only classes, no `(data, success, failure)`
callbacks, no single god-file. Request and response types live next to the function that uses them.
Validate anything security- or money-relevant before returning it, at the boundary, rather than
trusting the shape a server sent.

Test a client by passing a per-request axios `adapter` (see `http.test.ts`) rather than mocking the
`axios` module — the real interceptors run, nothing hits the network, and `createClient` needs no
test-only seam.

### Configuration

`src/config/env.ts` is the only place `process.env` is read, and it throws at startup naming the
missing variable. `EXPO_PUBLIC_*` values are inlined into the bundle and readable from a shipped
binary — public configuration only, never a key or a secret; those belong in EAS secrets. Each read
must be a literal `process.env.X`, because Metro does not substitute a computed `process.env[name]`.
`.env*` is gitignored apart from the committed `.env.example`.

### Environments

Two variants, and they install side by side on one device:

|                     | development           | production        |
| ------------------- | --------------------- | ----------------- |
| bundle id / package | `com.example.app.dev` | `com.example.app` |
| name under the icon | RN Boilerplate (Dev)  | RN Boilerplate    |
| deep-link scheme    | `rnboilerplate-dev`   | `rnboilerplate`   |
| env file            | `.env.development`    | `.env.production` |

`app.config.ts` applies those overrides on top of `app.json`, which still holds everything the two
share. It branches on `APP_VARIANT`, and anything other than `production` counts as development:
a build with a missing or misspelled variant lands on the dev bundle id, where the worst case is a
rejected store upload, instead of installing over the real app and reporting into production
analytics.

The env files set `APP_VARIANT`, so the variant follows `NODE_ENV` — which Expo CLI sets per
command, not per flag you pass it:

| command                                | NODE_ENV    | file loaded        | variant     |
| -------------------------------------- | ----------- | ------------------ | ----------- |
| `expo start`                           | development | `.env.development` | development |
| `expo start --no-dev`                  | production  | `.env.production`  | production  |
| `expo run:ios`                         | development | `.env.development` | development |
| `expo run:ios --configuration Release` | production  | `.env.production`  | production  |
| `expo run:android --variant release`   | production  | `.env.production`  | production  |
| `expo export`                          | production  | `.env.production`  | production  |
| `expo prebuild`                        | development | `.env.development` | development |
| `expo lint` / `install` / `config`     | development | `.env.development` | development |

Each command picks its mode with `setNodeEnv`, which assigns
`process.env.NODE_ENV = process.env.NODE_ENV || mode` — so a value already in the environment
always wins. `expo prebuild` is the one worth remembering: it defaults to **development**, and the
bundle id it bakes into `ios/` and `android/` is whatever the variant resolved to. Say the mode out
loud for a production prebuild or you get native projects carrying the dev bundle id:

```bash
NODE_ENV=production npx expo prebuild --clean
```

Within a mode the load order is `.env.<mode>.local`, `.env.local`, `.env.<mode>`, `.env` — the
first file to define a key wins, and a variable already exported in the shell beats every file.
That last part is the override hatch: `APP_VARIANT=production npx expo prebuild` works whatever the
files say. Personal overrides go in `.env.development.local`; never put them in `.env.local`, which
is loaded in _every_ mode and would shadow both environments at once.

### Analytics and crash reporting

Call `Analytics` (`src/helpers/analytics.ts`) and `Crash` (`src/helpers/crash.ts`). Nothing else
imports an analytics or reporting SDK.

| Call                                               | Goes to                                               |
| -------------------------------------------------- | ----------------------------------------------------- |
| `Analytics.track('order_placed', { items: 3 })`    | PostHog `capture`                                     |
| `Analytics.screen(name)`                           | already called for every route by `useScreenTracking` |
| `Analytics.identify(userId)` / `Analytics.reset()` | wire these into your sign-in and sign-out             |
| `Crash.recordError(error, context?)`               | the console today — see below                         |
| `Crash.breadcrumb(message)`                        | carried into the next report                          |
| `Crash.setUser(id \| null)`                        | carried into later reports                            |

`Crash` has no backend wired on purpose. Point its `console.error` at Sentry or Crashlytics when the
app needs one; every call site already exists, so nothing else changes. Unhandled JS errors and
native crashes are that SDK's own global handler — `Crash.recordError` is for the ones you catch.

Events the app emits today. Add to this table when you add an event, so nobody has to grep for the
list:

| Event                     | Where                       | Why it exists                                                     |
| ------------------------- | --------------------------- | ----------------------------------------------------------------- |
| `$screen` / `screen_view` | `useScreenTracking`         | every route change                                                |
| `language_selected`       | `language.slice`            | the language someone chose, which is a product question           |
| `session_expired`         | `http.ts`, 401 branch       | an involuntary sign-out, not to be confused with a deliberate one |
| `api_request_failed`      | `http.ts`, catch-all branch | `status`, `code`, `path`, `method` — plus the error to `Crash`    |

API failures are reported once, in the response interceptor, never in a screen's catch block. The
reported `path` has its query string stripped, because that is where tokens and search terms live;
path segments are kept, since `/orders/abc123` is what makes the event debuggable. A 403 reports
nothing — it resolves, so it is not a failure.

Rules that are easy to get wrong:

- **Identify with an opaque id and nothing else.** No phone, name or email: that is PII sitting in a
  third-party tool. Adding a user property is a decision, not a default.
- **Event names are snake_case past-tense facts** — `order_placed`, `photo_uploaded`.
- **Event properties are `string | number | boolean` only.** Most backends drop or stringify
  anything else, so `EventProps` is narrower than the SDK's own type.
- **Analytics is never required to be present.** Without `EXPO_PUBLIC_POSTHOG_API_KEY` every call is
  a no-op and startup logs one warning. Analytics must never be the reason a screen goes down.

PostHog's capture endpoint answers `200 {"status":"Ok"}` to a **completely invalid** key — it
validates asynchronously. A 200 is not proof the key works; the only proof is seeing the event come
back out of the project.

### Icons

`<Icon name="shield-check" />` from `@app-components/icon`. The names are a design set's own 54, so
an artboard name is the code name; Lucide is the implementation behind them, chosen because its
drawing contract matches — 24 grid, 2 stroke, round caps and joins, currentColor.

**Import icons one file at a time**, as `lucide-react-native/icons/<name>`, never from the package
barrel. Metro does not tree-shake, so a single `import { Check } from 'lucide-react-native'` pulls
the whole catalogue in: measured at **6.80 MB against 4.80 MB** for the same app. The `Glyphs` map
in `src/components/icon/index.tsx` is the only place that imports them.

Lucide renames icons between majors — `trash-2` became `trash`, `help-circle` became
`circle-question-mark`. `icon.test.ts` asserts all 54 names still resolve, so a rename fails the
suite instead of leaving a blank space on a screen.

### Glass surfaces

`<Glass>` from `@app-components/glass` is the only thing that touches `expo-glass-effect`. It draws a
frosted surface on iOS 26 and the opaque `surface` colour everywhere else, which covers Android and
iOS 16.4–25 — the deployment target is 16.4, so the fallback is not hypothetical.

`canUseGlass()` is the capability check: liquid glass needs iOS 26 **and** the API present at
runtime, because some iOS 26 betas shipped without it and reaching for it there crashes. It is
resolved once per process. Both underlying checks return `false` off iOS without touching a native
module, so it is safe to ask on Android.

The fallback is deliberately opaque, not a translucent approximation. A hand-rolled blur behind an
action bar costs frames on low-end Androids, and the `Blur` tokens describe surfaces iOS blurs for
us — nothing sets a blur radius.

Do not nest glass inside glass; iOS renders it muddy. A frosted bar holds tinted controls — which is
why `PrimaryButton` passes `tint` rather than going clear, and why that also keeps its white label
legible instead of handing it whatever scrolled behind.

Under jest both availability checks return **`true`**, because jest-expo mocks the native module with
truthy values. A test that renders `Screen` therefore exercises the glass path, not the fallback.

### Lists

No list primitive is installed. Add `@shopify/flash-list` with the first real list — not `FlatList`,
and never `.map()` inside a `ScrollView`. v2 needs no `estimatedItemSize`, and
`@gorhom/bottom-sheet` exports a `BottomSheetFlashList` for a list inside a sheet, which is the
combination that otherwise fights over the drag gesture. Testing one needs the package's own
`jestSetup.js`, which stubs the item measurement that does not happen without a real layout pass.

### Bottom sheets

`<Sheet>` from `@app-components/sheet` wraps `@gorhom/bottom-sheet`: frosted background,
`Radius.sheet` on the top corners only, a drag handle, and a backdrop that dims the page and closes
on tap. It sizes itself to its content rather than taking snap points. Opened through its ref —
`sheet.current?.present()` — which is the library's own idiom.

Two providers in `src/app/_layout.tsx` make this work, and both are load-bearing:
`GestureHandlerRootView` must be the outermost view, because a gesture handler mounted outside it
silently never fires; `BottomSheetModalProvider` is the portal root, so a sheet opened from a screen
draws over the whole app instead of inside that screen.

`@gorhom/bottom-sheet` cannot be imported under jest today — it pulls in Reanimated 4, whose
`react-native-worklets` native module throws at import. That is why `sheet` and `animated-icon` have
no tests.

### Copy and languages

Every user-facing string lives in `src/experience/strings.ts`, in every language, and screens read
them with `useStrings()`. `hi` is typed against `en`, so a string added to one language and not the
other fails to compile — a half-translated screen is not shippable. `fill()` and `splitAround()`
handle sentences that wrap a value, because languages put the value in different places and
concatenation cannot follow that.

The active language is store state (`language.slice`), read from storage on the first render.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `npx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

`eas.json` holds four build profiles:

| Profile       | Build             | Variant     | Distribution               |
| ------------- | ----------------- | ----------- | -------------------------- |
| `development` | debug, dev client | development | internal (Android APK)     |
| `preview`     | release           | development | internal (Android APK)     |
| `simulator`   | release           | development | iOS simulator build        |
| `production`  | release           | production  | store (Android app bundle) |

`preview` builds the **dev** bundle id on purpose. There are only two bundle ids, and a build handed
to a tester has to install next to the store app rather than over it.

`APP_VARIANT` is pinned per profile in `eas.json`, so the value that picks the bundle id is readable
in the diff. Do not also create an `APP_VARIANT` environment variable in EAS: two sources for that
one value is how a production build ends up rejected for carrying the dev bundle id.

Everything else has to exist as an EAS environment variable, because EAS Build does not upload
gitignored files and `.env.production` therefore never reaches a cloud build. Each profile names the
environment it reads (`development`, `preview`, `production`), so set each variable in the matching
one:

```bash
eas env:set --name EXPO_PUBLIC_API_URL --value https://api.example.com/v1 \
  --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_POSTHOG_API_KEY --value phc_… \
  --environment production --visibility sensitive
```

`secret` visibility is wrong for an `EXPO_PUBLIC_*` value — it lands in the bundle either way, and
`secret` only stops the build from reading it. `eas env:list --environment production` shows what is
set.

Build versions are remote: `cli.appVersionSource` is `"remote"` (recommended since EAS CLI 12), EAS
stores `versionCode` and `buildNumber`, `production` carries `autoIncrement: true`, and build
versions in the app config are ignored. The user-facing `version` in `app.json` is still ours.

First time on an account or a machine:

```bash
npx eas-cli@latest login
npx eas-cli@latest init          # creates the project, writes extra.eas.projectId into app.json
npx eas-cli@latest update:configure  # writes the updates URL that expo-updates reads
npx eas-cli@latest device:create # iOS only, and only for internal distribution
npx eas-cli@latest build --profile development --platform android
```

`expo-updates` is installed and `runtimeVersion.policy` is `fingerprint`, so an OTA update only
reaches a build whose native fingerprint matches — a JS-only fix ships, a native change does not and
needs a new build. The profiles carry `channel` names already; `app.json` has no `updates.url` until
`update:configure` writes one.

## Rules

- `ios/` and `android/` are generated by `npx expo prebuild` and are **gitignored** (Continuous
  Native Generation). Never create or edit them by hand — anything changed there is silently lost
  on the next prebuild. Configure native behaviour in `app.json` and config plugins instead. A
  fresh clone has no native directories: run `npx expo prebuild`, then `npx pod-install` for iOS.
- `ios.bundleIdentifier` and `android.package` come from `app.config.ts` and differ per variant
  (see Environments). They get baked into the generated projects, so switching variant means
  re-running prebuild — and the production pair cannot change after the first store submission.
- `npx expo prebuild --clean` deletes and regenerates both directories. That is safe here, because
  nothing inside them is hand-written or committed.
- Run `npx pod-install` after adding or removing any dependency with native code.
- `plugins/with-ios-scene-lifecycle.js` adopts the UIScene life cycle, which the iOS 27 SDK makes
  mandatory — without it the app builds and then traps at launch. Expo 57 ships the runtime half
  (`ExpoAppSceneDelegate`) but its prebuild template does not wire it up, so the plugin ports the
  SDK 58 template back. Delete it when the app moves to SDK 58.
- `expo-doctor` reports one check fewer **once the native folders exist on disk** than on a clean
  clone without them. The check that fires is "app config fields that may not be synced in a
  non-CNG project" — it inspects the filesystem, not git, and warns that `orientation`, `icon`,
  `scheme`, `userInterfaceStyle`, `ios`, `android` and `plugins` in `app.json` only apply when
  prebuild runs. Expected either way.
- A debug APK/IPA contains no JavaScript — it loads the bundle from `npx expo start`. Anyone given
  one also needs the repo, `npm install`, a reachable Metro server, and their own
  `.env.development`, since `src/config/env.ts` throws on a missing `EXPO_PUBLIC_API_URL`. For a
  standalone build, `./gradlew assembleRelease` embeds the bundle and the env value.
- Expo Go only includes its bundled native modules. This app has native dependencies, so it needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
