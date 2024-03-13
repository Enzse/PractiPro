<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
/**
 * API Endpoint Router
 *
 * This PHP script serves as a simple API endpoint router, handling GET and POST requests for specific resources.
 *
 *
 * Usage:
 * 1. Include this script in your project.
 * 2. Define resource-specific logic in the 'get.php' and 'post.php' modules.
 * 3. Send requests to the appropriate endpoints defined in the 'switch' cases below.
 *
 * Example Usage:
 * - API_URL: http://localhost/demoproject/api
 * - GET request for employees: API_URL/employees
 * - GET request for jobs: API_URL/jobs
 * - POST request for adding employees: API_URL/addemployee (with JSON data in the request body)
 * - POST request for adding jobs: API_URL/addjob (with JSON data in the request body)
 *
 */

// Include required modules
require_once "./modules/get.php";
require_once "./modules/post.php";
require_once "./config/database.php";

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

            case 'admin':

                echo json_encode($get->get_admins());

                break;

            case 'submission':
                if (count($request) > 1) {
                    echo json_encode($get->get_submission($request[1]));
                } else {
                    echo json_encode($get->get_submission());
                }
                break;;

            default:
                // Return a 403 response for unsupported requests
                echo "This is forbidden";
                http_response_code(403);
                break;
        }
        break;
    // Handle POST requests    
    case 'POST':
        // Retrieves JSON-decoded data from php://input using file_get_contents
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
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