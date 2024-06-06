import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  isLoggedIn = false;

  apiurl = 'http://localhost/PractiPro/backend/api';

  // apiurl = 'http://gcpractipro.online/backend/api';



  //User handlers. 
  getUser(id: any) {
    return this.http.get(`${this.apiurl}/user/${id}`);
  }
  getAllUsers() {
    return this.http.get(`${this.apiurl}/user`);
  }
  deleteUser(id: any) {
    return this.http.delete(`${this.apiurl}/deleteuser/${id}`);
  }
  unassignCoordinator(id: number, block: string) {
    return this.http.delete(`${this.apiurl}/unassigncoordinator/${id}/${block}`);
  }


  //Registration handler.
  doesEmailExist(inputdata: any) {
    return this.http.post(`${this.apiurl}/emailcheck`, inputdata);
  }
  proceedRegister(inputdata: any) {
    return this.http.post(`${this.apiurl}/registeruser`, inputdata);
  }


  //Login handler.
  proceedLogin(inputdata: any) {
    return this.http.post(`${this.apiurl}/login`, inputdata);
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
    return this.http.get(`${this.apiurl}/role`);
  }
  getEmails() {
    return this.http.get<any>(`${this.apiurl}/email`);
  }
  //GET STUDENTS
  getStudent(id: any = null) {
    if (id) {
      return this.http.get<any>(`${this.apiurl}/student/${id}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/student`);
    }
  }
  getAllStudentsFromClass(block: any) {
    return this.http.get<any>(`${this.apiurl}/class-students/${block}`);
  }
  getStudentsByCourseAndYear(course: any, year: number) {
    return this.http.get<any>(`${this.apiurl}/studentbycourseandyear/${course}/${year}`);
  }
  //GET ADMINS
  getAllAdmins() {
    return this.http.get<any>(`${this.apiurl}/admin`);
  }
  getSubmissionComments(table: string, id: number) {
    return this.http.get<any>(`${this.apiurl}/submission-comments/${table}/${id}`);
  }

  //GET ADVISORS
  getAdvisors(id: any = null) {
    if (id) {
      return this.http.get<any>(`${this.apiurl}/coordinator/${id}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/coordinator`);
    }
  }
  //GET CLASSES
  getClasses(block: any = null) {
    if (block) {
      return this.http.get<any>(`${this.apiurl}/classes/${block}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/classes`);
    }
  }
  getClassesByCoordinator(Id: number) {
    return this.http.get<any>(`${this.apiurl}/classesbycoordinator/${Id}`);
  }


  addOjtSite(id: number, inputdata: any) {
    return this.http.post(`${this.apiurl}/ojtsite/${id}`, inputdata);
  }
  addClass(inputdata: any) {
    return this.http.post(`${this.apiurl}/addclass`, inputdata);
  }
  getAllDepartments() {
    return this.http.get(`${this.apiurl}/departments`);
  }
  Updateuser(inputdata: any, code: any) {
    return this.http.post(`${this.apiurl}/edituser` + `/` + inputdata, code);
  }
  UpdateCoordinator(inputdata: any, code: any) {
    return this.http.post(`${this.apiurl}/editcoordinator` + `/` + inputdata, code);
  }



  getSubmissionsByStudent(table: string, userId: number) {
    if (userId) {
      return this.http.get<any>(`${this.apiurl}/student-submission/${table}/${userId}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-submission/${table}`);
    }
  }
  getSubmissionMaxWeeks(table: string, id: number) {
    return this.http.get<any>(`${this.apiurl}/submissionmaxweeks/${table}/${id}`);
  }
  toggleRequirementStatus(data: any) {
    return this.http.post(`${this.apiurl}/toggleRequirementStatus`, data);
  }
  toggleSubmissionRemark(table: string, data: any) {
    return this.http.post(`${this.apiurl}/togglesubmissionremark/${table}`, data);
  }
  toggleStudentEvaluation(data: any) {
    return this.http.post(`${this.apiurl}/togglestudentevaluation`, data);
  }
  getSubmissionFile(table: string, submissionId: number) {
    return this.http.get(`${this.apiurl}/getsubmissionfile/${table}/${submissionId}`, { responseType: 'blob' });
  }

  deleteSubmission(id: any, table: string) {
    return this.http.delete(`${this.apiurl}/deletesubmission/${id}/${table}`);
  }
  editStudentInfo(inputdata: any, code: any) {
    return this.http.post(`${this.apiurl}/editstudentinfo` + `/` + inputdata, code);
  }



  //Student features.
  getStudentRequirements(userId: number) {
    return this.http.get<any>(`${this.apiurl}/student_requirements/${userId}`);
  }
  getStudentProfile(userId: number) {
    return this.http.get<any>(`${this.apiurl}/student/${userId}`);
  }
  uploadRequirement(userId: number, file: File, submissionName: string) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploadrequirement/${userId}/${submissionName}`, formData);
  }
  uploadDocumentation(userId: number, file: File, submissionName: number) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploaddocumentation/${userId}/${submissionName}`, formData);
  }
  uploadDtr(userId: number, file: File, submissionName: number) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploaddtr/${userId}/${submissionName}`, formData);
  }
  uploadWar(userId: number, file: File, submissionName: number) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploadwar/${userId}/${submissionName}`, formData);
  }
  uploadFinalReport(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploadfinalreport/${userId}`, formData);
  }
  uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploadavatar/${userId}`, formData);
  }
  assignClassCoordinator(inputdata: any) {
    return this.http.post(`${this.apiurl}/assignclasscoordinator`, inputdata);
  }
  assignClassStudent(id: number, inputdata: any) {
    return this.http.post(`${this.apiurl}/assignclassstudent/${id}`, inputdata);
  }


  addComment(table: any, id: number, inputdata: any) {
    return this.http.post(`${this.apiurl}/submission-comment/${table}/${id}`, inputdata);
  }



  getAvatar(userId: number) {
    return this.http.get(`${this.apiurl}/getavatar/${userId}`, { responseType: 'blob' });
  }

}
