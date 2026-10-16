import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import {
  createClient,
  REFRESH_PATH,
  setUnauthorizedHandler,
  type ApiError,
} from '@app-services/http';
import Analytics from '@app-helpers/analytics';
import Crash from '@app-helpers/crash';
import StorageService from '@app-services/storage.service';

// Mocked so the test never loads MMKV or SecureStore (native modules with no JS
// implementation under Jest) and never needs a real EXPO_PUBLIC_ var. Babel
// hoists these above the imports, so they are in place before the modules under
// test are loaded.
jest.mock('@app-config/env', () => ({
  __esModule: true,
  default: { apiUrl: 'https://test.local' },
}));

jest.mock('@app-helpers/analytics', () => ({
  __esModule: true,
  default: { track: jest.fn() },
}));

jest.mock('@app-helpers/crash', () => ({
  __esModule: true,
  default: { recordError: jest.fn() },
}));

jest.mock('@app-services/storage.service', () => ({
  __esModule: true,
  default: { remove: { removeUser: jest.fn(async () => true) } },
}));

const removeUser = jest.mocked(StorageService.remove.removeUser);
const track = jest.mocked(Analytics.track);
const recordError = jest.mocked(Crash.recordError);

const BASE_URL = 'https://test.local';

type Reply = { status: number; data?: unknown };

/** What the backend sends on success: everything is wrapped in an envelope. */
const ok = (data: unknown): Reply => ({ status: 200, data: { message: 'ok', data } });

function settle(config: InternalAxiosRequestConfig, { status, data }: Reply) {
  const response: AxiosResponse = {
    data,
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config,
  };
  // A custom adapter owns status validation — axios calls `settle` only inside
  // its own xhr/http adapters.
  if (status >= 200 && status < 300) return Promise.resolve(response);
  return Promise.reject(
    new AxiosError('Request failed', `ERR_${status}`, config, undefined, response),
  );
}

/**
 * A fake backend, passed per request so the real interceptors run with no
 * network. Answers each path from its own queue — the last reply repeats — and
 * records every request it sees.
 */
function fakeBackend(routes: Record<string, Reply[]>) {
  const seen: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = (config) => {
    seen.push(config);
    const queue = routes[config.url ?? ''] ?? [{ status: 404 }];
    const reply = queue.length > 1 ? queue.shift()! : queue[0];
    return settle(config, reply);
  };
  const calls = (url: string) => seen.filter((config) => config.url === url).length;
  return { adapter, seen, calls };
}

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  setUnauthorizedHandler(null);
});

describe('requests', () => {
  it('resolves with the envelope’s data and leaves auth to the cookies', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({ '/user/me': [ok({ id: 'u1' })] });

    const user = await client.get<{ id: string }>('/user/me', { adapter: backend.adapter });

    expect(user).toEqual({ id: 'u1' });
    expect(backend.seen[0].withCredentials).toBe(true);
    expect(backend.seen[0].headers.has('Authorization')).toBe(false);
  });
});

describe('expired access token', () => {
  it('refreshes once and retries the request, so the caller never sees the 401', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({
      '/orders': [{ status: 401 }, ok(['order-1'])],
      [REFRESH_PATH]: [ok(null)],
    });

    await expect(client.get('/orders', { adapter: backend.adapter })).resolves.toEqual(['order-1']);
    expect(backend.calls(REFRESH_PATH)).toBe(1);
    expect(backend.calls('/orders')).toBe(2);
    expect(removeUser).not.toHaveBeenCalled();
  });

  it('sends a single refresh when several requests 401 together', async () => {
    // The refresh token is single-use: a second refresh would log the user out
    // on every device. This is the test that must never be loosened.
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({
      '/a': [{ status: 401 }, ok('a')],
      '/b': [{ status: 401 }, ok('b')],
      '/c': [{ status: 401 }, ok('c')],
      [REFRESH_PATH]: [ok(null)],
    });

    const results = await Promise.all([
      client.get('/a', { adapter: backend.adapter }),
      client.get('/b', { adapter: backend.adapter }),
      client.get('/c', { adapter: backend.adapter }),
    ]);

    expect(results).toEqual(['a', 'b', 'c']);
    expect(backend.calls(REFRESH_PATH)).toBe(1);
  });

  it('signs out exactly once when the refresh itself is refused', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    const backend = fakeBackend({
      '/a': [{ status: 401 }],
      '/b': [{ status: 401 }],
      [REFRESH_PATH]: [{ status: 401, data: { message: 'Session expired' } }],
    });

    const results = await Promise.allSettled([
      client.get('/a', { adapter: backend.adapter }),
      client.get('/b', { adapter: backend.adapter }),
    ]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
    expect(backend.calls(REFRESH_PATH)).toBe(1);
    expect(removeUser).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('session_expired', { path: '/a', method: 'GET' });
  });

  it('retries only once — a 401 after a successful refresh ends the session', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({ '/orders': [{ status: 401 }], [REFRESH_PATH]: [ok(null)] });

    await expect(client.get('/orders', { adapter: backend.adapter })).rejects.toMatchObject({
      status: 401,
    });
    expect(backend.calls('/orders')).toBe(2);
    expect(backend.calls(REFRESH_PATH)).toBe(1);
    expect(removeUser).toHaveBeenCalledTimes(1);
  });

  it('keeps the user signed in when the refresh fails for some other reason', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({
      '/orders': [{ status: 401 }],
      [REFRESH_PATH]: [{ status: 503, data: { message: 'down' } }],
    });

    await expect(client.get('/orders', { adapter: backend.adapter })).rejects.toMatchObject({
      status: 503,
    });
    expect(removeUser).not.toHaveBeenCalled();
  });

  it('hands a skipAuth 401 straight back — a wrong password is not an expired session', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const body = { message: 'Invalid phone number or password', data: null };
    const backend = fakeBackend({ '/authentication/login': [{ status: 401, data: body }] });

    await expect(
      client.post(
        '/authentication/login',
        { phone_number: '9000000000', password: 'x' },
        { adapter: backend.adapter, skipAuth: true },
      ),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid phone number or password' });
    expect(backend.calls(REFRESH_PATH)).toBe(0);
    expect(removeUser).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});

describe('other responses', () => {
  it('resolves with the error body on 403 rather than rejecting', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const body = { message: 'Verify your account before ordering', data: null };
    const backend = fakeBackend({ '/orders': [{ status: 403, data: body }] });

    await expect(client.get('/orders', { adapter: backend.adapter })).resolves.toEqual(body);
    expect(removeUser).not.toHaveBeenCalled();
  });

  it('normalises any other failure into a single ApiError', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const body = { code: 'INTERNAL', message: 'boom' };
    const backend = fakeBackend({ '/orders': [{ status: 500, data: body }] });
    const expected: ApiError = { status: 500, code: 'INTERNAL', message: 'boom', data: body };

    await expect(client.get('/orders', { adapter: backend.adapter })).rejects.toEqual(expected);
  });
});

describe('telemetry', () => {
  it('reports a failed request to both tools, once, from the interceptor', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({
      '/orders': [{ status: 500, data: { code: 'INTERNAL', message: 'boom' } }],
    });

    await expect(
      client.post('/orders', { id: 1 }, { adapter: backend.adapter }),
    ).rejects.toBeDefined();

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('api_request_failed', {
      path: '/orders',
      method: 'POST',
      status: 500,
      code: 'INTERNAL',
    });
    expect(recordError).toHaveBeenCalledTimes(1);
    expect(recordError).toHaveBeenCalledWith(expect.any(AxiosError), {
      api_status: '500',
      api_code: 'INTERNAL',
    });
  });

  it('drops the query string from the reported path, where tokens live', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const url = '/orders?token=super-secret&q=paracetamol';
    const backend = fakeBackend({ [url]: [{ status: 500 }] });

    await expect(client.get(url, { adapter: backend.adapter })).rejects.toBeDefined();

    expect(track).toHaveBeenCalledWith(
      'api_request_failed',
      expect.objectContaining({ path: '/orders' }),
    );
    expect(JSON.stringify(track.mock.calls)).not.toContain('super-secret');
  });

  it('says nothing about a 403, which is a resolved response', async () => {
    const client = createClient({ baseURL: BASE_URL });
    const backend = fakeBackend({ '/orders': [{ status: 403, data: { message: 'no' } }] });

    await client.get('/orders', { adapter: backend.adapter });

    expect(track).not.toHaveBeenCalled();
    expect(recordError).not.toHaveBeenCalled();
  });
});
