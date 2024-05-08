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
require_once "./config/database.php";
require_once __DIR__ . '/bootstrap.php';
require_once "./src/Jwt.php";

// Initialize Get and Post objects
$con = new Connection();
$pdo = $con->connect();
$get = new Get($pdo);
$post = new Post($pdo);


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
                    echo json_encode($get->getByEmail());
                }
                break;

            case 'role':
                if (count($request) > 1) {
                    echo json_encode($get->get_roles($request[1]));
                } else {
                    echo json_encode($get->get_roles());
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

                echo json_encode($get->get_coordinators());

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

            case 'download':
                if (isset($request[1])) {
                    $submissionId = $request[1];
                    $get->download_file($submissionId);
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

            case 'login':
                $data = json_decode(file_get_contents('php://input'), true);

                if (!isset($data['email']) || !isset($data['password'])) {
                    http_response_code(400);
                    echo json_encode(["message" => "Missing login credentials"]);
                    exit();
                }

                $user = $get->getByEmail($data['email']);

                if ($user !== false && isset($user['password'])) {

                    // Verify the password
                    if (!password_verify($data['password'], $user['password'])) {
                        http_response_code(401);
                        echo json_encode(["message" => "Invalid Credentials!"]);
                        exit;
                    }
                    // Verify if account is active
                    if ($user['isActive'] === 0) {
                        http_response_code(401);
                        echo json_encode(["message" => "Matching credentials, but inactive account!"]);
                        exit;
                    }
                    // Generate JWT token
                    $JwtController = new Jwt($_ENV["SECRET_KEY"]);
                    $token = $JwtController->encode([
                        "id" => $user['id'],
                        "email" => $user['email'],
                        "role" => $user['role'],
                    ]);

                    // Respond with the generated token
                    echo json_encode(["token" => $token]);
                } else {
                    // User not found or password not set
                    http_response_code(404);
                    echo json_encode(["message" => "User not found or invalid credentials"]);
                    exit;
                }
                break;

            case 'adduser':
                // Return JSON-encoded data for adding users
                echo json_encode($post->add_user($data));
                break;

            case 'edituser':
                // Return JSON-encoded data for editing users
                echo json_encode($post->edit_user($data, $request[1]));
                break;

            case 'deleteuser':
                // Return JSON-encoded data for deleting users
                echo json_encode($post->delete_user($request[1]));
                break;

            case 'uploadfile':
                // Return JSON-encoded data for uploading files
                echo json_encode($post->upload_file($request[1], $request[2]));
                break;
            case 'toggleRequirementStatus':
                // Toggle the requirement status
                echo json_encode($post->toggleRequirementStatus($data->studentId, $data->requirement, $data->status));
                break;

            case 'editstudentinfo':
                // Return JSON-encoded data for editing users
                echo json_encode($post->edit_student_info($data, $request[1]));
                break;

            default:
                // Return a 403 response for unsupported requests
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;
    default:
        // Return a 404 response for unsupported HTTP methods
        echo "Method not available";
        http_response_code(404);
        break;
}

?>