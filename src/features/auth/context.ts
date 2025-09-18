import { createContext } from 'react';
import type { AuthState } from './AuthStateManager';
import type { AuthService } from './AuthService';
import type { SessionManager } from './SessionManager';

export interface AuthContextValue extends AuthState {
  authService: AuthService;
  sessionManager: SessionManager;
  establishSessionFromTransaction: (sessionId: string) => Promise<void>;
  secureCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
  clearSession: () => void;
  isReady: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);