import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage, ApiResponse } from '../models/api';
import { Comment, CommentTable } from '../models/records';

/**
 * Comment threads on submissions and other student records.
 */
@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  list(table: CommentTable, recordId: number) {
    return this.http.get<ApiResponse<Comment[]>>(`${this.api}/submission-comments/${table}/${recordId}`);
  }

  /** The author's name is taken from the login token, not sent from here. */
  add(table: CommentTable, recordId: number, comment: { comments: string }) {
    return this.http.post<ApiMessage>(`${this.api}/submission-comment/${table}/${recordId}`, comment);
  }
}
