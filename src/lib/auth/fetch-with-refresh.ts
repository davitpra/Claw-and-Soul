/**
 * Enhanced fetch wrapper with automatic token refresh
 *
 * This wrapper automatically handles token expiration:
 * 1. Makes the original request
 * 2. If 401 Unauthorized, attempts to refresh the token
 * 3. Retries the original request with the new token
 * 4. If refresh fails, redirects to login
 */

import { refreshToken } from './client';

interface FetchWithRefreshOptions extends RequestInit {
  skipRefresh?: boolean; // Set to true to prevent refresh retry
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Fetch wrapper that automatically refreshes tokens on 401 errors
 */
export async function fetchWithRefresh(
  url: string,
  options: FetchWithRefreshOptions = {}
): Promise<Response> {
  const { skipRefresh, ...fetchOptions } = options;

  // Ensure credentials are included for cookie-based auth
  const enhancedOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
  };

  // Make the initial request
  let response = await fetch(url, enhancedOptions);

  // If not a 401 error, return the response
  if (response.status !== 401 || skipRefresh) {
    return response;
  }

  // Token is expired or invalid, try to refresh
  try {
    // If already refreshing, wait for that refresh to complete
    if (isRefreshing && refreshPromise) {
      await refreshPromise;
    } else {
      // Start a new refresh
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          await refreshToken();
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();
      await refreshPromise;
    }

    // Retry the original request with the new token
    response = await fetch(url, enhancedOptions);
    return response;
  } catch (error) {
    // Refresh failed, user needs to log in again
    console.error('Token refresh failed:', error);

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw error;
  }
}

/**
 * Helper function for JSON API calls with automatic token refresh
 */
export async function fetchJSON<T>(
  url: string,
  options: FetchWithRefreshOptions = {}
): Promise<T> {
  const response = await fetchWithRefresh(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
