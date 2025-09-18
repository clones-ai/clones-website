/**
 * Pure HTTP Client - No authentication dependencies
 * 
 * Handles basic HTTP operations without any knowledge of authentication.
 * This is the foundation layer that other services can build upon.
 */

import { validateApiUrl, getValidatedApiUrl } from './apiValidation';

export interface HttpRequestOptions extends RequestInit {
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class HttpClient {
  constructor(private baseUrl: string) {
    this.validateBaseUrl();
  }

  private validateBaseUrl(): void {
    validateApiUrl(this.baseUrl);
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint; // Absolute URL
    }
    return `${this.baseUrl}${endpoint}`;
  }

  private buildHeaders(options: HttpRequestOptions = {}): Record<string, string> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    return {
      ...defaultHeaders,
      ...Object.fromEntries(
        Object.entries(options.headers || {}).map(([key, value]) => [key, String(value)])
      ),
    };
  }

  async request<T = unknown>(
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options);
    const timeout = options.timeout || 30000;

    // For auth endpoints, use more aggressive retry strategy
    const isAuthEndpoint = endpoint.includes('/wallet/connect') || endpoint.includes('/wallet/establish-session');
    const MAX_RETRIES = isAuthEndpoint ? 4 : 1; // More retries for auth
    const INITIAL_BACKOFF_MS = isAuthEndpoint ? 1000 : 500; // Longer initial backoff for auth
    const JITTER_MS = 250;

    if (isAuthEndpoint) {
      console.log(`🔐 Auth endpoint detected: ${endpoint}. Using ${MAX_RETRIES} retries with ${INITIAL_BACKOFF_MS}ms base backoff`);
    }

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const requestOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
        signal: options.signal || AbortSignal.timeout(timeout),
      };

      try {
        const response = await fetch(url, requestOptions);

        // Success or non-retriable error
        if (response.status < 500 && response.status !== 429) {
          let data: T;
          try {
            data = await response.json();
          } catch {
            data = {} as T; // Fallback for non-JSON responses
          }

          return {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };
        }

        // If it's a retriable error but we are on our last attempt, throw
        if (attempt === MAX_RETRIES) {
          throw new Error(`Request failed after ${MAX_RETRIES} attempts with status ${response.status}`);
        }

        // Calculate delay and wait - longer backoff for rate limiting
        const baseBackoff = response.status === 429 
          ? INITIAL_BACKOFF_MS * 3 * 2 ** (attempt - 1) // 3x longer for 429
          : INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
        const jitter = Math.random() * JITTER_MS;
        const delay = baseBackoff + jitter;

        console.warn(`🔄 Attempt ${attempt}/${MAX_RETRIES} failed with status ${response.status}. Retrying in ${delay.toFixed(0)}ms...`, { url, isAuthEndpoint });
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error) {
        if (error instanceof Error) {
          // Don't retry on abort
          if (error.name === 'AbortError') {
            throw error;
          }
          if (error.name === 'TimeoutError') {
            throw new Error('Request timeout - please try again');
          } else if (error.message.includes('Failed to fetch')) {
            // Could be a network error, retry might help
            if (attempt === MAX_RETRIES) {
              throw new Error('Network error - please check your connection');
            }
            // Longer backoff for network errors (could be due to rate limiting)
            const backoff = INITIAL_BACKOFF_MS * 2 * 2 ** (attempt - 1);
            const jitter = Math.random() * JITTER_MS;
            const delay = backoff + jitter;
            console.warn(`Attempt ${attempt} failed with network error. Retrying in ${delay.toFixed(0)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Go to next attempt
          }
        }
        // Rethrow other errors immediately
        throw error;
      }
    }
    // This part should be unreachable, but TypeScript needs a return path.
    throw new Error('HttpClient request loop finished unexpectedly.');
  }

  async get<T = unknown>(endpoint: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

/**
 * Get validated API base URL from environment
 */
export function getApiUrl(): string {
  return getValidatedApiUrl();
}

/**
 * Create HTTP client instance with API base URL
 */
export function createApiClient(): HttpClient {
  return new HttpClient(getValidatedApiUrl());
}