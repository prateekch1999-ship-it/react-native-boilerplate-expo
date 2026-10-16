/**
 * What every test needs before it can mount anything.
 *
 * `src/config/env.ts` throws when `EXPO_PUBLIC_API_URL` is unset — deliberately,
 * so a misconfigured build fails at startup rather than on its first request.
 * Jest loads no `.env` file, and any component test reaches the store, which
 * reaches `Analytics`, which reads `Env`. A value here rather than a mock of
 * `@app-config/env`, so `env.ts`'s own rules still run.
 */
process.env.EXPO_PUBLIC_API_URL ??= 'https://test.local/v1';

/**
 * MMKV is native (through nitro-modules), and that same import chain reaches it:
 * store -> storage.service -> Storage. An in-memory stand-in rather than a mock
 * of `@app-helpers/storage`, so the real reader, writer and their try/catches
 * stay under test.
 */
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const entries = new Map<string, string>();
    return {
      set: (key: string, value: string) => entries.set(key, value),
      getString: (key: string) => entries.get(key),
      remove: (key: string) => entries.delete(key),
      clearAll: () => entries.clear(),
    };
  },
}));
