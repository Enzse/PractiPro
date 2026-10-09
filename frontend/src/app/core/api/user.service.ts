import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import { Department, Role, RoleOption, User } from '../models/user';

/**
 * Accounts (admin features), plus the role and department lists.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  all() {
    return this.http.get<ApiResponse<User[]>>(`${this.api}/user`);
  }

  /** Admins can fetch anyone; other users only themselves. */
  get(id: number) {
    return this.http.get<ApiResponse<User[]>>(`${this.api}/user/${id}`);
  }

  admins() {
    return this.http.get<ApiResponse<User[]>>(`${this.api}/admin`);
  }

  update(id: number, changes: { role: Role | string; isActive: boolean | number }) {
    return this.http.post<ApiMessage>(`${this.api}/edituser/${id}`, changes);
  }

  /** Lets a self-registered coordinator or supervisor log in. */
  approve(id: number) {
    return this.http.post<ApiMessage>(`${this.api}/approveuser/${id}`, {});
  }

  delete(id: number) {
    return this.http.delete<ApiMessage>(`${this.api}/deleteuser/${id}`);
  }

  updateCoordinatorDepartment(id: number, changes: { department: string }) {
    return this.http.post<ApiMessage>(`${this.api}/editcoordinator/${id}`, changes);
  }

  roles() {
    return this.http.get<ApiResponse<RoleOption[]>>(`${this.api}/role`);
  }

  departments() {
    return this.http.get<ApiResponse<Department[]>>(`${this.api}/departments`);
  }
}
