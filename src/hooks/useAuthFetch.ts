/**
 * Custom hook for making authenticated API requests
 * Automatically handles token refresh on 401 errors
 */

import { useCallback } from 'react';
import { fetchWithRefresh, fetchJSON } from '@/lib/auth/fetch-with-refresh';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useAuthFetch() {
  /**
   * Make an authenticated fetch request with automatic token refresh
   */
  const authFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
      return fetchWithRefresh(url, options);
    },
    []
  );

  /**
   * Make an authenticated JSON API request with automatic token refresh
   */
  const authFetchJSON = useCallback(
    async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
      return fetchJSON<T>(url, options);
    },
    []
  );

  /**
   * Helper methods for common HTTP verbs
   */
  const get = useCallback(
    async <T = any>(endpoint: string): Promise<T> => {
      return authFetchJSON<T>(endpoint, { method: 'GET' });
    },
    [authFetchJSON]
  );

  const post = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return authFetchJSON<T>(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [authFetchJSON]
  );

  const put = useCallback(
    async <T = any>(endpoint: string, data?: any): Promise<T> => {
      return authFetchJSON<T>(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [authFetchJSON]
  );

  const del = useCallback(
    async <T = any>(endpoint: string): Promise<T> => {
      return authFetchJSON<T>(endpoint, { method: 'DELETE' });
    },
    [authFetchJSON]
  );

  return {
    authFetch,
    authFetchJSON,
    get,
    post,
    put,
    delete: del,
  };
}
