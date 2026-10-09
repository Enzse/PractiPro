import { ApprovalStatus, DateString, Decimal, TimeString } from './api';

/** Tables students upload files to. */
export type StudentFileTable = 'submissions' | 'documentations' | 'finalreports' | 'war';

/** Tables a file can be downloaded from. */
export type DownloadTable = StudentFileTable | 'supervisor_student_evaluations' | 'student_seminar_certificates';

/** Tables a file can be deleted from. */
export type DeletableTable = StudentFileTable | 'supervisor_student_evaluations';

/** Tables whose records are numbered by week. */
export type WeeklyTable = 'documentations' | 'student_war_records';

/** Tables with an advisor_approval column. */
export type AdvisorApprovalTable =
  | StudentFileTable
  | 'student_final_reports'
  | 'student_seminar_records'
  | 'student_supervisor_evaluation'
  | 'student_war_records'
  | 'supervisor_student_evaluations';

/** Tables with a supervisor_approval column. */
export type SupervisorApprovalTable = 'student_war_records' | 'war';

/** An uploaded file's metadata (the file itself is downloaded separately). */
export interface SubmittedFile {
  id: number;
  user_id: number;
  file_name: string;
  created_at: DateString;
  remarks: string | null;
  comments: number | null;
  advisor_approval: ApprovalStatus;
  /** Requirement name, for the "submissions" table. */
  submission_name?: string;
  /** Week number, for weekly tables. */
  week?: number;
  supervisor_approval?: ApprovalStatus;
}

/** An evaluation file a supervisor uploaded for a student. */
export interface EvaluationFile {
  id: number;
  user_id: number;
  student_id: number;
  file_name: string;
  created_at: DateString;
  advisor_approval: ApprovalStatus;
  comments: number | null;
  sfirstName: string;
  slastName: string;
}

export type CommentTable =
  | 'comments_requirements'
  | 'comments_documentation'
  | 'comments_war'
  | 'comments_finalreports'
  | 'comments_seminar_records'
  | 'comments_evaluations';

export interface Comment {
  id: number;
  file_id: number;
  comments: string;
  commenter: string;
  created_at: DateString;
}

export interface TimeRecord {
  id: number;
  student_id: number;
  date: DateString;
  startTime: TimeString;
  endTime: TimeString | null;
  totalHours: Decimal | null;
  status: string | null;
}

export interface SeminarRecord {
  id: number;
  student_id: number;
  event_name: string;
  event_date: DateString;
  event_type: string;
  duration: Decimal;
  created_at: DateString;
  advisor_approval: ApprovalStatus;
  comments: number | null;
  certified: number | null;
}

export interface NewSeminarRecord {
  event_name: string;
  event_date: DateString;
  event_type: string;
  duration: number | string;
}

/** A weekly accomplishment report. */
export interface WarRecord {
  id: number;
  user_id: number;
  week: number;
  created_at: DateString;
  supervisor_approval: ApprovalStatus;
  advisor_approval: ApprovalStatus;
  dateSubmitted: DateString | null;
  isSubmitted: 0 | 1;
  comments: number | null;
}

export interface WarActivity {
  id?: number;
  war_id: number;
  date: DateString;
  description: string;
  startTime: TimeString;
  endTime: TimeString;
  TotalHours?: Decimal;
}

/** Answers to the final report questionnaire, keyed by question id (p1q1, p2q1x1, ...). */
export interface FinalReport {
  id?: number;
  user_id: number;
  created_at?: DateString;
  advisor_approval?: ApprovalStatus;
  [question: string]: unknown;
}

/** A supervisor's performance evaluation of a student, keyed by question id. */
export interface PerformanceEvaluation {
  id?: number;
  supervisor_id: number;
  student_id: number;
  created_at?: DateString;
  advisor_approval?: ApprovalStatus;
  [question: string]: unknown;
}

/** Per-answer counts for a class, e.g. { p1q1_yes_count: 4, p1q1_no_count: 1, ... }. */
export type AnswerCounts = Record<string, number | string | null>;
