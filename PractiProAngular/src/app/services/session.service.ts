import { Injectable } from '@angular/core';
import { Role } from '../models/user';
import { decodeToken, isTokenExpired } from './token';

const TOKEN_KEY = 'token';

/**
 * Who is logged in, read from the token saved at login. The token lives in
 * sessionStorage, so it is cleared when the browser tab closes.
 *
 * These values decide what the UI shows; the API checks the token itself on
 * every request, so nothing here is a security boundary.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  saveToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !isTokenExpired(this.token());
  }

  userId(): number | null {
    return decodeToken(this.token())?.id ?? null;
  }

  /** The logged-in user's id; throws if nobody is logged in (a bug on pages behind a guard). */
  requireUserId(): number {
    const id = this.userId();
    if (id === null) {
      throw new Error('No user is logged in.');
    }
    return id;
  }

  role(): Role | null {
    return (decodeToken(this.token())?.role as Role | undefined) ?? null;
  }

  userName(): { firstName: string; lastName: string } | null {
    const claims = decodeToken(this.token());
    return claims ? { firstName: claims.firstName, lastName: claims.lastName } : null;
  }
}
