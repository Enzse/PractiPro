import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  isLoggedIn = false;

  // apiurl = 'http://localhost/PractiPro/backend/api';

  apiurl = 'http://gcpractipro.online/backend/api';

  //User Handlers handlers. 
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
    return this.http.post(`${this.apiurl}/adduser`, inputdata);
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
  //Get Students
  getAllStudents() {
    return this.http.get<any>(`${this.apiurl}/student`);
  }
  getAllStudentsFromClass(block: any) {
    return this.http.get<any>(`${this.apiurl}/class-students/${block}`);
  }
  getEmails() {
    return this.http.get<any>(`${this.apiurl}/email`);
  }
  getStudentsByCoordinator(Id: number) {
    return this.http.get<any>(`${this.apiurl}/coordinator-students/${Id}`);
  }
  getStudentsByCourse(course: any) {
    return this.http.get<any>(`${this.apiurl}/studentbycourse/${course}`);
  }
  getStudentsByCourseAndYear(course: any, year: number) {
    return this.http.get<any>(`${this.apiurl}/studentbycourseandyear/${course}/${year}`);
  }
  getStudent(Id: number) {
    return this.http.get<any>(`${this.apiurl}/student/${Id}`);
  }
  //Get Admins
  getAllAdmins() {
    return this.http.get<any>(`${this.apiurl}/admin`);
  }
  //Get Coordinators
  getCoordinator(id: any = null) {
    if (id) {
      return this.http.get<any>(`${this.apiurl}/coordinator/${id}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/coordinator`);
    }
  }
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
  getRequirementSubmission(Id: number) {
    return this.http.get<any>(`${this.apiurl}/submission/${Id}`);
  }
  getRequirementSubmissionsByUser(userId: number) {
    if (userId) {
      return this.http.get<any>(`${this.apiurl}/student-submission/${userId}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-submission`);
    }
  }
  getDocumentationsByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-documentation/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-documentation`);
    }
  }
  getDtrByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-dtr/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-dtr`);
    }
  }
  getWarByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-war/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-war`);
    }
  }
  getFinalReportByUser(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-finalreport/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-finalreport`);
    }
  }
  getMaxDocsWeeks(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-maxdocsweeks/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-maxdocsweeks`);
    }
  }
  getMaxDtrWeeks(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-maxdtrweeks/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-maxdtrweeks`);
    }
  }
  getMaxWarWeeks(Id: any) {
    if (Id) {
      return this.http.get<any>(`${this.apiurl}/student-maxwarweeks/${Id}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-maxwarweeks`);
    }
  }
  toggleRequirementStatus(data: any) {
    return this.http.post(`${this.apiurl}/toggleRequirementStatus`, data);
  }
  toggleReqRemark(data: any) {
    return this.http.post(`${this.apiurl}/togglerequirementsremark`, data);
  }
  toggleDocRemark(data: any) {
    return this.http.post(`${this.apiurl}/toggledocsremark`, data);
  }
  toggleDtrRemark(data: any) {
    return this.http.post(`${this.apiurl}/toggledtrremark`, data);
  }
  toggleWarRemark(data: any) {
    return this.http.post(`${this.apiurl}/togglewarremark`, data);
  }
  toggleFrRemark(data: any) {
    return this.http.post(`${this.apiurl}/togglefinalreportsremark`, data);
  }
  toggleStudentEvaluation(data: any) {
    return this.http.post(`${this.apiurl}/togglestudentevaluation`, data);
  }

  downloadRequirement(submissionId: number) {
    return this.http.get(`${this.apiurl}/downloadrequirement/${submissionId}`, { responseType: 'blob' });
  }
  downloadDocumentation(submissionId: number) {
    return this.http.get(`${this.apiurl}/downloaddocumentation/${submissionId}`, { responseType: 'blob' });
  }
  downloadDtr(submissionId: number) {
    return this.http.get(`${this.apiurl}/downloaddtr/${submissionId}`, { responseType: 'blob' });
  }
  downloadWar(submissionId: number) {
    return this.http.get(`${this.apiurl}/downloadwar/${submissionId}`, { responseType: 'blob' });
  }
  downloadFinalReport(submissionId: number) {
    return this.http.get(`${this.apiurl}/downloadfinalreport/${submissionId}`, { responseType: 'blob' });
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
  assignClassStudent(id: number, inputdata:any) {
    return this.http.post(`${this.apiurl}/assignclassstudent/${id}`, inputdata);
  }


  getAvatar(userId: number) {
    return this.http.get(`${this.apiurl}/getavatar/${userId}`, { responseType: 'blob' });
  }

}
