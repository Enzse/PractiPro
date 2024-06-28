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
  getStudentsByStudentID(studentId: any) {
    return this.http.get<any>(`${this.apiurl}/studentbystudentid/${studentId}`);
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
  getCompanies(id: any = null) {
    if (id) {
      return this.http.get<any>(`${this.apiurl}/companies/${id}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/companies`);
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



  getSubmissionsByStudent(table: string, userId: number) {
    if (userId) {
      return this.http.get<any>(`${this.apiurl}/student-submission/${table}/${userId}`);
    }
    else {
      return this.http.get<any>(`${this.apiurl}/student-submission/${table}`);
    }
  }
  getStudentEvaluation(id: number) {
    return this.http.get<any>(`${this.apiurl}/student-evaluation/${id}`);

  }
  getSubmissionMaxWeeks(table: string, id: number) {
    return this.http.get<any>(`${this.apiurl}/submissionmaxweeks/${table}/${id}`);
  }
  updateDTRStatus(id: number, data: any) {
    return this.http.post(`${this.apiurl}/updatedtrstatus/${id}`, data);
  }
  updateSupervisorApproval(table: string, id: number, data: any) {
    return this.http.post(`${this.apiurl}/updatesupervisorapproval/${table}/${id}`, data);
  }
  updateAdvisorApproval(table: string, id: number, data: any) {
    return this.http.post(`${this.apiurl}/updateadvisorapproval/${table}/${id}`, data);
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
  getStudentOjtInfo(userId: number) {
    if (userId) {
      return this.http.get<any>(`${this.apiurl}/studentsojt/${userId}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/studentsojt`);
    }
  }
  getStudentProfile(userId: number) {
    return this.http.get<any>(`${this.apiurl}/student/${userId}`);
  }
  getDtrs(userId: number) {
    if (userId) {
      return this.http.get<any>(`${this.apiurl}/getdtr/${userId}`);
    } else {
      return this.http.get<any>(`${this.apiurl}/getdtr`);
    }
  }
  dtrClockIn(userId: number, data: any) {
    return this.http.post(`${this.apiurl}/dtrclockin/${userId}`, data);
  }
  dtrClockOut(userId: number, data: any) {
    return this.http.post(`${this.apiurl}/dtrclockout/${userId}`, data);
  }
  uploadSubmission(table: string, userId: number, file: File, category: any = null) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiurl}/uploadfile/${table}/${userId}/${category}`, formData);
  }

  uploadEvaluation(userId: number, studentId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file)
    return this.http.post(`${this.apiurl}/uploadevaluation/${userId}/${studentId}`, formData);
  }

  uploadSeminarRecord(studentId: number, data: any) {
    return this.http.post(`${this.apiurl}/uploadseminarrecord/${studentId}`, data);
  }
  getSeminarRecords(studentId: number) {
    return this.http.get<any>(`${this.apiurl}/student-seminarrecords/${studentId}`);
  }
  deletSeminarRecord(id: number) {
    return this.http.delete(`${this.apiurl}/deleteseminarrecord/${id}`);
  };
  uploadSeminarCertificate(studentId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file)
    return this.http.post(`${this.apiurl}/uploadseminarcertificate/${studentId}`, formData);
  }
  addComment(table: any, id: number, inputdata: any) {
    return this.http.post(`${this.apiurl}/submission-comment/${table}/${id}`, inputdata);
  }



  uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploadavatar/${userId}`, formData);
  }
  getAvatar(userId: number) {
    return this.http.get(`${this.apiurl}/getavatar/${userId}`, { responseType: 'blob' });
  }

  uploadLogo(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiurl}/uploadlogo/${userId}`, formData);
  }
  getLogo(companyId: number) {
    return this.http.get(`${this.apiurl}/getlogo/${companyId}`, { responseType: 'blob' });
  }


  assignClassCoordinator(inputdata: any) {
    return this.http.post(`${this.apiurl}/assignclasscoordinator`, inputdata);
  }
  assignClassStudent(id: number, inputdata: any) {
    return this.http.post(`${this.apiurl}/assignclassstudent/${id}`, inputdata);
  }

  createHiringRequest(inputdata: any) {
    return this.http.post(`${this.apiurl}/createhiringrequest`, inputdata);
  }
  addStudentToCompany(inputdata: any) {
    return this.http.post(`${this.apiurl}/addstudenttocompany`, inputdata);
  }
  addStudentToSupervisor(inputdata: any) {
    return this.http.post(`${this.apiurl}/addstudenttosupervisor`, inputdata);
  }
  getStudentsByCompany(companyId: number) {
    return this.http.get<any>(`${this.apiurl}/studentsbycompany/${companyId}`);
  }
  getStudentsBySupervisor(supervisorId: number) {
    return this.http.get<any>(`${this.apiurl}/studentsbysupervisor/${supervisorId}`);
  }
  removeStudentFromSupervisor(studentId: number, supervisorId: number) {
    return this.http.delete(`${this.apiurl}/removestudentfromsupervisor/${studentId}/${supervisorId}`);
  };
  removeStudentFromCompany(companyId: number, studentId: number) {
    return this.http.delete(`${this.apiurl}/removestudentfromcompany/${companyId}/${studentId}`);
  };
  getStudentJob(studentId: number) {
    return this.http.get<any>(`${this.apiurl}/getstudentjob/${studentId}`);
  }
  getSupervisors(id: number) {
    if (id) {
      return this.http.get<any>(`${this.apiurl}/supervisors/${id}`);
    }
    return this.http.get<any>(`${this.apiurl}/supervisors`);
  }

  getHiringRequests(studentId: number) {
    return this.http.get<any>(`${this.apiurl}/gethiringrequests/${studentId}`);
  }
  deleteHiringRequest(id: number) {
    return this.http.delete(`${this.apiurl}/deletehiringrequest/${id}`);
  };

  checkExistingAssignment(table: string, condition1: string, condition2: string, id1: number, id2: number) {
    return this.http.get<any>(`${this.apiurl}/checkexistingassignment/${table}/${condition1}/${condition2}/${id1}/${id2}`);
  }

  assignJobToStudent(inputdata: any) {
    return this.http.post(`${this.apiurl}/assignjobtostudent`, inputdata);
  }

  getStudentSchedules(studentId: number) {
    return this.http.get<any>(`${this.apiurl}/ojtschedules/${studentId}`);
  }

  assignSchedulesToStudent(studentId: number, inputdata: any) {
    return this.http.post(`${this.apiurl}/assignschedulestostudent/${studentId}`, inputdata);
  }
  unassignSchedules(id: number) {
    return this.http.delete(`${this.apiurl}/unassignschedules/${id}`);
  };

  resetPasswordToken(inputdata: any) {
    return this.http.post(`${this.apiurl}/resetpasswordtoken`, inputdata);
  }
  getResetPasswordToken(token:any) {
    return this.http.get<any>(`${this.apiurl}/getresettoken/${token}`);
  }
  resetPassword(inputdata: any) {
    return this.http.post(`${this.apiurl}/resetpassword`, inputdata);
  }

}
