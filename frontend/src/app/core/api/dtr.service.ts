import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import { TimeRecord } from '../models/records';

/**
 * Daily time records: students clock in and out each day they work.
 */
@Injectable({ providedIn: 'root' })
export class DtrService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  forStudent(studentId: number) {
    return this.http.get<ApiResponse<TimeRecord[]>>(`${this.api}/getdtr/${studentId}`);
  }

  clockIn(studentId: number) {
    return this.http.post<ApiMessage>(`${this.api}/dtrclockin/${studentId}`, {});
  }

  clockOut(studentId: number) {
    return this.http.post<ApiMessage>(`${this.api}/dtrclockout/${studentId}`, {});
  }

  /** Deletes the student's records worth less than an hour. */
  clearShortRecords(studentId: number) {
    return this.http.delete<ApiResponse<number | null>>(`${this.api}/clearobsoletedtrs/${studentId}`);
  }

  setStatus(id: number, data: { status: string }) {
    return this.http.post<ApiMessage>(`${this.api}/updatedtrstatus/${id}`, data);
  }
}
