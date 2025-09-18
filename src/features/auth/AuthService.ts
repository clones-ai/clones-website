/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls.
 * Extracted from AuthManager god class.
 */

import { createApiClient } from '../../utils/httpClient';
import type { HttpClient } from '../../utils/httpClient';

export interface SessionData {
  authenticated: boolean;
  address?: `0x${string}`;
  csrfToken?: string;
  expiresAt?: string;
}

export interface AuthData {
  address: `0x${string}`;
  signature: `0x${string}`;
  timestamp: number;
  message: string;
  ref?: string;
  token?: string;
}

export class AuthService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get session status (no CSRF required)
   */
  async getSessionStatus(): Promise<{ data: SessionData }> {
    const response = await this.httpClient.get<{ data: SessionData }>('/api/v1/wallet/session-status');
    return response.data;
  }

  /**
   * Authenticate with wallet signature (no CSRF required)
   */
  async authenticateWithWallet(authData: AuthData): Promise<{ data: any }> {
    const response = await this.httpClient.post<{ data: any }>('/api/v1/wallet/connect', authData);
    return response.data;
  }

  /**
   * Validate session with CSRF token
   */
  async validateSession(csrfToken: string): Promise<{ data: SessionData }> {
    const response = await this.httpClient.get<{ data: SessionData }>('/api/v1/wallet/session-status', {
      headers: {
        'x-csrf-token': csrfToken
      }
    });
    return response.data;
  }

  /**
   * Logout with CSRF token
   */
  async logout(csrfToken: string): Promise<void> {
    await this.httpClient.post('/api/v1/wallet/logout', undefined, {
      headers: {
        'x-csrf-token': csrfToken
      }
    });
  }

  /**
   * Make authenticated API call with CSRF protection
   */
  async secureCall(endpoint: string, csrfToken: string, options: RequestInit = {}): Promise<Response> {
    const response = await this.httpClient.request(endpoint, {
      ...options,
      headers: {
        'x-csrf-token': csrfToken,
        ...options.headers
      }
    });

    // Convert HttpResponse back to Response for backward compatibility
    const responseInit: ResponseInit = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
    
    return new Response(JSON.stringify(response.data), responseInit);
  }

  /**
   * Establish session from transaction sessionId
   */
  async establishSessionFromTransaction(sessionId: string): Promise<{ data: SessionData }> {
    const response = await this.httpClient.post<{ data: SessionData }>(
      '/api/v1/wallet/establish-session-from-transaction',
      { sessionId }
    );
    return response.data;
  }
}

/**
 * Create AuthService instance
 */
export function createAuthService(): AuthService {
  const httpClient = createApiClient();
  return new AuthService(httpClient);
}