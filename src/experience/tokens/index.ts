/**
 * The design tokens this app is built from: colours, layout measurements and a
 * type scale.
 *
 * Deliberately dependency-free — plain values with local types — so a token can
 * be read by anything, including a script or a test that is not an app. Anything
 * that needs a framework (React Navigation's theme, a platform check) belongs in
 * `../theme.ts`, not here.
 *
 * Replace these values with your own product's; keep the names, and every screen
 * follows.
 */

export * from './colors';
export * from './metrics';
export * from './typography';
