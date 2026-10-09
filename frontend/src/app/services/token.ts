/**
 * The claims the API puts in a login token (see AuthController::login).
 */
export interface TokenClaims {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  /** Issued-at and expiry times, in seconds since 1970. */
  iat: number;
  exp: number;
}

/**
 * Reads a JWT's claims. The signature is not checked here (only the server
 * can do that), so use this for display and routing, never for security.
 */
export function decodeToken(token: string | null): TokenClaims | null {
  const payload = token?.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      Array.from(atob(base64), (char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null, now: number = Date.now()): boolean {
  const claims = decodeToken(token);
  return claims === null || typeof claims.exp !== 'number' || claims.exp * 1000 <= now;
}
