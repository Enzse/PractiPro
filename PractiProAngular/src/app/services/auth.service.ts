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
  getUser(code: any) {
    return this.http.get(`http://localhost/PractiPro/backend/api/user/${code}`);
  }


  //Registration handler.
  doesEmailExist(inputdata: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/emailcheck', inputdata);
  }
  proceedRegister(inputdata: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/adduser', inputdata);
  }


  //Login handler.
  proceedLogin(inputdata: any) {
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
  //Get Users
  getAllUsers() {
    return this.http.get('http://localhost/PractiPro/backend/api/user');
  }
  //Get Students
  getAllStudents() {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/student`);
  }
  getAllStudentsFromClass(block: any) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/class-students/${block}`);
  }
  getEmails(){
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/email`);
  }
  getStudentsByCoordinator(Id: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/coordinator-students/${Id}`);
  }
  getStudent(Id: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/student/${Id}`);
  }
  //Get Admins
  getAllAdmins() {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/admin`);
  }
  //Get Coordinators
  getCoordinator(id: any = null) {
    if(id){
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/coordinator/${id}`);
    }else{
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/coordinator`);
    }
  }
  getClasses(block: any = null) {
    if(block){
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/classes/${block}`);
    }else{
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/classes`);
    }
  }
  addClass(inputdata: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/addclass', inputdata);
  }
  getAllDepartments() {
    return this.http.get('http://localhost/PractiPro/backend/api/departments');
  }
  Updateuser(inputdata: any, code: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/edituser' + '/' + inputdata, code);
  }
  UpdateCoordinator(inputdata: any, code: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/editcoordinator' + '/' + inputdata, code);
  }
  getRequirementSubmission(Id: number) {
    return this.http.get<any>(`http://localhost/PractiPro/backend/api/submission/${Id}`);
  }
  getRequirementSubmissionsByUser(userId: number) {
    if (userId) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-submission/${userId}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-submission`);
    }
  }
  getDocumentationsByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-documentation/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-documentation`);
    }
  }
  getDtrByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-dtr/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-dtr`);
    }
  }
  getWarByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-war/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-war`);
    }
  }
  getFinalReportByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-finalreport/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-finalreport`);
    }
  }
  getMaxDocsWeeks(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-maxdocsweeks/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-maxdocsweeks`);
    }
  }
  getMaxDtrWeeks(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-maxdtrweeks/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-maxdtrweeks`);
    }
  }
  getMaxWarWeeks(Id: any) {
    if (Id) {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-maxwarweeks/${Id}`);
    }
    else {
      return this.http.get<any>(`http://localhost/PractiPro/backend/api/student-maxwarweeks`);
    }
  }
  toggleRequirementStatus(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/toggleRequirementStatus', data);
  }
  toggleReqRemark(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/togglerequirementsremark', data);
  }
  toggleDocRemark(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/toggledocsremark', data);
  }
  toggleDtrRemark(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/toggledtrremark', data);
  }
  toggleWarRemark(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/togglewarremark', data);
  }
  toggleFrRemark(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/togglefinalreportsremark', data);
  }
  toggleStudentEvaluation(data: any) {
    return this.http.post('http://localhost/PractiPro/backend/api/togglestudentevaluation', data);
  }

  downloadRequirement(submissionId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/downloadrequirement/${submissionId}`, { responseType: 'blob' });
  }
  downloadDocumentation(submissionId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/downloaddocumentation/${submissionId}`, { responseType: 'blob' });
  }
  downloadDtr(submissionId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/downloaddtr/${submissionId}`, { responseType: 'blob' });
  }
  downloadWar(submissionId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/downloadwar/${submissionId}`, { responseType: 'blob' });
  }
  downloadFinalReport(submissionId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/downloadfinalreport/${submissionId}`, { responseType: 'blob' });
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
  uploadRequirement(userId: number, file: File, submissionName: string) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`http://localhost/PractiPro/backend/api/uploadrequirement/${userId}/${submissionName}`, formData);
  }
  uploadDocumentation(userId: number, file: File, submissionName: number) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`http://localhost/PractiPro/backend/api/uploaddocumentation/${userId}/${submissionName}`, formData);
  }
  uploadDtr(userId: number, file: File, submissionName: number) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`http://localhost/PractiPro/backend/api/uploaddtr/${userId}/${submissionName}`, formData);
  }
  uploadWar(userId: number, file: File, submissionName: number) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`http://localhost/PractiPro/backend/api/uploadwar/${userId}/${submissionName}`, formData);
  }
  uploadFinalReport(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`http://localhost/PractiPro/backend/api/uploadfinalreport/${userId}`, formData);
  }
  uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`http://localhost/PractiPro/backend/api/uploadavatar/${userId}`, formData);
  }
  getAvatar(userId: number) {
    return this.http.get(`http://localhost/PractiPro/backend/api/getavatar/${userId}`, { responseType: 'blob' });
  }

}
