/**
 * Utility functions for API client
 */

/**
 * Get a cookie value by name
 * Handles URL-encoded cookies (like Laravel's XSRF-TOKEN)
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift() || null;
    // Laravel's XSRF-TOKEN is URL-encoded, so decode it
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(
  name: string,
  path: string = "/",
  domain?: string,
): void {
  if (typeof document === "undefined") return;

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * Check if a URL is an authentication endpoint
 * These endpoints should not trigger refresh attempts
 */
export function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  const authEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/logout",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/csrf-cookie",
    "/auth/csrf-cookie",
  ];

  return authEndpoints.some((endpoint) => url.includes(endpoint));
}
