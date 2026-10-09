import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse, ApprovalStatus } from '../models/api';
import {
  AdvisorApprovalTable,
  DeletableTable,
  DownloadTable,
  EvaluationFile,
  StudentFileTable,
  SubmittedFile,
  SupervisorApprovalTable,
  WeeklyTable,
} from '../models/records';
import { fileForm } from './media.service';

/**
 * Uploaded files and their approval status.
 */
@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  /** Files a student uploaded to a table, or everyone's (admins only) without a student. */
  list(table: StudentFileTable, studentId?: number | null) {
    const url = studentId
      ? `${this.api}/student-submission/${table}/${studentId}`
      : `${this.api}/student-submission/${table}`;
    return this.http.get<ApiResponse<SubmittedFile[]>>(url);
  }

  /**
   * @param label The requirement name for "submissions", or the week number
   *              for weekly tables. Not used for "finalreports".
   */
  upload(table: StudentFileTable, studentId: number, file: File, label: string | number | null = null) {
    return this.http.post<ApiMessage>(`${this.api}/uploadfile/${table}/${studentId}/${label}`, fileForm(file));
  }

  download(table: DownloadTable, id: number) {
    return this.http.get(`${this.api}/getsubmissionfile/${table}/${id}`, { responseType: 'blob' });
  }

  delete(table: DeletableTable, id: number) {
    return this.http.delete<ApiMessage>(`${this.api}/deletesubmission/${id}/${table}`);
  }

  /** Week numbers to show as tabs: 1 up to the student's highest week so far. */
  weekNumbers(table: WeeklyTable, studentId: number) {
    return this.http.get<number[]>(`${this.api}/submissionmaxweeks/${table}/${studentId}`);
  }

  setAdvisorApproval(table: AdvisorApprovalTable, id: number, data: { advisor_approval: ApprovalStatus }) {
    return this.http.post<ApiMessage>(`${this.api}/updateadvisorapproval/${table}/${id}`, data);
  }

  setSupervisorApproval(table: SupervisorApprovalTable, id: number, data: { supervisor_approval: ApprovalStatus }) {
    return this.http.post<ApiMessage>(`${this.api}/updatesupervisorapproval/${table}/${id}`, data);
  }

  /** Evaluation files supervisors uploaded for a student. */
  evaluationFiles(studentId: number) {
    return this.http.get<ApiResponse<EvaluationFile[]>>(`${this.api}/student-evaluation/${studentId}`);
  }

  uploadEvaluationFile(supervisorId: number, studentId: number, file: File) {
    return this.http.post<ApiMessage>(`${this.api}/uploadevaluation/${supervisorId}/${studentId}`, fileForm(file));
  }
}
