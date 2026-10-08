import { Injectable } from '@angular/core';
import { decodeToken, isTokenExpired } from './token';

/**
 * Reads the logged-in user's details from the token saved at login.
 */
@Injectable({
  providedIn: 'root'
})
export class JwtService {

  IsLoggedIn(): boolean {
    return !isTokenExpired(sessionStorage.getItem('token'));
  }

  getUserRole(): string | null {
    return decodeToken(sessionStorage.getItem('token'))?.role ?? null;
  }

  getCurrentUserId(): number | null {
    return decodeToken(sessionStorage.getItem('token'))?.id ?? null;
  }

  getUserName(): { firstName: string; lastName: string } | null {
    const claims = decodeToken(sessionStorage.getItem('token'));
    return claims ? { firstName: claims.firstName, lastName: claims.lastName } : null;
  }
}
