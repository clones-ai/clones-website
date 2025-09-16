/**
 * Authentication Provider
 * 
 * Initializes AuthManager on app startup and provides global auth context
 */

import React, { useEffect, useState, createContext, useContext } from 'react';
import { AuthManager, AuthState } from './AuthManager';

interface AuthContextValue extends AuthState {
  authManager: AuthManager;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(() => 
    AuthManager.getInstance().getState()
  );

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribe(setAuthState);
    
    // Initialize authentication on app startup
    authManager.initialize().catch((error) => {
      console.error('Failed to initialize authentication:', error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: AuthContextValue = {
    ...authState,
    authManager: AuthManager.getInstance()
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Provides same interface as useAuthManager but with context benefits
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}