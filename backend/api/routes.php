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

            case 'email':
                if (count($request) > 1) {
                    echo json_encode($get->getByEmail($request[1]));
                } else {
                    echo json_encode($get->getEmails());
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
            case 'classesbycoordinator':
                if (isset($request[1])) {
                    echo json_encode($get->get_classes_ByCoordinator($request[1]));
                } else {
                    echo "ID not provided";
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
            case 'class-coordinators':
                if (count($request) > 1) {
                    echo json_encode($get->get_classCoordinators($request[1]));
                } else {
                    echo json_encode($get->get_classCoordinators());
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
            case 'getavatar':
                if (isset($request[1])) {
                    $get->getAvatar($request[1]);
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


            case 'student-submission':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($get->getStudentSubmission($request[1], $request[2]));
                } else if (isset($request[1])) {
                    echo json_encode($get->getStudentSubmission($request[1]));
                } else {
                    echo "Insufficient IDs provided.";
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
                try {
                    $data = json_decode(file_get_contents('php://input'), true);

                    if (!isset($data['email']) || !isset($data['password'])) {
                        throw new Exception("Missing login credentials", 400);
                    }

                    $user = $get->getByEmail($data['email']);

                    if ($user !== false && isset($user['password'])) {
                        // Verify the password
                        if (!password_verify($data['password'], $user['password'])) {
                            throw new Exception("Invalid credentials", 401);
                        }
                        // Verify if account is active
                        if ($user['isActive'] === 0) {
                            throw new Exception("Inactive account", 403);
                        }
                        // Generate JWT token
                        $JwtController = new Jwt($_ENV["SECRET_KEY"]);
                        $token = $JwtController->encode([
                            "id" => $user['id'],
                            "firstName" => $user['firstName'],
                            "lastName" => $user['lastName'],
                            "email" => $user['email'],
                            "role" => $user['role'],
                        ]);

                        // Respond with the generated token
                        http_response_code(200);
                        echo json_encode(["token" => $token]);
                    } else {
                        // User not found or password not set
                        throw new Exception("User not found or invalid credentials", 404);
                    }
                } catch (Exception $e) {
                    // Handle exceptions
                    $statusCode = $e->getCode() ?: 500;
                    http_response_code($statusCode);
                    echo json_encode(["message" => "An error occurred: " . $e->getMessage()]);
                }
                break;

            case 'registeruser':
                // Return JSON-encoded data for adding users
                echo json_encode($post->registerUser($data));
                break;
            case 'ojtsite':
                // Return JSON-encoded data for adding users
                echo json_encode($post->addOjtSite($request[1], $data));
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
            case 'assignclassstudent':
                if (isset($request[1])) {
                    echo json_encode($post->assignClassStudent($data, $request[1]));
                } else {
                    echo "No requests Provided!";
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

            case 'submission-comment':
                echo json_encode($post->addSubmissionComment($request[1], $request[2], $data));
                break;
            // Toggle the student's status.
            case 'toggleRequirementStatus':
                echo json_encode($post->toggleRequirementStatus($data->studentId, $data->requirement, $data->status));
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
            case 'addstudenttocompany':
                // Return JSON-encoded data for adding users
                echo json_encode($post->addStudentToCompany($data));
                break;
            case 'addstudenttosupervisor':
                // Return JSON-encoded data for adding users
                echo json_encode($post->addStudentToSupervisor($data));
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

            case 'removestudentfromsupervisor':
                if (isset($request[1]) && isset($request[2])) {
                    echo json_encode($delete->removeStudentFromSupervisor($request[1], $request[2]));
                } else {
                    echo "Submission IDs not provided";
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

