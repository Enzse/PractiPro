import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import {
  CompanyStudent,
  PendingSubmissionType,
  Student,
  StudentLookup,
  StudentOjtStatus,
  StudentPendingSubmissions,
  StudentProfileUpdate,
  StudentRequirements,
} from '../models/student';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  /** Every student (admins only). */
  all() {
    return this.http.get<ApiResponse<Student[]>>(`${this.api}/student`);
  }

  get(id: number) {
    return this.http.get<ApiResponse<Student[]>>(`${this.api}/student/${id}`);
  }

  update(id: number, profile: StudentProfileUpdate) {
    return this.http.post<ApiMessage>(`${this.api}/editstudentinfo/${id}`, profile);
  }

  /** Every student's practicum progress (admins only). */
  allOjtStatus() {
    return this.http.get<ApiResponse<StudentOjtStatus[]>>(`${this.api}/studentsojt`);
  }

  ojtStatus(id: number) {
    return this.http.get<ApiResponse<StudentOjtStatus[]>>(`${this.api}/studentsojt/${id}`);
  }

  inClass(block: string) {
    return this.http.get<ApiResponse<StudentOjtStatus[]>>(`${this.api}/class-students/${block}`);
  }

  byCourseAndYear(course: string, year: number) {
    return this.http.get<ApiResponse<Student[]>>(`${this.api}/studentbycourseandyear/${course}/${year}`);
  }

  /** Finds a student by the school-issued student number. */
  byStudentNumber(studentNumber: string | number) {
    return this.http.get<ApiResponse<StudentLookup[]>>(`${this.api}/studentbystudentid/${studentNumber}`);
  }

  atCompany(companyId: number) {
    return this.http.get<ApiResponse<CompanyStudent[]>>(`${this.api}/studentsbycompany/${companyId}`);
  }

  ofSupervisor(supervisorId: number) {
    return this.http.get<ApiResponse<StudentOjtStatus[]>>(`${this.api}/studentsbysupervisor/${supervisorId}`);
  }

  /**
   * Puts a student in a class. Students need an invitation or a join-link
   * token; coordinators need a pending join request from the student.
   */
  joinClass(studentId: number, data: { block_name: string; token?: string }) {
    return this.http.post<ApiMessage>(`${this.api}/assignclasstostudent/${studentId}`, data);
  }

  requirements(studentId: number) {
    return this.http.get<ApiResponse<StudentRequirements[]>>(`${this.api}/student_requirements/${studentId}`);
  }

  pendingSubmissions(studentId: number, type?: PendingSubmissionType | null) {
    const url = type
      ? `${this.api}/checkifstudenthaspendingsubmission/${studentId}/${type}`
      : `${this.api}/checkifstudenthaspendingsubmission/${studentId}`;
    return this.http.get<ApiResponse<Partial<StudentPendingSubmissions>[]>>(url);
  }
}
