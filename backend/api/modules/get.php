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

        $condition = ($userId !== null) ? "id = $userId" : null;
        return $this->get_records('students', $condition);

    }
    public function getStudentsOjtInfo($userId = null)
    {
        $condition = ($userId !== null) ? "id = $userId" : null;
        return $this->get_records('vw_student_ojt_status', $condition);
    }


    public function get_studentsFromClasses($block)
    {
        $condition = "block = '$block'";
        return $this->get_records('vw_student_ojt_status', $condition);
    }

    public function get_studentByCourseAndYear($course, $year)
    {
        $condition = ($course !== null) ? "program = '$course' AND year = $year" : null;
        return $this->get_records('students', $condition);
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
        return $this->get_records('class_blocks', $condition);
    }

    public function getClassData($id = null)
    {
        $condition = ($id !== null) ? "block_name = '$id'" : null;
        return $this->get_records('vw_class_profile', $condition);
    }

    public function get_classesByCourseAndYear($course, $year)
    {
        $condition = "course = '$course' AND year_level = $year";
        return $this->get_records('vw_class_profile', $condition);
    }

    public function get_classes_ByCoordinator($coordinatorId)
    {

        $sql = "SELECT cb.*
        FROM vw_class_profile cb
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
        return $this->get_records('vw_student_requirements', $condition);
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
    public function getLogo($userId)
    {
        $columns = "avatar";
        $condition = "company_id = $userId";
        $result = $this->get_records('company_logos', $condition, $columns);

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
                $columns = "id, user_id, submission_name, file_name, created_at, remarks, comments, advisor_approval";
                break;
            case 'finalreports':
                $columns = "id, user_id, file_name, created_at, remarks, comments, advisor_approval";
                break;
            case 'war':
                $columns = "id, user_id, week, file_name, created_at, remarks, comments, supervisor_approval, advisor_approval";
                break;
            default:
                $columns = "id, user_id, week, file_name, created_at, remarks, comments, advisor_approval";
                break;
        }
        $condition = ($id != null) ? "user_id=$id" : null;

        return $this->get_records($table, $condition, $columns);
    }

    public function getStudentEvaluation($id)
    {
        $sql = "SELECT sse.id, sse.user_id, sse.student_id, sse.file_name, sse.created_at, sse.advisor_approval, sse.comments, s.firstName AS sfirstName, s.lastName AS slastName
        FROM supervisor_student_evaluations sse
        JOIN supervisors s
        ON sse.user_id = s.id
        WHERE sse.student_id = :studentId";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id]);
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
        switch ($table) {
            case "student_seminar_certificates":
                $condition = "record_id=$id";
                break;
            default:
                $condition = "id=$id";
                break;
        }
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

    public function getCompanies($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "id=$id";
        }
        return $this->get_records('vw_company_profile', $condition);
    }

    public function getStudentJob($id)
    {
        $sql = "SELECT sj.*, s.firstName AS sfirstName, s.lastName AS slastName
        FROM student_jobs sj
        JOIN supervisors s
        ON sj.assigned_by = s.id
        WHERE sj.student_id = :studentId";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id]);
    }


    public function checkExistingAssignment($table, $condition1, $condition2, $id1, $id2)
    {
        $sql = "SELECT COUNT(*) AS assignment_count
            FROM $table
            WHERE $condition1 = :id1 AND $condition2 = :id2";

        return $this->get_records(null, null, null, $sql, ['id1' => $id1, 'id2' => $id2]);
    }

    public function getHiringRequests($id)
    {
        $sql = "SELECT hr.*, ip.company_name, s.firstName AS sFirstName, s.lastName AS sLastName
        FROM company_hiring_requests hr
        JOIN industry_partners ip
        ON hr.company_id = ip.id
        JOIN supervisors s
        ON hr.supervisor_id = s.id
        WHERE hr.student_id = :studentId";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id]);
    }

    public function getSeminarRecords($id)
    {
        $condition = "student_id=$id";

        return $this->get_records('student_seminar_records', $condition);
    }

    public function getStudentSchedules($id)
    {
        $condition = "student_id=$id";

        return $this->get_records('student_ojt_schedules', $condition);
    }

    public function getResetPasswordToken($token)
    {
        $token_hash = hash("sha256", $token);

        $sql = "SELECT * FROM user WHERE reset_token_hash = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$token_hash]);
        $matchinguser = $stmt->fetch(PDO::FETCH_ASSOC);

        //Check if a matching user was found
        if (!$matchinguser) {
            return $this->sendPayload(null, 'failed', "Token Not Found", 404);
        }
        //Check if the token has expired
        if (strtotime($matchinguser['reset_token_expires_at']) <= time()) {
            return $this->sendPayload(null, 'failed', "Token Expired", 401);
        }

        return $this->sendPayload(null, 'success', "Token Found!", 200);
    }

    public function getAccountActivationToken($token)
    {
        $token_hash = hash("sha256", $token);

        $sql = "SELECT * FROM user WHERE account_activation_hash = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$token_hash]);
        $matchinguser = $stmt->fetch(PDO::FETCH_ASSOC);

        //Check if a matching user was found
        if (!$matchinguser) {
            return $this->sendPayload(null, 'failed', "Token Not Found", 404);
        }
        return $this->sendPayload(null, 'success', "Token Found!", 200);
    }

    public function getClassJoinRequests($id)
    {
        $condition = "student_id = $id";

        return $this->get_records('class_join_requests', $condition);
    }

    public function getClassInvitations($id)
    {
        $sql = "SELECT cji.*, c.first_name AS advisorFirstName, c.last_name AS advisorLastName
        FROM class_join_invitations cji
        JOIN coordinators c
        ON cji.advisor_id = c.id
        WHERE cji.student_id = :studentId";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id]);
    }


    public function getClassInvitationCount($id)
    {
        $sql = "SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE student_id = :studentId";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id]);
    }
}
