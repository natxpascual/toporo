/**
 * Shared API origin configuration.
 *
 * Locally (when VITE_API_BASE_URL is unset), requests remain relative ("/api/...")
 * so Vite's dev proxy forwards them to http://127.0.0.1:8000.
 * In production (Cloudflare Pages), set VITE_API_BASE_URL to the Azure backend URL.
 */
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
}
