<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

/*API Endpoint Router*/

require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./modules/delete.php";
require_once "./config/database.php";
require_once __DIR__ . '/bootstrap.php';
require_once "./src/Jwt.php";

// Initialize Get and Post objects
$con = new Connection();
$pdo = $con->connect();
$get = new Get($pdo);
$post = new Post($pdo);
$delete = new Delete($pdo);


// Check if 'request' parameter is set in the request
if (isset($_REQUEST['request'])) {
    // Split the request into an array based on '/'
    $request = explode('/', $_REQUEST['request']);
} else {
    // If 'request' parameter is not set, return a 404 response
    echo "Not Found";
    http_response_code(404);
}

// Handle requests based on HTTP method
switch ($_SERVER['REQUEST_METHOD']) {
    // Handle GET requests
    case 'OPTIONS':
        // Respond to preflight requests
        http_response_code(200);
        exit();

    case 'GET':
        switch ($request[0]) {
            case 'user':
                if (count($request) > 1) {
                    echo json_encode($get->get_users($request[1]));
                } else {
                    echo json_encode($get->get_users());
                }
                break;
            case 'role':
                if (count($request) > 1) {
                    echo json_encode($get->get_roles($request[1]));
                } else {
                    echo json_encode($get->get_roles());
                }
                break;
            case 'departments':
                if (count($request) > 1) {
                    echo json_encode($get->get_departments($request[1]));
                } else {
                    echo json_encode($get->get_departments());
                }
                break;
            case 'classes':
                if (count($request) > 1) {
                    echo json_encode($get->get_classes($request[1]));
                } else {
                    echo json_encode($get->get_classes());
                }
                break;
            case 'classdata':
                if (isset($request[1])) {
                    echo json_encode($get->getClassData($request[1]));
                } else {
                    echo "Invalid Endpoints!";
                }
                break;
            case 'classesbycoordinator':
                if (isset($request[1])) {
                    echo json_encode($get->get_classes_ByCoordinator($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'classesbycourseandyear':
                if (isset($request[2])) {
                    echo json_encode($get->get_classesByCourseAndYear($request[1], $request[2]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'class-students':
                if (isset($request[1])) {
                    echo json_encode($get->get_studentsFromClasses($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'student_requirements':
                if (count($request) > 1) {
                    echo json_encode($get->get_student_requirements($request[1]));
                } else {
                    echo json_encode($get->get_student_requirements());
                }
                break;

            case 'student':
                if (count($request) > 1) {
                    echo json_encode($get->get_student($request[1]));
                } else {
                    echo json_encode($get->get_student());
                }
                break;
            case 'studentsojt':
                if (count($request) > 1) {
                    echo json_encode($get->getStudentsOjtInfo($request[1]));
                } else {
                    echo json_encode($get->getStudentsOjtInfo());
                }
                break;
            case 'studentsbycompany':
                if (isset($request[1])) {
                    echo json_encode($get->getStudentsByCompany($request[1]));
                } else {
                    echo "Invalid endpoint!";
                }
                break;
            case 'studentsbysupervisor':
                if (isset($request[1])) {
                    echo json_encode($get->getStudentsBySupervisor($request[1]));
                } else {
                    echo "Invalid endpoint!";
                }
                break;

            case 'studentbycourseandyear':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->get_studentByCourseAndYear($request[1], $request[2]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'studentbystudentid':
                if (isset($request[1])) {
                    echo json_encode($get->getStudentsByStudentID($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'admin':
                echo json_encode($get->getAdmins());
                break;

            case 'supervisors':
                if (isset($request[1])) {
                    echo json_encode($get->getSupervisors($request[1]));
                } else {
                    echo json_encode($get->getSupervisors());
                }
                break;

            case 'coordinator':
                if (count($request) > 1) {
                    echo json_encode($get->get_coordinators($request[1]));
                } else {
                    echo json_encode($get->get_coordinators());
                }
                break;

            case 'companies':
                if (count($request) > 1) {
                    echo json_encode($get->getCompanies($request[1]));
                } else {
                    echo json_encode($get->getCompanies());
                }
                break;

            case 'getavatar':
                if (isset($request[1])) {
                    $get->getAvatar($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'getlogo':
                if (isset($request[1])) {
                    $get->getLogo($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'student-submission':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->getStudentSubmission($request[1], $request[2]));
                } else if (isset($request[1])) {
                    echo json_encode($get->getStudentSubmission($request[1]));
                } else {
                    echo "Insufficient IDs provided.";
                }
                break;

            case 'student-evaluation':
                if (isset($request[1])) {
                    echo json_encode($get->getStudentEvaluation($request[1]));
                } else {
                    echo "ID not provided!";
                }
                break;

            case 'student-seminarrecords':
                if (isset($request[1])) {
                    echo json_encode($get->getSeminarRecords($request[1]));
                } else {
                    echo "ID not provided!";
                }
                break;

            case 'getdtr':
                if (count($request) > 1) {
                    echo json_encode($get->getStudentDTR($request[1]));
                } else {
                    echo json_encode($get->getStudentDTR());
                }
                break;
            case 'submissionmaxweeks':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->getSubmissionMaxWeeks($request[1], $request[2]));
                } else {
                    echo "Invalid endpoints provided.";
                }
                break;
            case 'getsubmissionfile':
                if (isset($request[1])) {
                    echo json_encode($get->getSubmissionFile($request[1], $request[2]));
                } else {
                    echo "Submission ID not provided!";
                    http_response_code(400);
                }
                break;
            case 'submission-comments':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->getSubmissionComments($request[1], $request[2]));
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;
            case 'getstudentjob':
                if (isset($request[1])) {
                    echo json_encode($get->getStudentJob($request[1]));
                } else {
                    echo "Student ID not provided!";
                    http_response_code(400);
                }
                break;

            case 'ojtschedules':
                if (isset($request[1])) {
                    echo json_encode($get->getStudentSchedules($request[1]));
                } else {
                    echo "Student ID not provided!";
                    http_response_code(400);
                }
                break;

            case 'gethiringrequests':
                if (isset($request[1])) {
                    echo json_encode($get->getHiringRequests($request[1]));
                } else {
                    echo "Student ID not provided!";
                    http_response_code(400);
                }
                break;

            case 'checkexistingassignment':
                if (isset($request[5])) {
                    echo json_encode($get->checkExistingAssignment($request[1], $request[2], $request[3], $request[4], $request[5]));
                } else {
                    echo "Invalid Endpoints!";
                    http_response_code(400);
                }
                break;

            case 'getresettoken':
                if (isset($request[1])) {
                    echo json_encode($get->getResetPasswordToken($request[1]));
                } else {
                    echo "No Token Provided!";
                    http_response_code(400);
                }
                break;

            case 'getactivationtoken':
                if (isset($request[1])) {
                    echo json_encode($get->getAccountActivationToken($request[1]));
                } else {
                    echo "No Token Provided!";
                    http_response_code(400);
                }
                break;

            case 'getclassjointoken':
                if (isset($request[1])) {
                    echo json_encode($get->getClassJoinToken($request[1]));
                } else {
                    echo "No Token Provided!";
                    http_response_code(400);
                }
                break;

            case 'getclassjoinrequests':
                if (isset($request[1])) {
                    echo json_encode($get->getClassJoinRequests($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getclassjoinrequestsadvisor':
                if (isset($request[1])) {
                    echo json_encode($get->getClassJoinRequestsAdvisor($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getclassinvitations':
                if (isset($request[1])) {
                    echo json_encode($get->getClassInvitations($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getclassinvitationcount':
                if (isset($request[1])) {
                    echo json_encode($get->getClassInvitationCount($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getclassinvitationsforblock':
                if (isset($request[1])) {
                    echo json_encode($get->getClassInvitationsForBlock($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getclassinvitationsforblockcount':
                if (isset($request[1])) {
                    echo json_encode($get->getClassInvitationForBlockCount($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'checkexistinginvitationforblock':
                if (isset($request[1])) {
                    echo json_encode($get->checkExistingInvitationForBlock($request[1], $request[2]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getclassjoinrequestcount':
                if (isset($request[1])) {
                    echo json_encode($get->getClassJoinRequestCount($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getwarrecords':
                if (isset($request[2])) {
                    echo json_encode($get->getWarRecords($request[1], $request[2]));
                } else if (isset($request[1])) {
                    echo json_encode($get->getWarRecords($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getwaractivities':
                if (isset($request[1])) {
                    echo json_encode($get->getWarActivities($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'checkifweekhaswarrecord':
                if (isset($request[2])) {
                    echo json_encode($get->checkIfWeekHasWarRecord($request[1], $request[2]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getfinalreport':
                if (isset($request[1])) {
                    echo json_encode($get->getFinalReport($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getstudentevaluation':
                if (isset($request[1])) {
                    echo json_encode($get->getEvaluationForStudent($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;
            case 'getpendingsubmissions':
                if (isset($request[1])) {
                    echo json_encode($get->getPendingSubmissions($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getstudentswithpendingsubmissions':
                if (isset($request[2])) {
                    echo json_encode($get->getStudentsWithPendingSubmissions($request[1], $request[2]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getpendingsubmissionstotal':
                if (isset($request[1])) {
                    echo json_encode($get->getPendingSubmissionsTotal($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'checkifstudenthaspendingsubmission':
                if (isset($request[2])) {
                    echo json_encode($get->checkIfStudentHasPendingSubmission($request[1], $request[2]));
                } else if (isset($request[1])) {
                    echo json_encode($get->checkIfStudentHasPendingSubmission($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            case 'getallfinalreportsfromblock':
                if (isset($request[1])) {
                    echo json_encode($get->getAllFinalReportsFromBlock($request[1]));
                } else {
                    echo "Invalid Endpoints";
                    http_response_code(400);
                }
                break;

            default:
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;


    case 'POST':
        // Retrieves JSON-decoded data from php://input using file_get_contents
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {

            case 'emailcheck':
                // Return JSON-encoded data for adding users
                echo json_encode($post->doesEmailExist($data->email));
                break;

            case 'login':

                $data = json_decode(file_get_contents('php://input'), true);
                if (!isset($data['email']) || !isset($data['password'])) {
                    throw new Exception("Missing login credentials", 400);
                }
                $user = $get->getByEmail($data['email']);
                $post->userLogin($data, $user);
                break;

            case 'registeruser':
                // Return JSON-encoded data for adding users
                echo json_encode($post->registerUser($data));
                break;
            case 'addclass':
                // Return JSON-encoded data for adding users
                echo json_encode($post->add_class($data));
                break;

            case 'edituser':
                // Return JSON-encoded data for editing users
                echo json_encode($post->edit_user($data, $request[1]));
                break;
            case 'editcoordinator':
                // Return JSON-encoded data for editing users
                echo json_encode($post->edit_coordinator($data, $request[1]));
                break;

            case 'assignclasscoordinator':
                // Return JSON-encoded data for adding users
                echo json_encode($post->assignClassCoordinator($data));
                break;
            case 'assignclasstostudent':
                if (isset($request[1])) {
                    $delete->cancelClassInvitation($request[1]);
                    $delete->cancelJoinRequest($request[1]);
                    echo json_encode($post->assignClassToStudent($data, $request[1]));
                } else {
                    echo "No requests Provided!";
                }
                break;
            case 'assignjobtostudent':
                if (isset($data)) {
                    $delete->unassignJob($data->student_id);
                    echo json_encode($post->assignJobToStudent($data));
                } else {
                    echo "No data Provided!";
                }
                break;
            case 'assignschedulestostudent':
                if (isset($data)) {
                    $delete->unassignSchedules($request[1]);
                    echo json_encode($post->assignSchedulesToStudent($request[1], $data));
                } else {
                    echo "No data Provided!";
                }
                break;
            case 'uploadfile':
                if (isset($request[3])) {
                    echo json_encode($post->uploadFile($request[1], $request[2], $request[3]));
                } elseif (isset($request[2])) {
                    echo json_encode($post->uploadFile($request[1], $request[2]));
                } else {
                    echo "Invalid Endpoints!";
                }
                break;
            case 'uploadevaluation':
                if ($request[2]) {
                    echo json_encode($post->uploadStudentEvaluation($request[1], $request[2]));
                } else {
                    echo "Invalid Endpoints!";
                }
                break;
            case 'uploadseminarrecord':
                if ($request[1]) {
                    echo json_encode($post->uploadSeminarRecord($request[1], $data));
                } else {
                    echo "Invalid Endpoints!";
                }
                break;
            case 'uploadseminarcertificate':
                if ($request[1]) {
                    echo json_encode($post->uploadSeminarCertificate($request[1]));
                } else {
                    echo "Invalid Endpoints!";
                }
                break;
            case 'dtrclockin':
                echo json_encode($post->dtrClockIn($request[1]));
                break;
            case 'dtrclockout':
                echo json_encode($post->dtrClockOut($request[1]));
                break;
            case 'uploadavatar':
                if (isset($request[1])) {
                    $delete->deleteAvatar($request[1]);
                    echo json_encode($post->uploadAvatar($request[1]));
                } else {
                    echo "User ID not provided.";
                }
                break;
            case 'uploadlogo':
                if (isset($request[1])) {
                    $delete->deleteLogo($request[1]);
                    echo json_encode($post->uploadLogo($request[1]));
                } else {
                    echo "User ID not provided.";
                }
                break;

            case 'submission-comment':
                echo json_encode($post->addSubmissionComment($request[1], $request[2], $data));
                break;
            case 'updatedtrstatus':
                echo json_encode($post->updateDTRStatus($request[1], $data));
                break;
            case 'updatesupervisorapproval':
                echo json_encode($post->updateSupervisorApproval($request[1], $request[2], $data));
                break;
            case 'updateadvisorapproval':
                echo json_encode($post->updateAdvisorApproval($request[1], $request[2], $data));
                break;
            // Toggle a student submission's remark.
            case 'togglesubmissionremark':
                echo json_encode($post->toggleSubmissionRemark($request[1], $data->submissionId, $data->newRemark));
                break;
            // Toggle a student's practicum evaluation.
            case 'togglestudentevaluation':
                echo json_encode($post->toggleStudentEvaluation($data->id, $data->newEvaluation));
                break;
            case 'editstudentinfo':
                // Return JSON-encoded data for editing users
                echo json_encode($post->edit_student_info($data, $request[1]));
                break;
            case 'createhiringrequest':
                // Return JSON-encoded data for adding users
                echo json_encode($post->createHiringRequest($data));
                break;
            case 'addstudenttocompany':
                // Return JSON-encoded data for adding users
                echo json_encode($post->addStudentToCompany($data));
                break;
            case 'addstudenttosupervisor':
                // Return JSON-encoded data for adding users
                echo json_encode($post->addStudentToSupervisor($data));
                break;

            case 'resetpasswordtoken':
                echo json_encode($post->resetPasswordToken($data));
                break;

            case 'resetpassword':
                echo json_encode($post->resetPassword($data));
                break;
            case 'activateaccount':
                echo json_encode($post->activateAccount($data));
                break;

            case 'createclassjoinrequest':
                // Return JSON-encoded data for adding users
                echo json_encode($post->createClassJoinRequest($data));
                break;

            case 'createclassinvitation':
                // Return JSON-encoded data for adding users
                echo json_encode($post->createClassInvitation($data));
                break;
            case 'createclassjoinlink':
                // Return JSON-encoded data for adding users
                $delete->clearClassJoinLinks();
                echo json_encode($post->createClassJoinLink($data));
                break;

            case 'createwarrecord':
                // Return JSON-encoded data for adding users
                echo json_encode($post->createWarRecord($data));
                break;
            case 'warrecordsubmission':
                // Return JSON-encoded data for adding users
                echo json_encode($post->warRecordSubmission($data));
                break;
            case 'savewaractivities':
                echo json_encode($post->saveWarActivities($data));
                break;

            case 'createfinalreport':
                echo json_encode($post->createFinalReport($data));
                break;

            case 'createstudentevaluation':
                echo json_encode($post->createStudentEvaluation($data));
                break;

            default:
                // Return a 403 response for unsupported requests
                echo "No Such Request";
                http_response_code(403);
                break;
        }
        break;

    case 'DELETE':
        switch ($request[0]) {
            case 'deleteuser':
                if (isset($request[1])) {
                    echo json_encode($delete->delete_user($request[1]));
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;

            case 'unassigncoordinator':
                if (isset($request[1])) {
                    $delete->unassignCoordinatorFromClass($request[1], $request[2]);
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;

            case 'deletesubmission':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($delete->deleteSubmission($request[1], $request[2]));
                } else {
                    echo "Submission IDs not provided";
                    http_response_code(400);
                }
                break;

            case 'removestudentfromcompany':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($delete->removeStudentFromCompany($request[1], $request[2]));
                } else {
                    echo "Submission IDs not provided";
                    http_response_code(400);
                }
                break;

            case 'removestudentfromsupervisor':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($delete->removeStudentFromSupervisor($request[1], $request[2]));
                } else {
                    echo "Submission IDs not provided";
                    http_response_code(400);
                }
                break;
            case 'removestudentfromsupervisor2':
                if (isset($request[1])) {
                    echo json_encode($delete->removeStudentFromSupervisor($request[1]));
                } else {
                    echo "Submission IDs not provided";
                    http_response_code(400);
                }
                break;
            case 'deletehiringrequest':
                if (isset($request[1])) {
                    echo json_encode($delete->deleteHiringRequest($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'deleteseminarrecord':
                if (isset($request[1])) {
                    echo json_encode($delete->deleteSeminarRecord($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'unassignjob':
                if (isset($request[1])) {
                    echo json_encode($delete->unassignJob($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'unassignschedules':
                if (isset($request[1])) {
                    echo json_encode($delete->unassignSchedules($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'deleteavatar':
                if (isset($request[1])) {
                    echo json_encode($delete->deleteAvatar($request[1]));
                } else {
                    echo "User ID not provided";
                    http_response_code(400);
                }
                break;

            case 'cancelclassjoinrequest':
                if (isset($request[1])) {
                    echo json_encode($delete->cancelJoinRequest($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'rejectclassjoinrequest':
                if (isset($request[1])) {
                    echo json_encode($delete->rejectClassJoinRequest($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'cancelclassinvitation':
                if (isset($request[1])) {
                    echo json_encode($delete->cancelClassInvitation($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;
            case 'cancelclassinvitationbyid':
                if (isset($request[1])) {
                    echo json_encode($delete->cancelClassInvitationByID($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;
            case 'clearexpiredjoinlinks':
                echo json_encode($delete->clearClassJoinLinks());
                break;

            case 'clearwaractivities':
                if (isset($request[1])) {
                    echo json_encode($delete->clearWarActivities($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;
            case 'deletewaractivity':
                if (isset($request[1])) {
                    echo json_encode($delete->deleteWarActivity($request[1]));
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;





            default:
                // Return a 403 response for unsupported requests
                echo "No Such Request";
                http_response_code(403);
                break;
        }
        break;

    default:
        // Return a 404 response for unsupported HTTP methods
        echo "Unsupported HTTP method";
        http_response_code(404);
        break;
}

