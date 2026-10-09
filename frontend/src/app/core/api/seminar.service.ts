import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import { NewSeminarRecord, SeminarRecord } from '../models/records';
import { fileForm } from './media.service';

/**
 * Seminars students attend, each with an optional certificate.
 */
@Injectable({ providedIn: 'root' })
export class SeminarService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  forStudent(studentId: number) {
    return this.http.get<ApiResponse<SeminarRecord[]>>(`${this.api}/student-seminarrecords/${studentId}`);
  }

  create(studentId: number, record: NewSeminarRecord) {
    return this.http.post<ApiResponse<{ record_id: number }>>(`${this.api}/uploadseminarrecord/${studentId}`, record);
  }

  uploadCertificate(recordId: number, file: File) {
    return this.http.post<ApiMessage>(`${this.api}/uploadseminarcertificate/${recordId}`, fileForm(file));
  }

  delete(id: number) {
    return this.http.delete<ApiMessage>(`${this.api}/deleteseminarrecord/${id}`);
  }
}
