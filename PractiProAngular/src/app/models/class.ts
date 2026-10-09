import { DateString } from './api';

export interface ClassBlock {
  block_name: string;
  department: string | null;
  course: string;
  year_level: number;
  created_at: DateString;
  updated_at: DateString;
}

/** A class with its progress totals and coordinator (vw_class_profile). */
export interface ClassProfile {
  block_name: string;
  department: string | null;
  course: string;
  year_level: number;
  students_handled: number;
  registered_students: number;
  hired_students: number;
  ojt_cleared_students: number;
  seminar_cleared_students: number;
  evaluation_cleared_students: number;
  exitpoll_cleared_students: number;
  practicum_completed_students: number;
  c_first_name: string | null;
  c_last_name: string | null;
}

export interface NewClass {
  block_name: string;
  course: string;
  /** Form fields arrive as strings; the API converts them. */
  year_level: number | string;
}

/** A practicum coordinator (role "advisor"). */
export interface Coordinator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string | null;
  number_of_classes: number;
  created_at: DateString;
  updated_at: DateString;
}

export interface JoinRequest {
  id: number;
  student_id: number;
  class: string;
  created_at: DateString;
}

/** A join request as a coordinator sees it, with the student's name. */
export interface ClassJoinRequest extends JoinRequest {
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
}

export interface Invitation {
  id: number;
  student_id: number;
  advisor_id: number;
  class: string;
  created_at: DateString;
}

/** An invitation as a student sees it, with the coordinator's name. */
export interface StudentInvitation extends Invitation {
  advisorFirstName: string;
  advisorLastName: string;
}

/** An invitation as a coordinator sees it, with the student's name. */
export interface ClassInvitation extends Invitation {
  studentFirstName: string;
  studentLastName: string;
  studentId: number;
}

export interface JoinLink {
  id: number;
  class: string;
  join_token_hash: string;
  join_token_expires_at: DateString;
}
