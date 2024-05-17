<?php

require_once 'global.php';

class Get extends GlobalMethods
{
    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    //ESSENTIALS
    private function get_records($table, $conditions = null, $columns = '*')
    {
        $sqlStr = "SELECT $columns FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }
        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }
    private function executeQuery($sql)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            $statement = $this->pdo->query($sql);
            if ($statement) {
                $result = $statement->fetchAll(PDO::FETCH_ASSOC);
                foreach ($result as $record) {
                    // Handle BLOB data
                    if (isset($record['file_data'])) {

                        $record['file_data'] = base64_encode($record['file_data']);
                    }
                    array_push($data, $record);
                }
                $code = 200;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found.";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }



    //LOGIN FUNCTIONS
    public function getByEmail(string $email = null): array|false
    {

        $condition = ($email !== null) ? "email = '$email'" : null;
        $result = $this->get_records('user', $condition);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'][0]; // Return the first user record
        } else {
            return array();
        }
    }
    public function getEmails($id = null)
    {
        $columns = "email";
        $condition = ($id !== null) ? "id = $id" : null;
        $result = $this->get_records('user', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            $payloadData = $result['payload'];

            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }




    //ADMIN: GET USERS
    public function get_users($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "id=$id";
        }
        return $this->get_records('user', $condition);
    }

    public function get_admins()
    {
        $condition = "role= 'admin'";

        return $this->get_records('user', $condition);
    }
    public function get_student($userId = null)
    {
        $columns = "id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth, evaluation";
        $condition = ($userId !== null) ? "id = $userId" : null;
        $result = $this->get_records('students', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            $payloadData = $result['payload'];

            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    public function get_studentsFromClasses($block)
    {
        $columns = "id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth, evaluation";
        $condition = "block = '$block'";
        $result = $this->get_records('students', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            $payloadData = $result['payload'];

            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    public function get_coordinators($id = null)
    {
        $sql = "SELECT c.*, COUNT(r.block_name) AS number_of_classes
            FROM coordinators c
            LEFT JOIN rl_class_coordinators r ON c.id = r.coordinator_id";

        if ($id !== null) {
            $sql .= " WHERE c.id = $id";
        }

        $sql .= " GROUP BY c.id";

        $result = $this->executeQuery($sql);

        if ($result['code'] == 200) {
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }

    public function get_classes($id = null)
    {
        $condition = ($id !== null) ? "block_name = $id" : null;
        $result = $this->get_records('class_blocks', $condition);

        if ($result['status']['remarks'] === 'success') {
            $payloadData = $result['payload'];

            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    public function get_classCoordinators($id = null, $block = null)
    {
        $condition = ($id !== null) ? "coordinator_id = $id" : null;
        $condition = ($block !== null) ? "block_name = $block" : null;
        $result = $this->get_records('rl_class_coordinators', $condition);

        if ($result['status']['remarks'] === 'success') {
            $payloadData = $result['payload'];

            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    public function get_classes_ByCoordinator($coordinatorId)
    {
    
        $sql = "SELECT cb.*
        FROM class_blocks cb
        JOIN rl_class_coordinators rcc ON cb.block_name = rcc.block_name
        WHERE rcc.coordinator_id = :coordinatorId";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':coordinatorId', $coordinatorId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (empty($result)) {
                return $this->sendPayload(null, 'failed', "No students found for coordinator ID $coordinatorId.", 404);
            }
            return $this->sendPayload($result, 'success', "Successfully retrieved students.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }    


    //ADMIN: GET CORE DATA
    public function get_roles($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "id=$id";
        }
        return $this->get_records('role', $condition);
    }
    public function get_departments($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "id=$id";
        }
        return $this->get_records('departments', $condition);
    }


    //GET SUBMISSIONS
    public function get_student_requirements($userId = null)
    {
        $condition = ($userId !== null) ? "student_id = $userId" : null;
        $result = $this->get_records('student_requirements', $condition);

        if ($result['status']['remarks'] === 'success') {

            $payloadData = $result['payload'];


            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    public function get_avatar($id)
    {
        $fileInfo = $this->get_imageData($id);

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['avatar'];

            // Set headers for file download
            header('Content-Type: image/png');
            echo $fileData;
            exit();
        } else {
            echo "User has not uploaded an avatar yet.";
            http_response_code(404);
        }
    }
    public function get_imageData($userId = null)
    {
        $columns = "avatar";
        $condition = ($userId !== null) ? "id = $userId" : null;
        $result = $this->get_records('students', $condition, $columns);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['avatar'])) {
            $fileData = $result['payload'][0]['avatar'];
            return array("avatar" => $fileData);
        } else {
            return array("avatar" => null);
        }
    }



    public function getStudentsByCoordinatorId($coordinatorId)
    {
        $sql = "SELECT s.id, s.firstName, s.lastName, s.studentId, s.block, s.evaluation
        FROM coordinators c
        JOIN class_blocks cb ON c.id = cb.coordinator_id
        JOIN students s ON cb.block_name = s.block
        WHERE c.id = :coordinatorId";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':coordinatorId', $coordinatorId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (empty($result)) {
                return $this->sendPayload(null, 'failed', "No students found for coordinator ID $coordinatorId.", 404);
            }
            return $this->sendPayload($result, 'success', "Successfully retrieved students.", 200);
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }


    public function get_submission($id = null)
    {
        $columns = "submission_id, submission_name, file_name, file_type, file_size, user_id";
        $condition = ($id != null) ? "submission_id=$id" : null;
        $result = $this->get_records('submissions', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            return $result['payload'];
        } else {
            return array();
        }
    }

    public function get_submissionByStudent($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "user_id=$id";
        }
        $result = $this->get_records('submissions', $condition);

        if ($result['status']['remarks'] === 'success') {

            $payloadData = $result['payload'];


            if (is_array($payloadData)) {
                return $payloadData;
            } else {
                return array();
            }
        } else {
            return array();
        }
    }

    public function get_documentationByStudent($id = null)
    {
        $columns = "doc_id, user_id, week, file_name, created_at, remarks";
        $condition = ($id != null) ? "user_id=$id" : null;
        $result = $this->get_records('documentations', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            return $result['payload'];
        } else {
            return array();
        }
    }
    public function get_dtrByStudent($id = null)
    {
        $columns = "dtr_id, user_id, week, file_name, created_at, remarks";
        $condition = ($id != null) ? "user_id=$id" : null;
        $result = $this->get_records('dtr', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            return $result['payload'];
        } else {
            return array();
        }
    }
    public function get_warByStudent($id = null)
    {
        $columns = "war_id, user_id, week, file_name, created_at, remarks";
        $condition = ($id != null) ? "user_id=$id" : null;
        $result = $this->get_records('war', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            return $result['payload'];
        } else {
            return array();
        }
    }

    public function get_finalReportByStudent($id = null)
    {
        $columns = "report_id, user_id, file_name, created_at, remarks";
        $condition = ($id != null) ? "user_id=$id" : null;
        $result = $this->get_records('finalreports', $condition, $columns);

        if ($result['status']['remarks'] === 'success') {
            return $result['payload'];
        } else {
            return array();
        }
    }



    public function get_documentation($id = null)
    {
        $columns = "doc_id, user_id, week, file_name, file_type, file_size, created_at";
        $condition = ($id != null) ? "doc_id=$id" : null;

        // Fetch the maximum week number from the database
        $maxWeekQuery = "SELECT MAX(week) AS max_week FROM documentations";
        $maxWeekResult = $this->executeQuery($maxWeekQuery);
        $maxWeek = $maxWeekResult['data'][0]['max_week'];

        // If maxWeek is null, set it to 0
        if ($maxWeek === null) {
            $maxWeek = 0;
        }

        // Generate an array of week numbers from 1 to maxWeek
        $weekNumbers = range(1, $maxWeek);

        // Return the array directly
        return $weekNumbers;
    }
    public function get_studentMaxDocsWeeks($id = null)
    {
        $columns = "doc_id, user_id, week, file_name, file_type, file_size, created_at";
        $condition = ($id != null) ? "user_id=$id" : null;

        // Fetch the maximum week number from the database
        $maxWeekQuery = "SELECT MAX(week) AS max_week FROM documentations";

        if ($id != null) {
            $maxWeekQuery .= " WHERE user_id = $id";
        }
        $maxWeekResult = $this->executeQuery($maxWeekQuery);
        $maxWeek = $maxWeekResult['data'][0]['max_week'];

        // If maxWeek is null, set it to 0
        if ($maxWeek === null) {
            $weekNumbers = [1];
        } else {
            $weekNumbers = range(1, $maxWeek);

        }

        // Generate an array of week numbers from 1 to maxWeek

        // Return the array directly
        return $weekNumbers;
    }

    public function get_studentMaxDtrWeeks($id = null)
    {
        $columns = "dtr_id, user_id, week, file_name, file_type, file_size, created_at";
        $condition = ($id != null) ? "user_id=$id" : null;

        // Fetch the maximum week number from the database
        $maxWeekQuery = "SELECT MAX(week) AS max_week FROM dtr";

        if ($id != null) {
            $maxWeekQuery .= " WHERE user_id = $id";
        }
        $maxWeekResult = $this->executeQuery($maxWeekQuery);
        $maxWeek = $maxWeekResult['data'][0]['max_week'];

        // If maxWeek is null, set it to 0
        if ($maxWeek === null) {
            $weekNumbers = [1];
        } else {
            $weekNumbers = range(1, $maxWeek);

        }

        // Generate an array of week numbers from 1 to maxWeek

        // Return the array directly
        return $weekNumbers;
    }

    public function get_studentMaxWarWeeks($id = null)
    {
        $columns = "dtr_id, user_id, week, file_name, file_type, file_size, created_at";
        $condition = ($id != null) ? "user_id=$id" : null;

        // Fetch the maximum week number from the database
        $maxWeekQuery = "SELECT MAX(week) AS max_week FROM war";

        if ($id != null) {
            $maxWeekQuery .= " WHERE user_id = $id";
        }
        $maxWeekResult = $this->executeQuery($maxWeekQuery);
        $maxWeek = $maxWeekResult['data'][0]['max_week'];

        // If maxWeek is null, set it to 0
        if ($maxWeek === null) {
            $weekNumbers = [1];
        } else {
            $weekNumbers = range(1, $maxWeek);

        }

        // Generate an array of week numbers from 1 to maxWeek

        // Return the array directly
        return $weekNumbers;
    }



    // FOR DOWNLOADS!!!!!!!!!




    //FOR PDF REQUIREMENT DOWNLOADS
    public function downloadRequirement($submissionId)
    {
        $fileInfo = $this->getRequirementData($submissionId);

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['file_data'];
            $fileName = $fileInfo['file_name'];

            // Set headers for file download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            echo $fileData;
            exit();
        } else {
            echo "File not found";
            http_response_code(404);
        }
    }
    public function getRequirementData($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "submission_id=$id";
        }
        $result = $this->get_records('submissions', $condition);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['file_data'])) {
            $fileData = base64_decode($result['payload'][0]['file_data']);
            $fileName = $result['payload'][0]['file_name']; // Retrieve the file name
            return array("file_data" => $fileData, "file_name" => $fileName);
        } else {
            return false;
        }
    }


    //FOR DOCUMENTATIONS
    public function downloadDocumentation($submissionId)
    {
        $fileInfo = $this->getDocumentationData($submissionId);

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['file_data'];
            $fileName = $fileInfo['file_name'];

            // Set headers for file download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            echo $fileData;
            exit();
        } else {
            echo "File not found";
            http_response_code(404);
        }
    }
    public function getDocumentationData($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "doc_id=$id";
        }
        $result = $this->get_records('documentations', $condition);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['file_data'])) {
            $fileData = base64_decode($result['payload'][0]['file_data']);
            $fileName = $result['payload'][0]['file_name']; // Retrieve the file name
            return array("file_data" => $fileData, "file_name" => $fileName);
        } else {
            return false;
        }
    }


    //FOR DTR
    public function downloadDtr($submissionId)
    {
        $fileInfo = $this->getDtrData($submissionId);

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['file_data'];
            $fileName = $fileInfo['file_name'];

            // Set headers for file download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            echo $fileData;
            exit();
        } else {
            echo "File not found";
            http_response_code(404);
        }
    }
    public function getDtrData($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "dtr_id=$id";
        }
        $result = $this->get_records('dtr', $condition);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['file_data'])) {
            $fileData = base64_decode($result['payload'][0]['file_data']);
            $fileName = $result['payload'][0]['file_name']; // Retrieve the file name
            return array("file_data" => $fileData, "file_name" => $fileName);
        } else {
            return false;
        }
    }


    //FOR WAR
    public function downloadWar($submissionId)
    {
        $fileInfo = $this->getWarData($submissionId);

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['file_data'];
            $fileName = $fileInfo['file_name'];

            // Set headers for file download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            echo $fileData;
            exit();
        } else {
            echo "File not found";
            http_response_code(404);
        }
    }
    public function getWarData($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "war_id=$id";
        }
        $result = $this->get_records('war', $condition);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['file_data'])) {
            $fileData = base64_decode($result['payload'][0]['file_data']);
            $fileName = $result['payload'][0]['file_name']; // Retrieve the file name
            return array("file_data" => $fileData, "file_name" => $fileName);
        } else {
            return false;
        }
    }

    //FOR WAR
    public function downloadFinalReport($submissionId)
    {
        $fileInfo = $this->getFinalReportData($submissionId);

        // Check if file info exists
        if ($fileInfo) {
            $fileData = $fileInfo['file_data'];
            $fileName = $fileInfo['file_name'];

            // Set headers for file download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            echo $fileData;
            exit();
        } else {
            echo "File not found";
            http_response_code(404);
        }
    }
    public function getFinalReportData($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "report_id=$id";
        }
        $result = $this->get_records('finalreports', $condition);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['file_data'])) {
            $fileData = base64_decode($result['payload'][0]['file_data']);
            $fileName = $result['payload'][0]['file_name']; // Retrieve the file name
            return array("file_data" => $fileData, "file_name" => $fileName);
        } else {
            return false;
        }
    }


}
