import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../../models/api';
import {
  AssignmentTable,
  Company,
  CompanyProfileUpdate,
  HiringRequest,
  Job,
  JobAssignment,
  Placement,
  Schedule,
  Supervisor,
} from '../../models/company';

/**
 * Companies, their supervisors, and placing students: hiring requests,
 * company and supervisor assignments, jobs and work schedules.
 */
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  all() {
    return this.http.get<ApiResponse<Company[]>>(`${this.api}/companies`);
  }

  get(id: number) {
    return this.http.get<ApiResponse<Company[]>>(`${this.api}/companies/${id}`);
  }

  update(profile: CompanyProfileUpdate) {
    return this.http.post<ApiMessage>(`${this.api}/editcompanyprofile`, profile);
  }

  supervisors() {
    return this.http.get<ApiResponse<Supervisor[]>>(`${this.api}/supervisors`);
  }

  supervisor(id: number) {
    return this.http.get<ApiResponse<Supervisor[]>>(`${this.api}/supervisors/${id}`);
  }

  /** How many rows in a relationship table link the two ids. */
  assignmentCount(table: AssignmentTable, column1: string, column2: string, id1: number, id2: number) {
    return this.http.get<ApiResponse<{ assignment_count: number }[]>>(
      `${this.api}/checkexistingassignment/${table}/${column1}/${column2}/${id1}/${id2}`,
    );
  }

  // Hiring requests

  sendHiringRequest(placement: Placement) {
    return this.http.post<ApiMessage>(`${this.api}/createhiringrequest`, placement);
  }

  hiringRequestsOf(studentId: number) {
    return this.http.get<ApiResponse<HiringRequest[]>>(`${this.api}/gethiringrequests/${studentId}`);
  }

  deleteHiringRequest(id: number) {
    return this.http.delete<ApiMessage>(`${this.api}/deletehiringrequest/${id}`);
  }

  // Placements

  /** A student accepts a hiring request. */
  addStudent(placement: Placement) {
    return this.http.post<ApiMessage>(`${this.api}/addstudenttocompany`, placement);
  }

  removeStudent(companyId: number, studentId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/removestudentfromcompany/${companyId}/${studentId}`);
  }

  assignToSupervisor(assignment: { supervisor_id: number; student_id: number }) {
    return this.http.post<ApiMessage>(`${this.api}/addstudenttosupervisor`, assignment);
  }

  unassignFromSupervisor(studentId: number, supervisorId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/removestudentfromsupervisor/${studentId}/${supervisorId}`);
  }

  // Jobs and schedules

  jobOf(studentId: number) {
    return this.http.get<ApiResponse<Job[]>>(`${this.api}/getstudentjob/${studentId}`);
  }

  /** Replaces the student's current job, if any. */
  assignJob(job: JobAssignment) {
    return this.http.post<ApiMessage>(`${this.api}/assignjobtostudent`, job);
  }

  schedulesOf(studentId: number) {
    return this.http.get<ApiResponse<Schedule[]>>(`${this.api}/ojtschedules/${studentId}`);
  }

  /** Replaces the student's whole weekly schedule. */
  setSchedules(studentId: number, schedules: Schedule[]) {
    return this.http.post<ApiMessage>(`${this.api}/assignschedulestostudent/${studentId}`, schedules);
  }

  clearSchedules(studentId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/unassignschedules/${studentId}`);
  }
}
