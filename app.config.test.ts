import type { ConfigContext } from 'expo/config';

import defineConfig from './app.config';

const originalEnv = process.env;

const context: ConfigContext = {
  projectRoot: '.',
  staticConfigPath: './app.json',
  packageJsonPath: './package.json',
  config: { name: 'RN Boilerplate', slug: 'rn-boilerplate' },
};

const resolveConfig = (env: Record<string, string | undefined>) => {
  process.env = { ...originalEnv, ...env };
  return defineConfig(context);
};

afterEach(() => {
  process.env = originalEnv;
});

describe('app config', () => {
  it('lands on the development variant when APP_VARIANT is unset', () => {
    const config = resolveConfig({ APP_VARIANT: undefined });

    expect(config.ios?.bundleIdentifier).toBe('com.example.app.dev');
    expect(config.android?.package).toBe('com.example.app.dev');
    expect(config.scheme).toBe('rnboilerplate-dev');
  });

  it('lands on the development variant when APP_VARIANT is misspelled', () => {
    const config = resolveConfig({ APP_VARIANT: 'Production' });

    expect(config.ios?.bundleIdentifier).toBe('com.example.app.dev');
    expect(config.name).toBe('RN Boilerplate (Dev)');
  });

  it('uses the production bundle id when APP_VARIANT is production', () => {
    const config = resolveConfig({ APP_VARIANT: 'production' });

    expect(config.ios?.bundleIdentifier).toBe('com.example.app');
    expect(config.android?.package).toBe('com.example.app');
    expect(config.name).toBe('RN Boilerplate');
    expect(config.scheme).toBe('rnboilerplate');
  });
});
