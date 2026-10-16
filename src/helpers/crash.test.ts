import type CrashType from '@app-helpers/crash';

/**
 * What this file guards is the handled errors: a `catch` hands you `unknown`,
 * and anything that is not an `Error` must still arrive in the report rather
 * than being silently dropped for having the wrong type.
 */

function loadCrash(): typeof CrashType {
  jest.resetModules();
  return jest.requireActual<{ default: typeof CrashType }>('@app-helpers/crash').default;
}

let reported: jest.SpyInstance;

beforeEach(() => {
  reported = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  reported.mockRestore();
});

describe('Crash', () => {
  it('reports a thrown non-Error instead of dropping it', () => {
    const Crash = loadCrash();

    Crash.recordError('the API returned nonsense');

    const [, error] = reported.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('the API returned nonsense');
  });

  it('attaches context, so the report carries it', () => {
    const Crash = loadCrash();
    const failure = new Error('checkout failed');

    Crash.recordError(failure, { screen: 'checkout' });

    expect(reported).toHaveBeenCalledWith(
      '[crash]',
      failure,
      expect.objectContaining({ screen: 'checkout' }),
    );
  });

  it('carries the user and the last breadcrumb into the report', () => {
    const Crash = loadCrash();

    Crash.setUser('user-1');
    Crash.breadcrumb('tapped place order');
    Crash.recordError(new Error('boom'));

    expect(reported).toHaveBeenCalledWith(
      '[crash]',
      expect.any(Error),
      expect.objectContaining({ userId: 'user-1', breadcrumb: 'tapped place order' }),
    );
  });

  it('leaves a breadcrumb without reporting anything', () => {
    const Crash = loadCrash();

    Crash.breadcrumb('tapped place order');

    expect(reported).not.toHaveBeenCalled();
  });
});
