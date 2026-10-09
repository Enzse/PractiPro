import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../../models/api';
import { ClassBlock, ClassProfile, Coordinator, NewClass } from '../../models/class';

/**
 * Class blocks and the coordinators assigned to them.
 */
@Injectable({ providedIn: 'root' })
export class ClassService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  all() {
    return this.http.get<ApiResponse<ClassBlock[]>>(`${this.api}/classes`);
  }

  get(block: string) {
    return this.http.get<ApiResponse<ClassBlock[]>>(`${this.api}/classes/${block}`);
  }

  /** A class with its progress totals and coordinator. */
  profile(block: string) {
    return this.http.get<ApiResponse<ClassProfile[]>>(`${this.api}/classdata/${block}`);
  }

  byCourseAndYear(course: string, year: number) {
    return this.http.get<ApiResponse<ClassProfile[]>>(`${this.api}/classesbycourseandyear/${course}/${year}`);
  }

  ofCoordinator(coordinatorId: number) {
    return this.http.get<ApiResponse<ClassProfile[]>>(`${this.api}/classesbycoordinator/${coordinatorId}`);
  }

  create(newClass: NewClass) {
    return this.http.post<ApiMessage>(`${this.api}/addclass`, newClass);
  }

  coordinators() {
    return this.http.get<ApiResponse<Coordinator[]>>(`${this.api}/coordinator`);
  }

  coordinator(id: number) {
    return this.http.get<ApiResponse<Coordinator[]>>(`${this.api}/coordinator/${id}`);
  }

  assignCoordinator(assignment: { coordinator_id: number | string; block_name: string }) {
    return this.http.post<ApiMessage>(`${this.api}/assignclasscoordinator`, assignment);
  }

  unassignCoordinator(coordinatorId: number, block: string) {
    return this.http.delete<ApiMessage>(`${this.api}/unassigncoordinator/${coordinatorId}/${block}`);
  }
}
