import { create as createAxiosInstance } from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import Env from '@app-config/env';
import Analytics from '@app-helpers/analytics';
import type { EventProps } from '@app-helpers/analytics';
import Crash from '@app-helpers/crash';
import StorageService from '@app-services/storage.service';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * A 401 on this request is the caller's answer, not an expired session:
     * no refresh, no retry, no sign-out. Login (wrong password), signup, the
     * refresh call itself and logout set it. Per-request and explicit, so a
     * path rename can never silently change which calls refresh.
     */
    skipAuth?: boolean;
    /** Internal: this is the one retry after a refresh, so a second 401 ends the session. */
    isRetryAfterRefresh?: boolean;
  }
}

/** The backend's own guidance: long enough for a slow network, short enough to give up. */
const DEFAULT_TIMEOUT_MS = 15_000;

/** Issues new cookies from the refresh cookie. Only this module calls it. */
export const REFRESH_PATH = '/authentication/refreshToken';

/** The single failure shape every caller sees. No screen parses an AxiosError. */
export type ApiError = {
  status: number;
  code: string;
  message: string;
  data: unknown;
};

/**
 * What a client actually resolves with: the envelope's `data`, already
 * unwrapped. Axios's own `Promise<AxiosResponse<T>>` types would be a lie —
 * this interface states the truth.
 */
export interface ApiClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}

type ClientOptions = {
  baseURL: string;
  timeout?: number;
};

type ErrorBody = { code?: string; message?: string };

/**
 * Ends the session when it can no longer be refreshed.
 *
 * `useSessionBootstrap` registers sign-out here on mount. An interceptor runs
 * outside the component tree, and this app gates routes with
 * `<Stack.Protected guard={isLoggedIn}>` — so clearing session state is what
 * moves the user to login. The interceptor never navigates.
 */
let onUnauthorized: (() => void | Promise<void>) | null = null;

export function setUnauthorizedHandler(handler: (() => void | Promise<void>) | null): void {
  onUnauthorized = handler;
}

/** Collapses a burst of concurrent failures into a single sign-out. */
let isHandlingUnauthorized = false;

async function handleUnauthorized(): Promise<void> {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;
  try {
    await StorageService.remove.removeUser();
    await onUnauthorized?.();
  } finally {
    isHandlingUnauthorized = false;
  }
}

function toApiError(error: AxiosError<ErrorBody>): ApiError {
  const body = error.response?.data;
  return {
    // No response at all (offline, DNS failure, timeout) has no HTTP status.
    status: error.response?.status ?? 0,
    code: body?.code ?? error.code ?? 'UNKNOWN',
    message: body?.message ?? error.message,
    data: body ?? null,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'status' in value && 'code' in value;
}

/**
 * The request a failure belongs to, with the query string dropped — it is where
 * tokens and search terms live, and neither belongs in an analytics event.
 * Path segments are kept: `/orders/abc123` is what makes the event debuggable.
 */
function requestProperties(error: AxiosError<ErrorBody>): EventProps {
  const [path = ''] = (error.config?.url ?? '').split('?');
  return { path, method: (error.config?.method ?? 'get').toUpperCase() };
}

/**
 * One isolated instance per backend. Interceptors attach to the instance and
 * never to the global `axios` default — the last registration there would win
 * and silently decide every other caller's behaviour. The named `create` import
 * is deliberate: this module never holds the global instance, so it cannot
 * touch it by accident.
 *
 * Authentication is the backend's cookies, which the native networking layer
 * (OkHttp, NSURLSession) stores and sends on its own. Nothing here reads, keeps
 * or attaches a token, and no caller has to think about one: an expired access
 * cookie is refreshed and the request retried before the caller sees anything.
 */
export function createClient({ baseURL, timeout = DEFAULT_TIMEOUT_MS }: ClientOptions): ApiClient {
  const client = createAxiosInstance({
    baseURL,
    timeout,
    // Lets the native layer send and store the session cookies.
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  /**
   * The refresh token is single-use: two refreshes with the same one read as
   * theft, and the server logs the user out on every device. So there is only
   * ever one refresh in flight, and every 401 that lands meanwhile waits on it.
   * Do not call REFRESH_PATH from anywhere else.
   */
  let refreshing: Promise<unknown> | null = null;
  // Sent the same way as the request that needed it, over the same transport.
  const refreshSession = (failed: InternalAxiosRequestConfig): Promise<unknown> => {
    refreshing ??= client
      .post(REFRESH_PATH, undefined, { skipAuth: true, adapter: failed.adapter })
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  };

  async function endSession(error: AxiosError<ErrorBody>): Promise<never> {
    Analytics.track('session_expired', requestProperties(error));
    await handleUnauthorized();
    throw toApiError(error);
  }

  client.interceptors.response.use(
    // Every response is `{ message, data }`; callers get the `data`. Axios types this handler
    // as returning a response; ApiClient above states what really resolves.
    (response) => response.data?.data,
    async (error: AxiosError<ErrorBody>) => {
      const status = error.response?.status;
      const config = error.config;

      if (status === 401 && config && !config.skipAuth) {
        // Already refreshed once for this request: the session really is over.
        if (config.isRetryAfterRefresh) return endSession(error);

        try {
          await refreshSession(config);
        } catch (refreshError) {
          // A refusal means the session is gone. Anything else — offline, a
          // timeout, a 500 — is not proof of that, so the user stays signed in
          // and the caller gets the failure.
          if (isApiError(refreshError) && refreshError.status === 401) return endSession(error);
          throw refreshError;
        }

        // The server set fresh cookies; the same request now goes through.
        return client.request({ ...config, isRetryAfterRefresh: true });
      }

      // A 401 the caller asked for: wrong password, a session that is already
      // over. It is an answer, not a fault, so nothing is reported.
      if (status === 401) throw toApiError(error);

      // Deliberate, not an oversight: the API returns a payload screens need to
      // read on 403 (which permission is missing, what to do about it).
      // Resolving keeps that payload on the happy path instead of forcing every
      // caller into a catch block to find it. It resolves with the whole body,
      // because on a 403 the message is the part that matters.
      if (status === 403) return error.response?.data;

      // Every remaining failure is reported once, here, rather than in each
      // screen's catch block: PostHog to see how often and where, Crashlytics
      // for the stack and the breadcrumbs around it.
      const apiError = toApiError(error);
      Analytics.track('api_request_failed', {
        ...requestProperties(error),
        status: apiError.status,
        code: apiError.code,
      });
      Crash.recordError(error, { api_status: String(apiError.status), api_code: apiError.code });

      throw apiError;
    },
  );

  // One cast, here, because the response interceptor changed what resolves.
  // The alternative is a cast at every call site.
  return client as unknown as ApiClient;
}

/** The app's one client for its backend. Import this; never create another. */
export const apiClient = createClient({ baseURL: Env.apiUrl });
