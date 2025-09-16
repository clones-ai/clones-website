/**
 * Secure API utilities with unified CSRF protection
 */

import { AuthManager } from '../features/auth';

/**
 * Validates and enforces HTTPS for API URLs
 * @param url - URL to validate
 * @throws Error if URL is not HTTPS in production
 */
export function validateSecureUrl(url: string): string {
  const urlObj = new URL(url);

  // In production, enforce HTTPS
  if (import.meta.env.PROD && urlObj.protocol !== 'https:') {
    throw new Error(`SECURITY ERROR: API URL must use HTTPS in production. Got: ${urlObj.protocol}//${urlObj.host}`);
  }

  // In development, allow localhost HTTP but warn
  if (!import.meta.env.PROD && urlObj.protocol === 'http:' && !urlObj.hostname.includes('localhost') && !urlObj.hostname.includes('127.0.0.1')) {
    console.warn(`WARNING: Using HTTP for non-localhost URL in development: ${url}`);
  }

  return url;
}

/**
 * Get validated API base URL from environment
 * @throws Error if VITE_API_URL is not set or invalid
 */
export function getSecureApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('SECURITY ERROR: VITE_API_URL environment variable is not set');
  }

  try {
    return validateSecureUrl(apiUrl);
  } catch (error) {
    throw new Error(`SECURITY ERROR: Invalid API URL configuration - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bootstrap API call - NO CSRF required
 * Used for initial authentication and session checking
 * 
 * @param endpoint - API endpoint path (e.g., '/api/v1/wallet/connect')
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function bootstrapCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getSecureApiUrl();
  const url = `${baseUrl}${endpoint}`;
  // Validate final URL
  validateSecureUrl(url);

  // Enhanced security headers
  const secureHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    ...options.headers,
  };

  const secureOptions: RequestInit = {
    ...options,
    headers: secureHeaders,
    credentials: 'include', // CRITICAL: Include session cookies
    signal: options.signal || AbortSignal.timeout(30000), // 30s timeout
  };
  try {
    const response = await fetch(url, secureOptions);

    // Log security-relevant errors
    if (!response.ok) {
      console.error(`Bootstrap API Error: ${response.status} ${response.statusText} for ${url}`);
    }

    return response;
  } catch (error) {
    // Enhanced error logging for security analysis
    if (error instanceof Error) {
      console.error(`Bootstrap call failed for ${url}:`, error.message);

      // Don't expose internal errors to prevent information leakage
      if (error.name === 'TimeoutError') {
        throw new Error('Request timeout - please try again');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
      }
    }
    throw error;
  }
}

/**
 * Authenticated API call - WITH CSRF protection
 * Uses AuthManager for session management and CSRF tokens
 * 
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function authenticatedCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const authManager = AuthManager.getInstance();
  if (!authManager.isReady()) {
    throw new Error('Authentication required: Please log in first');
  }

  return authManager.secureCall(endpoint, options);
}

/**
 * Secure POST request helper - NO CSRF (for bootstrap endpoints)
 * @param endpoint - API endpoint
 * @param data - Request payload
 * @returns Parsed JSON response
 */
export async function securePost<T = unknown>(endpoint: string, data: unknown): Promise<T> {
  const response = await bootstrapCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json().catch(() => ({}) as T);
}

/**
 * Authenticated POST request helper - WITH CSRF protection
 * @param endpoint - API endpoint
 * @param data - Request payload
 * @returns Parsed JSON response
 */
export async function authenticatedPost<T = unknown>(endpoint: string, data: unknown): Promise<T> {
  const response = await authenticatedCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json().catch(() => ({}) as T);
}

/**
 * Authenticated GET request helper - WITH CSRF protection
 * @param endpoint - API endpoint
 * @returns Parsed JSON response
 */
export async function authenticatedGet<T = unknown>(endpoint: string): Promise<T> {
  const response = await authenticatedCall(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json().catch(() => ({}) as T);
}

/**
 * Secure GET request helper - NO CSRF (for public endpoints)
 * @param endpoint - API endpoint
 * @returns Parsed JSON response
 */
export async function secureGet<T = unknown>(endpoint: string): Promise<T> {
  const response = await bootstrapCall(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json().catch(() => ({}) as T);
}