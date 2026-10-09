import { DateString, Decimal } from './api';

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentId: number | null;
  program: string | null;
  year: number | null;
  block: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  dateOfBirth: DateString | null;
}

/**
 * A student with their practicum progress (vw_student_ojt_status). Coordinators
 * and supervisors get phoneNumber, address and dateOfBirth as null for
 * students who aren't theirs.
 */
export interface StudentOjtStatus extends Student {
  company_id: number | null;
  hire_date: DateString | null;
  company_name: string | null;
  job_title: string | null;
  TotalHoursWorked: Decimal | null;
  TotalSeminarHours: Decimal | null;
  clock_status: string | null;
  evaluation_status: string | null;
  exitpoll_status: string | null;
  registration_status: number | null;
}

/** A student found by student number, with their company's details. */
export interface StudentLookup extends StudentOjtStatus {
  company_address: string | null;
}

/** A company's student, with the supervisor who hired them. */
export interface CompanyStudent extends StudentOjtStatus {
  sFirstName: string;
  sLastName: string;
}

export interface StudentProfileUpdate {
  firstName: string;
  lastName: string;
  studentId: string | number;
  program: string;
  year: number | string;
  phoneNumber?: string | null;
  address?: string | null;
  dateOfBirth?: DateString | null;
}

/** Which pre-practicum requirements a student has had approved (1 = approved). */
export interface StudentRequirements {
  student_id: number;
  firstName: string;
  lastName: string;
  resume: number;
  application_letter: number;
  acceptance_letter: number;
  endorsement_letter: number;
  guardians_waiver: number;
  vaccination_card: number;
  barangay_clearance: number;
  medical_certificate: number;
}

/** Columns of the pending-submission views a client can filter by. */
export type PendingSubmissionType =
  | 'pending_req_count'
  | 'pending_doc_count'
  | 'pending_sem_count'
  | 'pending_war_count_advisor'
  | 'pending_war_count_supervisor'
  | 'pending_frp_count'
  | 'pending_sse_count';

/** How many submissions of each kind await review, per student. */
export type StudentPendingSubmissions = {
  student_id: number;
  student_name: string;
  block: string;
  pending_dtr_count: number;
} & Record<PendingSubmissionType, number>;

/** The same counts summed for a whole class. */
export type ClassPendingSubmissions = { block_name: string } & Record<PendingSubmissionType, number>;

export interface StudentWithPendingSubmissions {
  id: number;
  studentId: number;
  firstName: string;
  lastName: string;
  TotalHoursWorked: Decimal | null;
  TotalSeminarHours: Decimal | null;
  pendingSubmissions: number;
}
