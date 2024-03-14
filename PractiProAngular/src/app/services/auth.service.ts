import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  isLoggedIn = false;
  apiurl = 'http://localhost/PractiPro/backend/api/user';

  //Get handlers.
  GetAll() {
    return this.http.get<any[]>(this.apiurl);
  }
  Getbycode(code: any) {
    return this.http.get(this.apiurl + '/' + code);
  }


  //Registration handler.
  Proceedregister(inputdata: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/adduser', inputdata);
  }


  //Login handler.
  IsLoggedIn() {
    return sessionStorage.getItem('id') != null;
  }
  GetUserRole() {
    return sessionStorage.getItem('userrole') != null ? sessionStorage.getItem('userrole')?.toString() : '';
  }
  getCurrentUserId(): number | null {
    const id = sessionStorage.getItem('id');
    return id ? +id : null;
  }


  //Admin features.
  GetAllRoles() {
    return this.http.get('http://localhost/PractiPro/backend/api/role');
  }
  getAllUsers() {
    return this.http.get('http://localhost/PractiPro/backend/api/user');
  }
  getAllStudents() {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/student`);
  }
  getAllAdmins() {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/admin`);
  }
  Updateuser(inputdata: any, code: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/edituser' + '/' + inputdata, code,);
  }
  getStudentSubmissions(userId: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/submission/${userId}`);
  }
  toggleRequirementStatus(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/toggleRequirementStatus', data);
  }
  downloadSubmission(submissionId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/download/${submissionId}`, { responseType: 'blob' });
  }
  


  //Student features.
  getStudentRequirements(userId: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/student_requirements/${userId}`);
  }
  getStudentProfile(userId: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/student/${userId}`);
  }
  uploadFile(userId: number, file: File, submissionName: string) {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post(`http://localhost/PractiPro/backend/api/uploadfile/${userId}/${submissionName}`, formData);
  }
}
