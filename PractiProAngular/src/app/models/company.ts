import { DateString, TimeString } from './api';

/** An industry partner with its totals (vw_company_profile). */
export interface Company {
  id: number;
  company_name: string;
  address: string | null;
  company_ceo: string | null;
  company_size: number | null;
  industry: string | null;
  scope_of_business: string | null;
  /** JSON-encoded list of IT equipment. */
  it_equipment: string | null;
  students_handled: number;
  supervisors: number;
}

export interface CompanyProfileUpdate {
  id: number;
  address: string;
  company_ceo: string;
  company_size: number;
  industry: string;
  scope_of_business: string;
  itEquipment: unknown;
}

export interface Supervisor {
  id: number;
  firstName: string;
  lastName: string;
  position: string | null;
  phone: string | null;
  email: string;
  company_id: number | null;
}

export interface HiringRequest {
  id: number;
  company_id: number;
  student_id: number;
  supervisor_id: number;
  created_at: DateString;
  company_name: string;
  sFirstName: string;
  sLastName: string;
}

/** Identifies a student, a company and the supervisor acting for it. */
export interface Placement {
  company_id: number;
  student_id: number;
  supervisor_id: number;
}

export interface Job {
  id: number;
  student_id: number;
  assigned_by: number;
  job_title: string;
  job_description: string;
  start_date: DateString;
  end_date: DateString;
  sfirstName: string;
  slastName: string;
}

export interface JobAssignment {
  student_id: number;
  supervisor_id: number;
  job_title: string;
  job_description: string;
  start_date: DateString;
  end_date: DateString;
}

export interface Schedule {
  id?: number;
  student_id?: number;
  day_of_week: string;
  start_time: TimeString;
  end_time: TimeString;
  has_work: 0 | 1 | boolean;
}

/** Relationship tables the "does this pair exist?" lookup accepts. */
export type AssignmentTable = 'company_hiring_requests' | 'rl_company_students' | 'rl_supervisor_students';
