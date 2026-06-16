/**
 * Returns the stored auth token or a fallback guest-token.
 * Used by all dashboard pages when calling the FastAPI backend.
 */
export function getAuthToken(): string {
  if (typeof window === 'undefined') return 'guest-token';
  return localStorage.getItem('auth_token') || 'guest-token';
}

/**
 * Returns the API base URL from environment or localhost fallback.
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}
