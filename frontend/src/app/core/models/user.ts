import { DateString } from './api';

export type Role = 'superadmin' | 'admin' | 'advisor' | 'student' | 'supervisor';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: 0 | 1;
  /** Null while a self-registered coordinator or supervisor awaits approval. */
  approved_at: DateString | null;
}

export interface RoleOption {
  id: number;
  code: Role;
  name: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

/** Sign-up form data. The role-specific fields are only required for that role. */
export interface Registration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  // Students
  studentId?: string;
  program?: string;
  year?: number | string;
  // Coordinators
  department?: string;
  // Supervisors
  company_name?: string;
  address?: string;
  position?: string;
  phone?: string;
}
