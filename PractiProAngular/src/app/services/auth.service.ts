import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  isLoggedIn = false;
  apiurl = 'http://localhost/PractiPro/backend/api/user';

  //Get handlers.
  GetAll() {
    return this.http.get<any[]>(this.apiurl);
  }  
  getUser(code: any){
    return this.http.get(`http://localhost/PractiPro/backend/api/user/${code}`);
  }


  //Registration handler.
  proceedRegister(inputdata: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/adduser', inputdata);
  }


  //Login handler.
  proceedLogin(inputdata: any){
    return this.http.post('http://localhost/PractiPro/backend/api/login', inputdata);
  }
  IsLoggedIn(): boolean {
    const myToken = sessionStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(myToken);
  }
  //Decode Token Data
  GetUserRole(): string | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.role;
    }
    return null;
  }
  getCurrentUserId(): number | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken.id;
    }
    return null;
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
  getStudent(Id: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/student/${Id}`);
  }
  getAllAdmins() {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/admin`);
  }
  Updateuser(inputdata: any, code: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/edituser' + '/' + inputdata, code);
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
  editStudentInfo(inputdata: any, code: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/editstudentinfo' + '/' + inputdata, code);
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
