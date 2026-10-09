import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../../models/api';
import { Credentials, LoginResponse, Registration } from '../../models/user';

/**
 * Login, registration, account activation and password reset.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  login(credentials: Credentials) {
    return this.http.post<LoginResponse>(`${this.api}/login`, credentials);
  }

  /** Admins can also use this to create accounts, including other admins. */
  register(registration: Registration) {
    return this.http.post<ApiMessage>(`${this.api}/registeruser`, registration);
  }

  checkActivationToken(token: string) {
    return this.http.get<ApiMessage>(`${this.api}/getactivationtoken/${token}`);
  }

  /** The payload says whether the account still awaits an admin's approval. */
  activate(data: { token: string }) {
    return this.http.post<ApiResponse<{ awaitingApproval: boolean } | null>>(`${this.api}/activateaccount`, data);
  }

  requestPasswordReset(data: { email: string }) {
    return this.http.post<ApiMessage>(`${this.api}/resetpasswordtoken`, data);
  }

  checkResetToken(token: string) {
    return this.http.get<ApiMessage>(`${this.api}/getresettoken/${token}`);
  }

  resetPassword(data: { token: string; password: string }) {
    return this.http.post<ApiMessage>(`${this.api}/resetpassword`, data);
  }
}
