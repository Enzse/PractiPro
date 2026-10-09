import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../../models/api';
import { WarActivity, WarRecord } from '../../models/records';

/**
 * Weekly accomplishment reports: one record per student per week, listing
 * that week's activities.
 */
@Injectable({ providedIn: 'root' })
export class WarService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  /** All of a student's weekly reports, or just one week's. */
  records(studentId: number, week?: number | null) {
    const url = week
      ? `${this.api}/getwarrecords/${studentId}/${week}`
      : `${this.api}/getwarrecords/${studentId}`;
    return this.http.get<ApiResponse<WarRecord[]>>(url);
  }

  create(record: { student_id: number; week: number }) {
    return this.http.post<ApiMessage>(`${this.api}/createwarrecord`, record);
  }

  /** Submits (or withdraws) a report; approvals reset to Pending on submit. */
  setSubmitted(data: { id: number; isSubmitted: number | boolean; status?: string | null }) {
    return this.http.post<ApiMessage>(`${this.api}/warrecordsubmission`, data);
  }

  activities(recordId: number) {
    return this.http.get<ApiResponse<WarActivity[]>>(`${this.api}/getwaractivities/${recordId}`);
  }

  addActivity(activity: WarActivity) {
    return this.http.post<ApiMessage>(`${this.api}/savewaractivities`, activity);
  }

  clearActivities(recordId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/clearwaractivities/${recordId}`);
  }
}
