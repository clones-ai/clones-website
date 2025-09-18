/**
 * Centralized API URL validation utilities
 */

/**
 * Validates and enforces HTTPS for API URLs
 */
export function validateApiUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Enforce HTTPS for non-localhost URLs
    if (urlObj.hostname !== 'localhost' &&
      urlObj.hostname !== '127.0.0.1' &&
      urlObj.protocol !== 'https:') {
      throw new Error(`API URL must use HTTPS for remote hosts. Got: ${url}`);
    }

    return url;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Invalid API URL: ${url}`);
  }
}

/**
 * Get validated API base URL from environment
 */
export function getValidatedApiUrl(): string {
  let apiUrl: string | undefined;

  try {
    // First try to access import.meta.env directly (works in Vite dev/build)
    apiUrl = import.meta.env.VITE_API_URL;
  } catch (error) {
    console.error('Error accessing import.meta.env:', error);
    // Fallback for Node.js environments (testing, SSR)
    if (typeof process !== 'undefined' && process.env) {
      apiUrl = process.env.VITE_API_URL;
    } else {
      throw new Error('Unable to access environment variables');
    }
  }

  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is not set');
  }
  return validateApiUrl(apiUrl);
}