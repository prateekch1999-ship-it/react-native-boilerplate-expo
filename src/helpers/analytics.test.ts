import type AnalyticsType from '@app-helpers/analytics';

/**
 * What is worth testing here is the seam, not the SDK: a call from a screen has
 * to reach the client, and a missing API key must leave every call a no-op
 * rather than throwing into the screen that made it.
 *
 * Every test loads the helper fresh, because the client is module state — it is
 * built once, at import, from the environment.
 */

const mockCapture = jest.fn();
const mockIdentify = jest.fn();
const mockReset = jest.fn();
const mockScreen = jest.fn();

/**
 * `requireActual` loads the real helper while leaving its own imports mocked,
 * which a plain `import` at the top of the file cannot do once the registry has
 * been reset.
 */
function loadAnalytics(): typeof AnalyticsType {
  jest.resetModules();
  return jest.requireActual<{ default: typeof AnalyticsType }>('@app-helpers/analytics').default;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test';
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  jest.restoreAllMocks();
});

describe('Analytics', () => {
  it('sends a tracked event to the client', () => {
    const Analytics = loadAnalytics();

    Analytics.track('order_placed', { items: 2 });

    expect(mockCapture).toHaveBeenCalledWith('order_placed', { items: 2 });
  });

  it('sends a screen view', () => {
    const Analytics = loadAnalytics();

    Analytics.screen('Home');

    expect(mockScreen).toHaveBeenCalledWith('Home', undefined);
  });

  it('identifies and then forgets a person', () => {
    const Analytics = loadAnalytics();

    Analytics.identify('user-1', { plan: 'free' });
    Analytics.reset();

    expect(mockIdentify).toHaveBeenCalledWith('user-1', { plan: 'free' });
    expect(mockReset).toHaveBeenCalled();
  });

  it('stays a no-op without an API key, and says so once', () => {
    delete process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    const Analytics = loadAnalytics();

    expect(() => Analytics.track('order_placed')).not.toThrow();
    expect(mockCapture).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('analytics is off'));
  });
});

jest.mock('posthog-react-native', () =>
  jest.fn().mockImplementation(() => ({
    capture: mockCapture,
    identify: mockIdentify,
    reset: mockReset,
    screen: mockScreen,
  })),
);
