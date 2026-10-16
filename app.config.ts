import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Per-environment overrides on top of app.json.
 *
 * app.json keeps everything the two environments share. This file changes only
 * what has to differ so a dev build and the real app can sit on the same device
 * at the same time: the bundle id, the name under the icon, and the deep-link
 * scheme.
 *
 * Everything is read inside the function rather than at module load, so the
 * environment that applies is the one present when Expo resolves the config.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  /**
   * The variant comes from APP_VARIANT, which the .env files set locally and the eas.json build
   * profiles set for cloud builds. Anything other than "production" is treated as development on
   * purpose. A build whose variant is missing or misspelled then lands on the dev bundle id, where
   * the worst case is a rejected store upload — the opposite default would install a debug build
   * over the real app and pour its events into production analytics.
   */
  const isProduction = process.env.APP_VARIANT === 'production';

  /** Rename both for your app; the dev suffix is what lets the two builds coexist on one device. */
  const bundleId = isProduction ? 'com.example.app' : 'com.example.app.dev';

  return {
    ...config,
    // Both are required by ExpoConfig; the slug identifies the EAS project and
    // must stay the same across variants, so it is read back from app.json.
    name: isProduction ? 'RN Boilerplate' : 'RN Boilerplate (Dev)',
    slug: config.slug ?? 'rn-boilerplate',
    // Two apps answering to one scheme means the OS picks the winner.
    scheme: isProduction ? 'rnboilerplate' : 'rnboilerplate-dev',
    ios: {
      ...config.ios,
      bundleIdentifier: bundleId,
    },
    android: {
      ...config.android,
      package: bundleId,
    },
  };
};
