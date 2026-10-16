# Contributing rules

The standards for this repository. They apply to every contributor and to every coding agent —
Claude Code, Codex, Cursor, Copilot, Gemini, whatever you use. If your agent produces code that
breaks a rule here, the rule wins: fix the code.

Two documents, two jobs:

- **RULES.md** (this file) — how we write and ship code: standards, checks, commits, branches.
- **[AGENTS.md](AGENTS.md)** — how _this app_ is built: folder layout, import aliases, navigation,
  services, storage, Expo workflow. Read it before writing a feature.

## Non-negotiables

These block a merge. Everything else is a conversation.

1. **No secrets in the repo or in the bundle.** `EXPO_PUBLIC_*` values are inlined into the app and
   readable from a shipped binary — public configuration only. Keys and secrets live in EAS
   secrets or behind a server. `.env*` is gitignored; `.env.example` is the committed template.
2. **Credentials go in `Locker` (SecureStore), never in `Storage` (MMKV).** Tokens, refresh tokens,
   biometric flags. Always reached through `StorageService`, never by touching a store directly.
3. **Validate data crossing a trust boundary.** Anything security- or money-relevant gets parsed
   and checked before it reaches a screen — `parseSession` in `auth.service.ts` is the pattern.
4. **Never swallow an error.** No empty `catch`. Either handle it, or let it reject with an
   `ApiError` so the caller can. A storage outage must be visible, not silent.
5. **No `any` in an exported signature.** `unknown` plus a narrowing check instead.
6. **Never register interceptors on the global `axios` default.** One instance per backend via
   `createClient()`. The last global registration silently wins and decides everyone's auth header.
7. **New dependency? `npx expo install <pkg>`**, so the version matches the SDK. Ask whether a few
   lines would do first. Native code means the app needs a new dev build, not Expo Go.

## Before you commit

```bash
npm run verify      # lint + typecheck + test, the whole thing
npm run format      # prettier --write .
```

Git hooks run this for you (husky, installed by `npm install`):

| Hook         | Runs                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| `pre-commit` | `lint-staged` (eslint `--fix` then prettier on staged files), `tsc --noEmit`, `jest` |
| `commit-msg` | commit message must be conventional                                                  |

Both take a couple of seconds. **Do not use `--no-verify`.** If a hook is wrong, fix the hook in
the same PR.

## Style

Formatting is not a discussion: **prettier owns it.** `.prettierrc` is the single source — single
quotes, 100 columns, trailing commas, JSX bracket on the closing line. Don't hand-align around it
and don't add formatting rules to eslint.

The rest:

- **TypeScript, strict.** Types describe intent: `type Session = {...}`, not `object`.
- **Named exactly what it is.** `check.getAuthToken()`, not `get('jwt')`. Booleans read as claims:
  `isLoggedIn`, `userOnboarded`. No abbreviations that need a comment.
- **Don't mutate.** Return a new object; `const` by default.
- **Small units.** Functions under ~50 lines, files under ~400 — split at 800. A file that holds
  two ideas is two files.
- **Early returns over nesting.** Past three levels of indentation, extract.
- **Named constants for meaningful numbers.** `DEFAULT_TIMEOUT_MS`, not `30000`. Spacing and colour
  come from `@app-experience/theme`, never a raw value.
- **No `console.log` left behind**, no commented-out code, no `TODO` without a name or an issue.
- **Comments explain _why_.** The code already says what. A deliberate oddity (403 resolving
  instead of rejecting) gets a comment saying it is deliberate, so nobody "fixes" it.
- **Every component and screen folder has the same shape** — see the layouts in AGENTS.md. Copy an
  existing folder rather than inventing a new arrangement.

## Tests

`jest` with the `jest-expo` preset. Tests sit next to the code: `src/services/http.test.ts`.

**Coverage is a ratchet, not a target.** `npm run verify` runs `jest --coverage`, and
`coverageThreshold` in `package.json` holds the level the suite was at when it last moved —
today 50% of statements, 35% of branches, measured over `src` minus the route files, interfaces
and stylesheets. The number exists to stop coverage falling, so **raise it when you add tests**
and never lower it to make a build pass. 80% is where this is going; it is not there yet, and a
threshold that lies about today would be worse than one that does not.

Component tests use `@testing-library/react-native` through `jest/render.tsx`:
`await renderWithStore(<Hint message="…" />)` for anything that reads the store. Both `render`
and `fireEvent` are async from v14 — a missing `await` fails with "`render` function has not
been called". Query by role, label or text, never by `testID`, so a test that passes is also
evidence the screen reader has something to announce. `jest/setup.ts` stubs the native modules
every component drags in (MMKV) and sets the one required env value, so no test file has to.

Anything with a branch, a loop, a parser, or a money/auth path ships with a test. A one-line
re-export does not. Prefer one test that fails loudly if the logic breaks over five that restate
the implementation — `http.test.ts` covers five behaviours in 120 lines and needed no production
seam to do it.

Arrange–Act–Assert, and a name that states the behaviour:

```ts
it('omits the Authorization header when skipAuth is set', () => { ... });
```

Test through the real code path. Pass a per-request axios `adapter` rather than mocking the `axios`
module, so the actual interceptors run. Never add a parameter to production code that only a test
uses.

## Commits

```
<type>: <description>

<optional body explaining why>
```

`feat` `fix` `refactor` `docs` `test` `chore` `perf` `ci` — optional scope, imperative mood,
lower case, no trailing period. Enforced by the `commit-msg` hook.

```
feat(orders): add repeat-order button
fix: stop the 401 handler signing out twice on concurrent requests
```

One logical change per commit. Say _why_ in the body when the reason isn't obvious from the diff.

## Branches and PRs

| Branch        | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `main`        | production releases only. Never commit to it directly.           |
| `development` | default branch, day-to-day work, and the target for **every** PR |

```bash
git checkout development && git pull
git checkout -b feat/repeat-orders
# … work, commit …
git push -u origin feat/repeat-orders
gh pr create --base development
```

Branch names: `feat/…`, `fix/…`, `refactor/…`, `chore/…`. A PR describes what changed, why, and how
it was verified. Head branches are deleted automatically on merge. `main` only ever moves by
merging `development` into it for a release.

## Adding to this file

A rule earns its place by having cost someone something. If you hit a problem this file didn't
prevent, add the rule in the same PR as the fix — and put architecture facts in
[AGENTS.md](AGENTS.md) instead, so the two don't drift.
