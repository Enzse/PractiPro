import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import { AnswerCounts, FinalReport, PerformanceEvaluation } from '../models/records';
import {
  ClassPendingSubmissions,
  PendingSubmissionType,
  StudentPendingSubmissions,
  StudentWithPendingSubmissions,
} from '../models/student';

/**
 * The final report and performance evaluation questionnaires, and the
 * class-level numbers coordinators see.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  finalReportOf(studentId: number) {
    return this.http.get<ApiResponse<FinalReport[]>>(`${this.api}/getfinalreport/${studentId}`);
  }

  createFinalReport(report: FinalReport) {
    return this.http.post<ApiMessage>(`${this.api}/createfinalreport`, report);
  }

  evaluationOf(studentId: number) {
    return this.http.get<ApiResponse<PerformanceEvaluation[]>>(`${this.api}/getstudentevaluation/${studentId}`);
  }

  createEvaluation(evaluation: PerformanceEvaluation) {
    return this.http.post<ApiMessage>(`${this.api}/createstudentevaluation`, evaluation);
  }

  // Class analytics

  finalReportAnalytics(block: string) {
    return this.http.get<ApiResponse<AnswerCounts[]>>(`${this.api}/getfinalreportsanalytics/${block}`);
  }

  evaluationAnalytics(block: string) {
    return this.http.get<ApiResponse<AnswerCounts[]>>(`${this.api}/getstudentevaluationanalytics/${block}`);
  }

  pendingSubmissions(block: string) {
    return this.http.get<ApiResponse<StudentPendingSubmissions[]>>(`${this.api}/getpendingsubmissions/${block}`);
  }

  pendingSubmissionTotals(block: string) {
    return this.http.get<ApiResponse<ClassPendingSubmissions[]>>(`${this.api}/getpendingsubmissionstotal/${block}`);
  }

  studentsWithPendingSubmissions(block: string, type: PendingSubmissionType) {
    return this.http.get<ApiResponse<StudentWithPendingSubmissions[]>>(`${this.api}/getstudentswithpendingsubmissions/${block}/${type}`);
  }
}
