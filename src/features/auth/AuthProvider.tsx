/**
 * Authentication Provider
 * 
 * Provides global auth context with separated concerns
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AuthStateManager } from './AuthStateManager';
import { createAuthService } from './AuthService';
import { SessionManager } from './SessionManager';
import { AuthContext, type AuthContextValue } from './context';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [stateManager] = useState(() => AuthStateManager.getInstance());
  const [authService] = useState(() => createAuthService());
  const [sessionManager] = useState(() => new SessionManager(authService));
  const [authState, setAuthState] = useState(() => stateManager.getState());

  // Initialize authentication on startup
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setAuthState);

    const initializeAuth = async () => {
      try {
        stateManager.setState({ isLoading: true });
        const sessionResponse = await authService.getSessionStatus();
        const sessionData = sessionResponse.data;

        // Check if sessionData exists and has the expected structure
        if (sessionData && typeof sessionData === 'object' && sessionData.authenticated) {
          stateManager.setState({
            isAuthenticated: true,
            address: sessionData.address,
            csrfToken: sessionData.csrfToken,
            sessionExpiry: sessionData.expiresAt ? new Date(sessionData.expiresAt).getTime() : undefined,
            isLoading: false,
            error: undefined
          });

          // Start session revalidation
          if (sessionData.csrfToken) {
            sessionManager.startRevalidation(
              sessionData.csrfToken,
              () => stateManager.clearSession(),
              (newToken, expiresAt) => stateManager.setState({
                csrfToken: newToken,
                sessionExpiry: expiresAt ? new Date(expiresAt).getTime() : undefined
              })
            );
          }
        } else {
          // Session data is invalid or user is not authenticated
          stateManager.setState({
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('🚨 Auth initialization failed:', error);
        stateManager.setState({
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Initialization failed'
        });
      }
    };

    initializeAuth();

    return () => {
      unsubscribe();
      sessionManager.destroy();
    };
  }, [stateManager, authService, sessionManager]);

  const establishSessionFromTransaction = useCallback(async (sessionId: string) => {
    try {
      stateManager.setState({ isLoading: true, error: undefined });
      const sessionData = await sessionManager.establishFromTransaction(sessionId);

      if (sessionData.authenticated) {
        stateManager.setState({
          isAuthenticated: true,
          address: sessionData.address,
          csrfToken: sessionData.csrfToken,
          sessionExpiry: sessionData.expiresAt ? new Date(sessionData.expiresAt).getTime() : undefined,
          isLoading: false,
          error: undefined
        });

        // Start revalidation
        if (sessionData.csrfToken) {
          sessionManager.startRevalidation(
            sessionData.csrfToken,
            () => stateManager.clearSession(),
            (newToken, expiresAt) => stateManager.setState({
              csrfToken: newToken,
              sessionExpiry: expiresAt ? new Date(expiresAt).getTime() : undefined
            })
          );
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session establishment failed';
      stateManager.setState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }, [stateManager, sessionManager]);

  const secureCall = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    if (!authState.isAuthenticated || !authState.csrfToken) {
      throw new Error('Authentication required: No valid session or CSRF token');
    }

    if (stateManager.isSessionExpired()) {
      stateManager.clearSession();
      throw new Error('Session expired: Please authenticate again');
    }

    const response = await authService.secureCall(endpoint, authState.csrfToken, options);

    // Handle session invalidation
    if (response.status === 401 || response.status === 403) {
      console.error('🚨 Auth error on endpoint', endpoint, '- clearing session');
      stateManager.clearSession();
      throw new Error('Session invalid: Please authenticate again');
    }

    return response;
  }, [authState, authService, stateManager]);

  const contextValue: AuthContextValue = {
    ...authState,
    authService,
    sessionManager,
    establishSessionFromTransaction,
    secureCall,
    clearSession: () => stateManager.clearSession(),
    isReady: () => stateManager.isReady()
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

