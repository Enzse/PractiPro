<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
/**
 * API Endpoint Router
 * This PHP script serves as a simple API endpoint router, handling GET and POST requests for specific resources.
 */

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
            case 'getavatar':
                if (isset($request[1])) {
                    $get->get_avatar($request[1]);
                } else {
                    echo "ID not provided";
                    http_response_code(400);
                }
                break;

            case 'coordinator-students':
                if (count($request) > 1) {
                    echo json_encode($get->getStudentsByCoordinatorId($request[1]));
                } else {
                    echo json_encode($get->get_student());
                }
                break;

            case 'admin':

                echo json_encode($get->get_admins());

                break;

            case 'coordinator':

                if (count($request) > 1) {
                    echo json_encode($get->get_coordinators($request[1]));
                } else {
                    echo json_encode($get->get_coordinators());
                }
                break;

            case 'submission':
                if (count($request) > 1) {
                    echo json_encode($get->get_submission($request[1]));
                } else {
                    echo json_encode($get->get_submission());
                }
                break;

            case 'student-submission':
                if (count($request) > 1) {
                    echo json_encode($get->get_submissionByStudent($request[1]));
                } else {
                    echo json_encode($get->get_submissionByStudent());
                }
                break;

            case 'student-documentation':
                if (count($request) > 1) {
                    echo json_encode($get->get_documentationByStudent($request[1]));
                } else {
                    echo json_encode($get->get_documentationByStudent());
                }
                break;
            case 'student-dtr':
                if (count($request) > 1) {
                    echo json_encode($get->get_dtrByStudent($request[1]));
                } else {
                    echo json_encode($get->get_dtrByStudent());
                }
                break;
            case 'student-war':
                if (count($request) > 1) {
                    echo json_encode($get->get_warByStudent($request[1]));
                } else {
                    echo json_encode($get->get_warByStudent());
                }
                break;
            case 'student-finalreport':
                if (count($request) > 1) {
                    echo json_encode($get->get_finalReportByStudent($request[1]));
                } else {
                    echo json_encode($get->get_finalReportByStudent());
                }
                break;

            case 'student-maxdocsweeks':
                if (count($request) > 1) {
                    echo json_encode($get->get_studentMaxDocsWeeks($request[1]));
                } else {
                    echo json_encode($get->get_studentMaxDocsWeeks());
                }
                break;

            case 'student-maxdtrweeks':
                if (count($request) > 1) {
                    echo json_encode($get->get_studentMaxDtrWeeks($request[1]));
                } else {
                    echo json_encode($get->get_studentMaxDtrWeeks());
                }
                break;

            case 'student-maxwarweeks':
                if (count($request) > 1) {
                    echo json_encode($get->get_studentMaxWarWeeks($request[1]));
                } else {
                    echo json_encode($get->get_studentMaxWarWeeks());
                }
                break;

            case 'downloadrequirement':
                if (isset($request[1])) {
                    $submissionId = $request[1];
                    $get->downloadRequirement($submissionId);
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;
            case 'downloaddocumentation':
                if (isset($request[1])) {
                    $submissionId = $request[1];
                    $get->downloadDocumentation($submissionId);
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;
            case 'downloaddtr':
                if (isset($request[1])) {
                    $submissionId = $request[1];
                    $get->downloadDtr($submissionId);
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;
            case 'downloadwar':
                if (isset($request[1])) {
                    $submissionId = $request[1];
                    $get->downloadWar($submissionId);
                } else {
                    echo "Submission ID not provided";
                    http_response_code(400);
                }
                break;
            case 'downloadfinalreport':
                if (isset($request[1])) {
                    $submissionId = $request[1];
                    $get->downloadFinalReport($submissionId);
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

            case 'adduser':
                // Return JSON-encoded data for adding users
                echo json_encode($post->add_user($data));
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
            case 'uploadrequirement':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->upload_requirement($request[1], $request[2]));
                break;
            case 'uploaddocumentation':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->upload_documentation($request[1], $request[2]));
                break;
            case 'uploaddtr':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->upload_dtr($request[1], $request[2]));
                break;
            case 'uploadwar':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->upload_war($request[1], $request[2]));
                break;
            case 'uploadfinalreport':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->upload_finalReport($request[1]));
                break;
            case 'uploadavatar':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->uploadAvatar($request[1]));
                break;
            case 'toggleRequirementStatus':
                // Toggle the requirement status
                echo json_encode($post->toggleRequirementStatus($data->studentId, $data->requirement, $data->status));
                break;

            case 'togglerequirementsremark':
                echo json_encode($post->toggleSubmissionRemark($data->submissionId, $data->newRemark, 'submissions'));
                break;
            case 'toggledocsremark':
                echo json_encode($post->toggleSubmissionRemark($data->submissionId, $data->newRemark, 'documentations'));
                break;
            case 'toggledtrremark':
                echo json_encode($post->toggleSubmissionRemark($data->submissionId, $data->newRemark, 'dtr'));
                break;
            case 'togglewarremark':
                echo json_encode($post->toggleSubmissionRemark($data->submissionId, $data->newRemark, 'war'));
                break;
            case 'togglefinalreportsremark':
                echo json_encode($post->toggleSubmissionRemark($data->submissionId, $data->newRemark, 'finalreports'));
                break;
            case 'togglestudentevaluation':
                echo json_encode($post->toggleStudentEvaluation($data->id, $data->newEvaluation));
                break;

            case 'editstudentinfo':
                // Return JSON-encoded data for editing users
                echo json_encode($post->edit_student_info($data, $request[1]));
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

            default:
                // Return a 403 response for unsupported requests
                echo "No Such Request";
                http_response_code(403);
                break;
        }

    default:
        // Return a 404 response for unsupported HTTP methods
        echo "Method not available";
        http_response_code(404);
        break;
}

?>