/**
 * Unified Authentication Manager
 * 
 * Single source of truth for authentication state and CSRF protection.
 * Implements proper bootstrap flow and session management.
 * 
 * Security Features:
 * - Double-submit CSRF protection pattern
 * - Secure session management with HttpOnly cookies
 * - Multi-tab session synchronization
 * - Automatic session revalidation
 * - Security event monitoring and logging
 */

import { SecurityEvents } from '../../utils/security';

export interface AuthState {
  isAuthenticated: boolean;
  address?: `0x${string}`;
  csrfToken?: string;
  sessionExpiry?: number;
  isLoading: boolean;
  error?: string;
}

type AuthStateListener = (state: AuthState) => void;

/**
 * Bootstrap Flow:
 * 1. GET /session-status (NO CSRF) → get initial CSRF token if session exists
 * 2. If no session: Use /connect endpoint to authenticate
 * 3. POST /connect (NO CSRF) → establish session + Set-Cookie  
 * 4. GET /session-status (NO CSRF) → get authenticated CSRF token
 * 5. All subsequent API calls use secureCall() WITH CSRF
 */
export class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: false
  };

  private listeners: Set<AuthStateListener> = new Set();
  private revalidationTimer?: NodeJS.Timeout;
  private isInitializing = false;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Initialize authentication state from existing session
   * This is the bootstrap entry point - NO CSRF required
   */
  async initialize(): Promise<void> {
    if (this.isInitializing) {
      console.log('⚠️ Skipping concurrent initialize() call');
      return; // Prevent concurrent initialization
    }

    console.log('🔄 Starting initialize()');
    this.isInitializing = true;
    this.setState({ isLoading: true, error: undefined });

    try {
      // Check if we have an existing session
      const response = await fetch('/api/v1/wallet/session-status', {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data.authenticated) {
          // Valid session exists
          this.setState({
            isAuthenticated: true,
            address: data.data.address as `0x${string}`,
            csrfToken: data.data.csrfToken,
            sessionExpiry: data.data.expiresAt ? new Date(data.data.expiresAt).getTime() : undefined,
            isLoading: false,
            error: undefined
          });

          this.startSessionRevalidation();
          return;
        } else if (data.data.csrfToken) {
          // No session but we have a CSRF token for future auth
          this.setState({
            isAuthenticated: false,
            csrfToken: data.data.csrfToken,
            isLoading: false,
            error: undefined
          });
          return;
        }
      }

      // No valid session found
      this.setState({
        isAuthenticated: false,
        isLoading: false,
        error: undefined
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication initialization failed';
      console.error('Auth initialization failed:', error);

      SecurityEvents.authFailure(`Initialization failed: ${errorMessage}`, {
        error: errorMessage,
        timestamp: Date.now()
      });

      this.setState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Authenticate using wallet signature data
   * Uses /connect endpoint which does NOT require CSRF (bootstrap)
   */
  async authenticateWithWallet(authData: {
    address: `0x${string}`;
    signature: `0x${string}`;
    timestamp: number;
    message: string;
    ref?: string;
    token?: string;
  }): Promise<void> {
    this.setState({ isLoading: true, error: undefined });
    console.log('authenticateWithWallet', authData);
    try {
      const response = await fetch('/api/v1/wallet/connect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData)
      });
      console.log('response', response);
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Authentication failed');
        throw new Error(`Authentication failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('result', result);
      if (!result.success) {
        throw new Error(result.error?.message || 'Authentication failed');
      }

      // Authentication successful - now get the session with CSRF token
      await this.initialize();
      console.log('initialize', this.state);
      SecurityEvents.authSuccess({
        address: authData.address,
        timestamp: Date.now()
      });
      console.log('authSuccess', this.state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('Wallet authentication failed:', error);
      console.log('authFailure', this.state);
      SecurityEvents.authFailure(`Wallet authentication failed: ${errorMessage}`, {
        address: authData.address,
        error: errorMessage,
        timestamp: Date.now()
      });
      console.log('authFailure', this.state);
      this.setState({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      console.log('authFailure', this.state);
      throw error; // Re-throw for UI handling
    }
  }

  /**
   * Make authenticated API call with CSRF protection
   * Requires valid session and CSRF token
   */
  async secureCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.state.isAuthenticated || !this.state.csrfToken) {
      throw new Error('Authentication required: No valid session or CSRF token');
    }

    // Check session expiry
    if (this.state.sessionExpiry && Date.now() > this.state.sessionExpiry) {
      await this.clearSession();
      throw new Error('Session expired: Please authenticate again');
    }

    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': this.state.csrfToken, // Consistent lowercase header
        ...options.headers
      }
    });
    console.log('response', response);

    // Handle session invalidation
    if (response.status === 401 || response.status === 403) {
      if (response.status === 403) {
        SecurityEvents.csrfMismatch({
          endpoint,
          csrfToken: this.state.csrfToken?.substring(0, 20) + '...',
          timestamp: Date.now()
        });
      } else {
        SecurityEvents.sessionExpired({
          endpoint,
          timestamp: Date.now()
        });
      }
      console.log('sessionExpired', this.state);

      await this.clearSession();
      throw new Error('Session invalid: Please authenticate again');
    }

    return response;
  }

  /**
   * Clear session and clean up state
   */
  async clearSession(): Promise<void> {
    console.log('clearSession', this.state);
    try {
      // Try to notify backend of logout if we have CSRF token
      if (this.state.csrfToken) {
        await fetch('/api/v1/wallet/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'x-csrf-token': this.state.csrfToken
          }
        }).catch(() => {
          // Ignore logout errors - session might already be invalid
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    // Stop revalidation timer
    if (this.revalidationTimer) {
      clearInterval(this.revalidationTimer);
      this.revalidationTimer = undefined;
    }

    // Clear state
    this.setState({
      isAuthenticated: false,
      address: undefined,
      csrfToken: undefined,
      sessionExpiry: undefined,
      isLoading: false,
      error: undefined
    });
    console.log('clearSession', this.state);
    // Clear localStorage for multi-tab sync
    try {
      localStorage.removeItem('clones_auth_cleared');
      localStorage.setItem('clones_auth_cleared', Date.now().toString());
    } catch (error) {
      // Ignore localStorage errors
      console.log('localStorage error', error);
    }
  }

  /**
   * Start periodic session validation (every 5 minutes)
   */
  private startSessionRevalidation(): void {
    if (this.revalidationTimer) {
      clearInterval(this.revalidationTimer);
    }
    console.log('📅 Starting session revalidation timer', this.state);
    this.revalidationTimer = setInterval(async () => {
      // Skip revalidation if currently initializing to prevent conflicts
      if (this.isInitializing) {
        console.log('⏸️ Skipping session revalidation - initialization in progress');
        return;
      }
      try {
        const response = await fetch('/api/v1/wallet/session-status', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'x-csrf-token': this.state.csrfToken || ''
          }
        });
        console.log('response', response);
        if (!response.ok) {
          throw new Error('Session validation failed');
        }

        const data = await response.json();
        console.log('data', data);
        if (!data.success || !data.data.authenticated) {
          await this.clearSession();
        } else {
          console.log('update CSRF token', data);
          // Update CSRF token if changed
          if (data.data.csrfToken && data.data.csrfToken !== this.state.csrfToken) {
            this.setState({
              csrfToken: data.data.csrfToken,
              sessionExpiry: data.data.expiresAt ? new Date(data.data.expiresAt).getTime() : undefined
            });
          }
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        console.log('clearSession', this.state);
        await this.clearSession();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    console.log('getState', this.state);
    return { ...this.state };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: AuthStateListener): () => void {
    console.log('subscribe', this.state);
    this.listeners.add(listener);

    // Multi-tab session sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clones_auth_cleared') {
        // Another tab cleared the session
        console.log('clearSession', this.state);
        this.clearSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      console.log('unsubscribe', this.state);
      this.listeners.delete(listener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  /**
   * Update internal state and notify listeners
   */
  private setState(newState: Partial<AuthState>): void {
    console.log('setState', this.state);
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Check if authentication is ready for API calls
   */
  isReady(): boolean {
    return !this.state.isLoading && this.state.isAuthenticated && !!this.state.csrfToken;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.revalidationTimer) {
      clearInterval(this.revalidationTimer);
    }
    this.listeners.clear();
  }
}