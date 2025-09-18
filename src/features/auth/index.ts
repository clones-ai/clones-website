/**
 * Authentication Module
 * 
 * Clean authentication architecture with separated concerns
 */

export { AuthStateManager } from './AuthStateManager';
export { AuthService, createAuthService } from './AuthService';
export { AuthProvider } from './AuthProvider';
export { useAuth } from './hooks';
export type { AuthState } from './AuthStateManager';
export type { AuthContextValue } from './context';