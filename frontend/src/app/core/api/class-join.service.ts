import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import { ClassInvitation, ClassJoinRequest, JoinLink, JoinRequest, StudentInvitation } from '../models/class';

/**
 * The three ways into a class: a student's join request, a coordinator's
 * invitation, or a shareable join link.
 */
@Injectable({ providedIn: 'root' })
export class ClassJoinService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // Join requests

  requestToJoin(request: { student_id: number; class: string }) {
    return this.http.post<ApiMessage>(`${this.api}/createclassjoinrequest`, request);
  }

  requestsOfStudent(studentId: number) {
    return this.http.get<ApiResponse<JoinRequest[]>>(`${this.api}/getclassjoinrequests/${studentId}`);
  }

  requestsForClass(block: string) {
    return this.http.get<ApiResponse<ClassJoinRequest[]>>(`${this.api}/getclassjoinrequestsadvisor/${block}`);
  }

  requestCountForClass(block: string) {
    return this.http.get<ApiResponse<{ requestCount: number }[]>>(`${this.api}/getclassjoinrequestcount/${block}`);
  }

  /** A student withdraws their request. */
  cancelRequest(studentId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/cancelclassjoinrequest/${studentId}`);
  }

  /** A coordinator turns a request down. */
  rejectRequest(requestId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/rejectclassjoinrequest/${requestId}`);
  }

  // Invitations

  invite(invitation: { student_id: number; advisor_id: number; class: string }) {
    return this.http.post<ApiMessage>(`${this.api}/createclassinvitation`, invitation);
  }

  invitationsOfStudent(studentId: number) {
    return this.http.get<ApiResponse<StudentInvitation[]>>(`${this.api}/getclassinvitations/${studentId}`);
  }

  invitationCountOfStudent(studentId: number) {
    return this.http.get<ApiResponse<{ invitationCount: number }[]>>(`${this.api}/getclassinvitationcount/${studentId}`);
  }

  invitationsForClass(block: string) {
    return this.http.get<ApiResponse<ClassInvitation[]>>(`${this.api}/getclassinvitationsforblock/${block}`);
  }

  invitationCountForClass(block: string) {
    return this.http.get<ApiResponse<{ invitationCount: number }[]>>(`${this.api}/getclassinvitationsforblockcount/${block}`);
  }

  invitationCount(studentId: number, block: string) {
    return this.http.get<ApiResponse<{ invitationCount: number }[]>>(`${this.api}/checkexistinginvitationforblock/${studentId}/${block}`);
  }

  /**
   * Removes a student's invitations: all of them when the student declines,
   * or only those to the coordinator's own classes when a coordinator does it.
   */
  cancelInvitationsOfStudent(studentId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/cancelclassinvitation/${studentId}`);
  }

  cancelInvitation(invitationId: number) {
    return this.http.delete<ApiMessage>(`${this.api}/cancelclassinvitationbyid/${invitationId}`);
  }

  // Join links

  /** Returns the link URL (an existing unexpired one, or a new one). */
  createLink(data: { class: string }) {
    return this.http.post<ApiResponse<string>>(`${this.api}/createclassjoinlink`, data);
  }

  checkLink(token: string) {
    return this.http.get<ApiResponse<JoinLink>>(`${this.api}/getclassjointoken/${token}`);
  }
}
