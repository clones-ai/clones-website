/**
 * Authentication State Manager
 * 
 * Manages authentication state without side effects.
 * Pure state management with observer pattern.
 */

export interface AuthState {
  isAuthenticated: boolean;
  address?: `0x${string}`;
  csrfToken?: string;
  sessionExpiry?: number;
  isLoading: boolean;
  error?: string;
}

type AuthStateListener = (state: AuthState) => void;

export class AuthStateManager {
  private static instance: AuthStateManager;
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: false
  };
  private listeners: Set<AuthStateListener> = new Set();

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);

    // Multi-tab session sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clones_auth_cleared') {
        this.setState({
          isAuthenticated: false,
          address: undefined,
          csrfToken: undefined,
          sessionExpiry: undefined,
          isLoading: false,
          error: undefined
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      this.listeners.delete(listener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  clearSession(): void {
    this.setState({
      isAuthenticated: false,
      address: undefined,
      csrfToken: undefined,
      sessionExpiry: undefined,
      isLoading: false,
      error: undefined
    });

    // Signal other tabs
    try {
      localStorage.removeItem('clones_auth_cleared');
      localStorage.setItem('clones_auth_cleared', Date.now().toString());
    } catch (error) {
      console.warn('Failed to signal session clear:', error);
    }
  }

  isReady(): boolean {
    return !this.state.isLoading && this.state.isAuthenticated && !!this.state.csrfToken;
  }

  isSessionExpired(): boolean {
    return !!(this.state.sessionExpiry && Date.now() > this.state.sessionExpiry);
  }
}