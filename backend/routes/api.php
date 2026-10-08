<?php

declare(strict_types=1);

/*
 * The API's route table.
 *
 * Every route requires a logged-in user unless it is marked ->public().
 * ->roles(...) narrows a route to the listed roles; administrators can always
 * call non-public routes. Finer checks ("a student may only see their own
 * records") live in the controllers.
 *
 * The URLs are kept from the original API so the frontend works unchanged.
 */

use PractiPro\Auth\Role;
use PractiPro\Controllers\AuthController;
use PractiPro\Controllers\ClassController;
use PractiPro\Controllers\ClassJoinController;
use PractiPro\Controllers\CommentController;
use PractiPro\Controllers\CompanyController;
use PractiPro\Controllers\DtrController;
use PractiPro\Controllers\MediaController;
use PractiPro\Controllers\ReportController;
use PractiPro\Controllers\SeminarController;
use PractiPro\Controllers\StudentController;
use PractiPro\Controllers\SubmissionController;
use PractiPro\Controllers\UserController;
use PractiPro\Controllers\WarController;
use PractiPro\Http\Router;

return static function (Router $r): void {
    $id = '\d+';
    $admin = Role::ADMIN; // Admins pass every role check; this list just means "nobody else".
    $advisor = Role::ADVISOR;
    $student = Role::STUDENT;
    $supervisor = Role::SUPERVISOR;

    // Authentication (public)
    $r->post('/login', [AuthController::class, 'login'])->public();
    $r->post('/registeruser', [AuthController::class, 'register'])->public();
    $r->get('/getactivationtoken/{token}', [AuthController::class, 'checkActivationToken'])->public();
    $r->post('/activateaccount', [AuthController::class, 'activate'])->public();
    $r->post('/resetpasswordtoken', [AuthController::class, 'requestPasswordReset'])->public();
    $r->get('/getresettoken/{token}', [AuthController::class, 'checkResetToken'])->public();
    $r->post('/resetpassword', [AuthController::class, 'resetPassword'])->public();

    // Users and lookups
    $r->get('/user', [UserController::class, 'index'])->roles($admin);
    $r->get("/user/{id:$id}", [UserController::class, 'show']);
    $r->get('/admin', [UserController::class, 'admins'])->roles($admin);
    $r->post("/edituser/{id:$id}", [UserController::class, 'update'])->roles($admin);
    $r->delete("/deleteuser/{id:$id}", [UserController::class, 'delete'])->roles($admin);
    $r->post("/editcoordinator/{id:$id}", [UserController::class, 'updateCoordinator'])->roles($admin);
    $r->get('/role', [UserController::class, 'roles']);
    $r->get("/role/{id:$id}", [UserController::class, 'roles']);
    $r->get('/departments', [UserController::class, 'departments']);
    $r->get("/departments/{id:$id}", [UserController::class, 'departments']);

    // Students
    $r->get('/student', [StudentController::class, 'index'])->roles($admin);
    $r->get("/student/{id:$id}", [StudentController::class, 'show']);
    $r->get('/studentsojt', [StudentController::class, 'ojtStatusIndex'])->roles($advisor, $supervisor);
    $r->get("/studentsojt/{id:$id}", [StudentController::class, 'ojtStatus']);
    $r->get('/class-students/{block}', [StudentController::class, 'byBlock'])->roles($advisor);
    $r->get("/studentbycourseandyear/{course}/{year:$id}", [StudentController::class, 'byCourseAndYear'])->roles($admin);
    $r->get('/studentbystudentid/{studentNumber}', [StudentController::class, 'byStudentNumber'])->roles($advisor, $supervisor);
    $r->get("/studentsbycompany/{companyId:$id}", [StudentController::class, 'byCompany'])->roles($advisor, $supervisor);
    $r->get("/studentsbysupervisor/{supervisorId:$id}", [StudentController::class, 'bySupervisor'])->roles($supervisor);
    $r->post("/editstudentinfo/{id:$id}", [StudentController::class, 'update'])->roles($student);
    $r->post("/assignclasstostudent/{id:$id}", [StudentController::class, 'assignBlock'])->roles($advisor, $student);
    $r->get('/student_requirements', [StudentController::class, 'requirementsIndex'])->roles($admin);
    $r->get("/student_requirements/{id:$id}", [StudentController::class, 'requirements']);
    $r->get("/checkifstudenthaspendingsubmission/{studentId:$id}", [StudentController::class, 'pendingSubmissions'])->roles($advisor, $supervisor);
    $r->get("/checkifstudenthaspendingsubmission/{studentId:$id}/{type}", [StudentController::class, 'pendingSubmissions'])->roles($advisor, $supervisor);

    // Classes and coordinators
    $r->get('/classes', [ClassController::class, 'index']);
    $r->get('/classes/{block}', [ClassController::class, 'index']);
    $r->get('/classdata/{block}', [ClassController::class, 'profile']);
    $r->get("/classesbycourseandyear/{course}/{year:$id}", [ClassController::class, 'byCourseAndYear']);
    $r->get("/classesbycoordinator/{id:$id}", [ClassController::class, 'byCoordinator'])->roles($advisor);
    $r->post('/addclass', [ClassController::class, 'store'])->roles($admin);
    $r->get('/coordinator', [ClassController::class, 'coordinators'])->roles($advisor);
    $r->get("/coordinator/{id:$id}", [ClassController::class, 'coordinators'])->roles($advisor);
    $r->post('/assignclasscoordinator', [ClassController::class, 'assignCoordinator'])->roles($admin);
    $r->delete("/unassigncoordinator/{id:$id}/{block}", [ClassController::class, 'unassignCoordinator'])->roles($admin);

    // Joining classes: requests, invitations and links
    $r->get("/getclassjoinrequests/{studentId:$id}", [ClassJoinController::class, 'studentRequests'])->roles($student);
    $r->get('/getclassjoinrequestsadvisor/{block}', [ClassJoinController::class, 'blockRequests'])->roles($advisor);
    $r->get('/getclassjoinrequestcount/{block}', [ClassJoinController::class, 'blockRequestCount'])->roles($advisor);
    $r->post('/createclassjoinrequest', [ClassJoinController::class, 'createRequest'])->roles($student);
    $r->delete("/cancelclassjoinrequest/{studentId:$id}", [ClassJoinController::class, 'cancelRequest'])->roles($student);
    $r->delete("/rejectclassjoinrequest/{id:$id}", [ClassJoinController::class, 'rejectRequest'])->roles($advisor);
    $r->get("/getclassinvitations/{studentId:$id}", [ClassJoinController::class, 'studentInvitations'])->roles($student);
    $r->get("/getclassinvitationcount/{studentId:$id}", [ClassJoinController::class, 'studentInvitationCount'])->roles($student);
    $r->get('/getclassinvitationsforblock/{block}', [ClassJoinController::class, 'blockInvitations'])->roles($advisor);
    $r->get('/getclassinvitationsforblockcount/{block}', [ClassJoinController::class, 'blockInvitationCount'])->roles($advisor);
    $r->get("/checkexistinginvitationforblock/{studentId:$id}/{block}", [ClassJoinController::class, 'invitationExists'])->roles($advisor);
    $r->post('/createclassinvitation', [ClassJoinController::class, 'createInvitation'])->roles($advisor);
    $r->delete("/cancelclassinvitation/{studentId:$id}", [ClassJoinController::class, 'cancelStudentInvitations'])->roles($advisor, $student);
    $r->delete("/cancelclassinvitationbyid/{id:$id}", [ClassJoinController::class, 'cancelInvitation'])->roles($advisor);
    $r->post('/createclassjoinlink', [ClassJoinController::class, 'createLink'])->roles($advisor);
    $r->get('/getclassjointoken/{token}', [ClassJoinController::class, 'checkLink'])->roles($student);

    // Companies, supervisors and placements
    $r->get('/companies', [CompanyController::class, 'index']);
    $r->get("/companies/{id:$id}", [CompanyController::class, 'index']);
    $r->post('/editcompanyprofile', [CompanyController::class, 'update'])->roles($supervisor);
    $r->get('/supervisors', [CompanyController::class, 'supervisors']);
    $r->get("/supervisors/{id:$id}", [CompanyController::class, 'supervisors']);
    $r->get("/checkexistingassignment/{table}/{column1}/{column2}/{id1:$id}/{id2:$id}", [CompanyController::class, 'assignmentExists'])->roles($advisor, $supervisor);
    $r->get("/gethiringrequests/{studentId:$id}", [CompanyController::class, 'hiringRequests'])->roles($student, $supervisor);
    $r->post('/createhiringrequest', [CompanyController::class, 'createHiringRequest'])->roles($supervisor);
    $r->delete("/deletehiringrequest/{id:$id}", [CompanyController::class, 'deleteHiringRequest'])->roles($student, $supervisor);
    $r->post('/addstudenttocompany', [CompanyController::class, 'addStudentToCompany'])->roles($student, $supervisor);
    $r->delete("/removestudentfromcompany/{companyId:$id}/{studentId:$id}", [CompanyController::class, 'removeStudentFromCompany'])->roles($advisor, $supervisor);
    $r->post('/addstudenttosupervisor', [CompanyController::class, 'addStudentToSupervisor'])->roles($supervisor);
    $r->delete("/removestudentfromsupervisor/{studentId:$id}/{supervisorId:$id}", [CompanyController::class, 'removeStudentFromSupervisor'])->roles($supervisor);
    $r->get("/getstudentjob/{studentId:$id}", [CompanyController::class, 'job']);
    $r->post('/assignjobtostudent', [CompanyController::class, 'assignJob'])->roles($supervisor);
    $r->get("/ojtschedules/{studentId:$id}", [CompanyController::class, 'schedules']);
    $r->post("/assignschedulestostudent/{studentId:$id}", [CompanyController::class, 'assignSchedules'])->roles($supervisor);
    $r->delete("/unassignschedules/{studentId:$id}", [CompanyController::class, 'clearSchedules'])->roles($supervisor);

    // Profile pictures and logos
    $r->get("/getavatar/{userId:$id}", [MediaController::class, 'avatar']);
    $r->post("/uploadavatar/{userId:$id}", [MediaController::class, 'uploadAvatar']);
    $r->get("/getlogo/{companyId:$id}", [MediaController::class, 'logo']);
    $r->post("/uploadlogo/{companyId:$id}", [MediaController::class, 'uploadLogo'])->roles($supervisor);

    // Submitted files and approvals
    $r->get('/student-submission/{table}', [SubmissionController::class, 'index'])->roles($advisor, $supervisor);
    $r->get("/student-submission/{table}/{studentId:$id}", [SubmissionController::class, 'index']);
    $r->post("/uploadfile/{table}/{studentId:$id}", [SubmissionController::class, 'upload'])->roles($student);
    $r->post("/uploadfile/{table}/{studentId:$id}/{label}", [SubmissionController::class, 'upload'])->roles($student);
    $r->get("/getsubmissionfile/{table}/{id:$id}", [SubmissionController::class, 'download']);
    $r->delete("/deletesubmission/{id:$id}/{table}", [SubmissionController::class, 'delete']);
    $r->get("/submissionmaxweeks/{table}/{studentId:$id}", [SubmissionController::class, 'weekNumbers']);
    $r->post("/updateadvisorapproval/{table}/{id:$id}", [SubmissionController::class, 'advisorApproval'])->roles($advisor);
    $r->post("/updatesupervisorapproval/{table}/{id:$id}", [SubmissionController::class, 'supervisorApproval'])->roles($supervisor);
    $r->get("/student-evaluation/{studentId:$id}", [SubmissionController::class, 'evaluationFiles']);
    $r->post("/uploadevaluation/{supervisorId:$id}/{studentId:$id}", [SubmissionController::class, 'uploadEvaluationFile'])->roles($supervisor);

    // Comments
    $r->get("/submission-comments/{table}/{id:$id}", [CommentController::class, 'index']);
    $r->post("/submission-comment/{table}/{id:$id}", [CommentController::class, 'store']);

    // Daily time records
    $r->get('/getdtr', [DtrController::class, 'index'])->roles($advisor, $supervisor);
    $r->get("/getdtr/{studentId:$id}", [DtrController::class, 'forStudent']);
    $r->post("/dtrclockin/{studentId:$id}", [DtrController::class, 'clockIn'])->roles($student);
    $r->post("/dtrclockout/{studentId:$id}", [DtrController::class, 'clockOut'])->roles($student);
    $r->delete("/clearobsoletedtrs/{studentId:$id}", [DtrController::class, 'clearShortRecords'])->roles($student);
    $r->post("/updatedtrstatus/{id:$id}", [DtrController::class, 'updateStatus'])->roles($advisor, $supervisor);

    // Seminars
    $r->get("/student-seminarrecords/{studentId:$id}", [SeminarController::class, 'forStudent']);
    $r->post("/uploadseminarrecord/{studentId:$id}", [SeminarController::class, 'store'])->roles($student);
    $r->post("/uploadseminarcertificate/{recordId:$id}", [SeminarController::class, 'uploadCertificate'])->roles($student);
    $r->delete("/deleteseminarrecord/{id:$id}", [SeminarController::class, 'delete'])->roles($advisor, $student);

    // Weekly accomplishment reports
    $r->get("/getwarrecords/{studentId:$id}", [WarController::class, 'records']);
    $r->get("/getwarrecords/{studentId:$id}/{week:$id}", [WarController::class, 'records']);
    $r->get("/checkifweekhaswarrecord/{studentId:$id}/{week:$id}", [WarController::class, 'records']);
    $r->get("/getwaractivities/{recordId:$id}", [WarController::class, 'activities']);
    $r->post('/createwarrecord', [WarController::class, 'create'])->roles($student);
    $r->post('/warrecordsubmission', [WarController::class, 'submit'])->roles($student);
    $r->post('/savewaractivities', [WarController::class, 'addActivity'])->roles($student);
    $r->delete("/clearwaractivities/{recordId:$id}", [WarController::class, 'clearActivities'])->roles($student);

    // Final reports, evaluations and analytics
    $r->get("/getfinalreport/{studentId:$id}", [ReportController::class, 'finalReport']);
    $r->post('/createfinalreport', [ReportController::class, 'createFinalReport'])->roles($student);
    $r->get("/getstudentevaluation/{studentId:$id}", [ReportController::class, 'evaluation'])->roles($advisor, $supervisor);
    $r->post('/createstudentevaluation', [ReportController::class, 'createEvaluation'])->roles($supervisor);
    $r->get('/getfinalreportsanalytics/{block}', [ReportController::class, 'finalReportAnalytics'])->roles($advisor);
    $r->get('/getstudentevaluationanalytics/{block}', [ReportController::class, 'evaluationAnalytics'])->roles($advisor);
    $r->get('/getpendingsubmissions/{block}', [ReportController::class, 'pendingSubmissions'])->roles($advisor);
    $r->get('/getpendingsubmissionstotal/{block}', [ReportController::class, 'pendingSubmissionTotals'])->roles($advisor);
    $r->get('/getstudentswithpendingsubmissions/{block}/{type}', [ReportController::class, 'studentsWithPendingSubmissions'])->roles($advisor);
};
