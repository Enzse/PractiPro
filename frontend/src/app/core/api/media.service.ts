import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiMessage } from '../models/api';

/**
 * Profile pictures and company logos. Getting one returns the image as a
 * Blob; a Blob of size 0 means none has been uploaded.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  avatar(userId: number) {
    return this.http.get(`${this.api}/getavatar/${userId}`, { responseType: 'blob' });
  }

  uploadAvatar(userId: number, image: File) {
    return this.http.post<ApiMessage>(`${this.api}/uploadavatar/${userId}`, fileForm(image));
  }

  logo(companyId: number) {
    return this.http.get(`${this.api}/getlogo/${companyId}`, { responseType: 'blob' });
  }

  uploadLogo(companyId: number, image: File) {
    return this.http.post<ApiMessage>(`${this.api}/uploadlogo/${companyId}`, fileForm(image));
  }
}

/** Wraps a file in the multipart form the API's upload endpoints expect. */
export function fileForm(file: File): FormData {
  const form = new FormData();
  form.append('file', file);
  return form;
}
