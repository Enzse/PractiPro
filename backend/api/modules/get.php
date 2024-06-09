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
    private function get_records($table = null, $conditions = null, $columns = '*', $customSqlStr = null, $params = [])
    {
        if ($customSqlStr != null) {
            $sqlStr = $customSqlStr;
        } else {
            $sqlStr = "SELECT $columns FROM $table";
            if ($conditions != null) {
                $sqlStr .= " WHERE " . $conditions;
            }
        }
        $result = $this->executeQuery($sqlStr, $params);

        if ($result['code'] == 200) {
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }

    private function executeQuery($sql, $params = [])
    {
        $data = [];
        $errmsg = "";
        $code = 0;

        try {
            $statement = $this->pdo->prepare($sql);
            if ($statement->execute($params)) {
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
        if ($email === null) {
            return false;
        }

        $sql = "SELECT * FROM user WHERE email = :email LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['email' => $email]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result;
        } else {
            return false;
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

    public function getAdmins()
    {
        $condition = "role= 'admin'";

        return $this->get_records('user', $condition);
    }
    public function getSupervisors($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "id=$id";
        }
        return $this->get_records('supervisors', $condition);
    }
    public function get_student($userId = null)
    {
        $columns = "id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth, evaluation, registrationstatus";
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
    public function getStudentsOjtInfo($userId = null)
    {
        $condition = ($userId !== null) ? "id = $userId" : null;
        return $this->get_records('vw_student_ojt_status', $condition);
    }


    public function get_studentsFromClasses($block)
    {
        $columns = "id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth, evaluation, registrationstatus";
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
    public function get_studentByCourse($course)
    {
        $columns = "id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth, evaluation, registrationstatus";
        $condition = ($course !== null) ? "program = '$course'" : null;
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
    public function get_studentByCourseAndYear($course, $year)
    {
        $columns = "id, firstName, lastName, studentId, program, year, block, email, phoneNumber, address, dateOfBirth, evaluation, registrationstatus";
        $condition = ($course !== null) ? "program = '$course' AND year = $year" : null;
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
        $condition = ($id !== null) ? "block_name = '$id'" : null;
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

        return $this->get_records(null, null, null, $sql, ['coordinatorId' => $coordinatorId]);
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

    public function getAvatar($userId)
    {
        $columns = "avatar";
        $condition = "user_id = $userId";
        $result = $this->get_records('user_avatars', $condition, $columns);

        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['avatar'])) {
            $fileData = $result['payload'][0]['avatar'];
            $fileInfo = array("avatar" => $fileData);
        } else {
            return array("avatar" => null);
        }
        if ($fileInfo) {
            $fileData = $fileInfo['avatar'];

            header('Content-Type: image/png');
            echo $fileData;
            exit();
        } else {
            echo "User has not uploaded an avatar yet.";
            http_response_code(404);
        }
    }

    public function getStudentsByStudentID($studentId)
    {
        $sql = "SELECT vw_student_ojt_status.*, industry_partners.company_name, industry_partners.address AS company_address
            FROM `vw_student_ojt_status`
            LEFT JOIN industry_partners ON vw_student_ojt_status.company_id = industry_partners.id
            WHERE vw_student_ojt_status.studentId = :studentId";
        return $this->get_records(null, null, null, $sql, ['studentId' => $studentId]);
    }


    public function getStudentSubmission($table, $id = null)
    {
        $columns = null;

        switch ($table) {
            case 'submissions':
                $columns = "id, user_id, submission_name, file_name, created_at, remarks, comments";
                break;
            case 'finalreports':
                $columns = "id, user_id, file_name, created_at, remarks, comments";
                break;
            default:
                $columns = "id, user_id, week, file_name, created_at, remarks, comments";
                break;
        }
        $condition = ($id != null) ? "user_id=$id" : null;

        return $this->get_records($table, $condition, $columns);
    }

    public function getStudentDTR($id = null)
    {
        $condition = ($id != null) ? "student_id=$id" : null;
        return $this->get_records('student_dailytimerecords', $condition);
    }


    // FOR DOWNLOADS!!!!!!!!!
    public function getSubmissionMaxWeeks($table, $id)
    {
        // Fetch the maximum week number from the database.
        $maxWeekQuery = "SELECT MAX(week) AS max_week FROM $table";

        if ($id != null) {
            $maxWeekQuery .= " WHERE user_id = $id";
        }
        $maxWeekResult = $this->executeQuery($maxWeekQuery);
        $maxWeek = $maxWeekResult['data'][0]['max_week'];

        // If maxWeek is null, set it to 1
        if ($maxWeek === null) {
            $weekNumbers = [1];
        } else {
            $weekNumbers = range(1, $maxWeek);
        }
        return $weekNumbers;
    }


    // FOR DOWNLOADS!!!!!!!!!
    public function getSubmissionFile($table, $id)
    {
        $condition = "id=$id";
        $result = $this->get_records($table, $condition);
        if ($result['status']['remarks'] === 'success' && isset($result['payload'][0]['file_data'])) {
            $fileData = base64_decode($result['payload'][0]['file_data']);
            $fileName = $result['payload'][0]['file_name'];
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $fileName . '"');
            echo $fileData;
            exit();
        } else {
            echo "File not Found";
        }
    }



    //HANDLES ALL COMMENTS
    public function getSubmissionComments($table, $id)
    {
        $condition = null;
        if ($id != null) {
            $condition = "file_id=$id";
        }
        return $this->get_records($table, $condition);
    }


    //COMPANY FUNCTIONS
    public function getStudentsByCompany($company_id)
    {
        $sql = "SELECT v.*, s.firstName AS sFirstName, s.lastName AS sLastName
        FROM vw_student_ojt_status v
        JOIN rl_company_students cs
        ON v.id = cs.student_id
        JOIN supervisors s
        ON cs.hired_by = s.id
        WHERE v.company_id = :companyId";

        return $this->get_records(null, null, null, $sql, ['companyId' => $company_id]);
    }


    public function getStudentsBySupervisor($supervisor_id)
    {
        $sql = "SELECT v.*
        FROM vw_student_ojt_status v
        JOIN rl_supervisor_students r
        ON v.id = r.student_id
        WHERE r.supervisor_id = :supervisorId";

        return $this->get_records(null, null, null, $sql, ['supervisorId' => $supervisor_id]);
    }


}
