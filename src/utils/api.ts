/**
 * Secure API utilities with HTTPS enforcement
 */

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
 * Secure fetch wrapper with HTTPS enforcement and enhanced security
 * @param endpoint - API endpoint path (e.g., '/api/v1/users')
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function secureFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getSecureApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  // Validate final URL
  validateSecureUrl(url);
  
  // Enhanced security headers
  const secureHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    'Cache-Control': 'no-cache', // Prevent caching of sensitive data
    ...options.headers,
  };
  
  const secureOptions: RequestInit = {
    ...options,
    headers: secureHeaders,
    // Enforce credentials policy
    credentials: options.credentials || 'same-origin',
    // Set timeout for security (prevent hanging requests)
    signal: options.signal || AbortSignal.timeout(30000), // 30s timeout
  };
  
  try {
    const response = await fetch(url, secureOptions);
    
    // Log security-relevant errors
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
    }
    
    return response;
  } catch (error) {
    // Enhanced error logging for security analysis
    if (error instanceof Error) {
      console.error(`Secure fetch failed for ${url}:`, error.message);
      
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
 * Secure POST request helper
 */
export async function securePost<T = unknown>(endpoint: string, data: unknown): Promise<T> {
  const response = await secureFetch(endpoint, {
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
 * Secure GET request helper
 */
export async function secureGet<T = unknown>(endpoint: string): Promise<T> {
  const response = await secureFetch(endpoint, {
    method: 'GET',
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  return response.json().catch(() => ({}) as T);
}