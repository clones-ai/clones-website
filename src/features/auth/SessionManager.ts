/**
 * Session Manager
 * 
 * Handles session revalidation and lifecycle management.
 * Pure session management without state coupling.
 */

import { AuthService } from './AuthService';

export class SessionManager {
  private revalidationTimer?: NodeJS.Timeout;
  private isValidating = false;

  constructor(private authService: AuthService) { }

  /**
   * Start periodic session validation
   */
  startRevalidation(
    csrfToken: string,
    onSessionInvalid: () => void,
    onTokenUpdate: (newToken: string, expiresAt?: string) => void,
    intervalMs = 5 * 60 * 1000 // 5 minutes
  ): void {
    this.stopRevalidation();

    console.log('📅 Starting session revalidation timer');
    this.revalidationTimer = setInterval(async () => {
      if (this.isValidating) {
        console.log('⏸️ Skipping session revalidation - validation in progress');
        return;
      }

      await this.validateSession(csrfToken, onSessionInvalid, onTokenUpdate);
    }, intervalMs);
  }

  /**
   * Stop session revalidation
   */
  stopRevalidation(): void {
    if (this.revalidationTimer) {
      console.log('🛑 Stopping session revalidation timer');
      clearInterval(this.revalidationTimer);
      this.revalidationTimer = undefined;
    }
  }

  /**
   * Validate current session
   */
  async validateSession(
    csrfToken: string,
    onSessionInvalid: () => void,
    onTokenUpdate: (newToken: string, expiresAt?: string) => void
  ): Promise<void> {
    this.isValidating = true;

    try {
      const sessionResponse = await this.authService.validateSession(csrfToken);
      const sessionData = sessionResponse.data;

      console.log('Session validation data:', sessionData);

      if (!sessionData.authenticated) {
        console.log('🚨 Session no longer valid');
        onSessionInvalid();
      } else {
        // Update CSRF token if changed
        if (sessionData.csrfToken && sessionData.csrfToken !== csrfToken) {
          console.log('🔄 Updating CSRF token');
          onTokenUpdate(sessionData.csrfToken, sessionData.expiresAt);
        }
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      console.error('🚨 Session validation failed:', error);
      this.stopRevalidation();
      onSessionInvalid();
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Initialize session from transaction
   */
  async establishFromTransaction(sessionId: string): Promise<{
    authenticated: boolean;
    address?: `0x${string}`;
    csrfToken?: string;
    expiresAt?: string;
  }> {
    console.log('🔐 Establishing session from transaction:', sessionId);

    try {
      const response = await this.authService.establishSessionFromTransaction(sessionId);
      console.log('✅ Session established successfully:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Session establishment failed';
      console.error('❌ Session establishment failed:', error);

      console.error('🚨 Session establishment failed:', errorMessage);

      throw new Error(errorMessage);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopRevalidation();
    this.isValidating = false;
  }
}