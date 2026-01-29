/**
 * Hook for proactive token refresh
 * Automatically refreshes the access token before it expires
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { refreshToken } from '@/lib/auth/client';

interface UseTokenRefreshOptions {
  /**
   * Time before expiration to refresh the token (in milliseconds)
   * Default: 2 minutes (120000ms)
   */
  refreshBeforeExpiry?: number;

  /**
   * Enable/disable automatic refresh
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Proactively refreshes the access token before it expires
 *
 * The access token expires in 15 minutes. This hook refreshes it
 * at 13 minutes (2 minutes before expiry) to ensure uninterrupted service.
 *
 * Usage:
 * ```tsx
 * function MyApp() {
 *   useTokenRefresh(); // Enable automatic token refresh
 *   return <YourComponents />;
 * }
 * ```
 */
export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    refreshBeforeExpiry = 2 * 60 * 1000, // 2 minutes before expiry
    enabled = true,
  } = options;

  const { isAuthenticated } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if user is authenticated and feature is enabled
    if (!isAuthenticated || !enabled) {
      return;
    }

    // Access token expires in 15 minutes (900000ms)
    // Refresh at 13 minutes (780000ms)
    const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes
    const refreshInterval = ACCESS_TOKEN_LIFETIME - refreshBeforeExpiry;

    const scheduleRefresh = () => {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Schedule the next refresh
      timerRef.current = setTimeout(async () => {
        try {
          console.log('[Token Refresh] Proactively refreshing token...');
          await refreshToken();
          console.log('[Token Refresh] Token refreshed successfully');

          // Schedule the next refresh
          scheduleRefresh();
        } catch (error) {
          console.error('[Token Refresh] Failed to refresh token:', error);
          // Don't schedule another refresh if it failed
          // The fetchWithRefresh interceptor will handle it on the next API call
        }
      }, refreshInterval);
    };

    // Start the refresh cycle
    scheduleRefresh();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isAuthenticated, enabled, refreshBeforeExpiry]);
}
