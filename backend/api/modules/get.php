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
    public function getClassJoinRequestsAdvisor($block)
    {
        $sql = "SELECT cjr.*, s.studentId, s.firstName AS studentFirstName, s.lastName AS studentLastName
        FROM class_join_requests cjr
        JOIN students s
        ON cjr.student_id = s.id
        WHERE cjr.class = :class";

        return $this->get_records(null, null, null, $sql, ['class' => $block]);
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
    public function getClassInvitationsForBlock($id)
    {
        $sql = "SELECT cji.*, s.firstName AS studentFirstName, s.lastName AS studentLastName, s.studentId
        FROM class_join_invitations cji
        JOIN students s
        ON cji.student_id = s.id
        WHERE cji.class = :class";

        return $this->get_records(null, null, null, $sql, ['class' => $id]);
    }

    public function getClassJoinRequestCount($id)
    {
        $sql = "SELECT COUNT(*) AS requestCount FROM class_join_requests WHERE class = :class";

        return $this->get_records(null, null, null, $sql, ['class' => $id]);
    }

    public function getClassInvitationCount($id)
    {
        $sql = "SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE student_id = :studentId";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id]);
    }
    public function getClassInvitationForBlockCount($id)
    {
        $sql = "SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE class= :class";

        return $this->get_records(null, null, null, $sql, ['class' => $id]);
    }
    public function checkExistingInvitationForBlock($id, $block)
    {
        $sql = "SELECT COUNT(*) AS invitationCount FROM class_join_invitations WHERE student_id = :studentId AND class = :class";

        return $this->get_records(null, null, null, $sql, ['studentId' => $id, 'class' => $block]);
    }


    public function getClassJoinToken($token)
    {

        $sql = "SELECT * FROM class_join_links WHERE join_token_hash = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        //Check if a matching user was found
        if (!$result) {
            return $this->sendPayload(null, 'failed', "Token Not Found", 404);
        }
        //Check if the token has expired
        if (strtotime($result['join_token_expires_at']) <= time()) {
            return $this->sendPayload(null, 'failed', "Token Expired", 401);
        }

        return $this->sendPayload($result, 'success', "Token Found!", 200);
    }


    public function getWarRecords($id, $week = null)
    {
        $condition = $week ? "user_id = $id AND week = $week" : "user_id = $id";

        return $this->get_records('student_war_records', $condition);
    }

    public function getWarActivities($id)
    {
        $condition = "war_id = $id";

        return $this->get_records('student_war_activities', $condition);
    }

    public function checkIfWeekHasWarRecord($user_id, $week)
    {
        $condition = "user_id = $user_id AND week = $week";

        return $this->get_records('student_war_records', $condition);
    }

    public function getFinalReport($user_id)
    {
        $condition = "user_id = $user_id";

        return $this->get_records('student_final_reports', $condition);
    }

    public function getEvaluationForStudent($user_id)
    {
        $condition = "student_id = $user_id";

        return $this->get_records('student_supervisor_evaluation', $condition);
    }

    public function getPendingSubmissions($block)
    {
        $condition = "block = '$block'";

        return $this->get_records('vw_student_pending_submissions', $condition);
    }

    public function getPendingSubmissionsTotal($block)
    {
        $condition = "block_name = '$block'";

        return $this->get_records('vw_block_pending_submissions', $condition);
    }

    public function getStudentsWithPendingSubmissions($block, $submissionType, )
    {
        $validSubmissionTypes = ['pending_req_count', 'pending_doc_count', 'pending_sem_count', 'pending_war_count_advisor', 'pending_war_count_supervisor', 'pending_frp_count', 'pending_sse_count'];
        if (!in_array($submissionType, $validSubmissionTypes)) {
            throw new InvalidArgumentException('Invalid submission type.');
        }

        $sql = "SELECT 
        ojt.id,
        ojt.studentId,
        ojt.firstName,
        ojt.lastName,
        ojt.TotalHoursWorked,
        ojt.TotalSeminarHours,
        pending.$submissionType AS pendingSubmissions
    FROM 
        vw_student_ojt_status ojt
    JOIN 
        vw_student_pending_submissions pending ON ojt.id = pending.student_id
    WHERE 
        pending.$submissionType > 0
        AND ojt.block = :block ;";



        return $this->get_records(null, null, null, $sql, ['block' => $block]);
    }

    public function checkIfStudentHasPendingSubmission($student_id, $submissionType = null)
    {
        $columns = '*';
        $condition = "student_id = $student_id";
        if ($submissionType != null) {
            $columns = $submissionType;
            $condition = "student_id = $student_id AND $submissionType > 0";
        }
        // $condition = $submissionType ? "student_id = $student_id AND $submissionType > 0" : "student_id = $student_id";

        return $this->get_records('vw_student_pending_submissions', $condition, $columns);
    }

    public function getFinalReportsAnalytics($block)
    {
        $sql = "SELECT 
        SUM(CASE WHEN sfr.p1q1 = 'yes' THEN 1 ELSE 0 END) AS p1q1_yes_count,
        SUM(CASE WHEN sfr.p1q1 = 'no' THEN 1 ELSE 0 END) AS p1q1_no_count,
        SUM(CASE WHEN sfr.p1q2 = 'yes' THEN 1 ELSE 0 END) AS p1q2_yes_count,
        SUM(CASE WHEN sfr.p1q2 = 'no' THEN 1 ELSE 0 END) AS p1q2_no_count,
        SUM(CASE WHEN sfr.p1q3 = 'yes' THEN 1 ELSE 0 END) AS p1q3_yes_count,
        SUM(CASE WHEN sfr.p1q3 = 'no' THEN 1 ELSE 0 END) AS p1q3_no_count,
        SUM(CASE WHEN sfr.p1q4 = 'yes' THEN 1 ELSE 0 END) AS p1q4_yes_count,
        SUM(CASE WHEN sfr.p1q4 = 'no' THEN 1 ELSE 0 END) AS p1q4_no_count,
        SUM(CASE WHEN sfr.p1q5 = 'yes' THEN 1 ELSE 0 END) AS p1q5_yes_count,
        SUM(CASE WHEN sfr.p1q5 = 'no' THEN 1 ELSE 0 END) AS p1q5_no_count,
        SUM(CASE WHEN sfr.p1q6 = 'yes' THEN 1 ELSE 0 END) AS p1q6_yes_count,
        SUM(CASE WHEN sfr.p1q6 = 'no' THEN 1 ELSE 0 END) AS p1q6_no_count,
        SUM(CASE WHEN sfr.p1q7 = 'yes' THEN 1 ELSE 0 END) AS p1q7_yes_count,
        SUM(CASE WHEN sfr.p1q7 = 'no' THEN 1 ELSE 0 END) AS p1q7_no_count,
        SUM(CASE WHEN sfr.p1q7x1 = 'meal' THEN 1 ELSE 0 END) AS p1q7x1_meal_count,
        SUM(CASE WHEN sfr.p1q7x1 = 'cash' THEN 1 ELSE 0 END) AS p1q7x1_cash_count,
        SUM(CASE WHEN sfr.p1q7x1 IS NULL THEN 1 ELSE 0 END) AS p1q7x1_null_count,
        
        SUM(CASE WHEN sfr.p2q1x1 = '0' OR sfr.p2q2x1 = '0' OR sfr.p2q3x1 = '0' OR sfr.p2q4x1 = '0' OR sfr.p2q5x1 = '0' THEN 1 ELSE 0 END) AS p2x1_0,
        SUM(CASE WHEN sfr.p2q1x1 = '25' OR sfr.p2q2x1 = '25' OR sfr.p2q3x1 = '25' OR sfr.p2q4x1 = '25' OR sfr.p2q5x1 = '25' THEN 1 ELSE 0 END) AS p2x1_25,
        SUM(CASE WHEN sfr.p2q1x1 = '50' OR sfr.p2q2x1 = '50' OR sfr.p2q3x1 = '50' OR sfr.p2q4x1 = '50' OR sfr.p2q5x1 = '50' THEN 1 ELSE 0 END) AS p2x1_50,
        SUM(CASE WHEN sfr.p2q1x1 = '75' OR sfr.p2q2x1 = '75' OR sfr.p2q3x1 = '75' OR sfr.p2q4x1 = '75' OR sfr.p2q5x1 = '75' THEN 1 ELSE 0 END) AS p2x1_75,
        SUM(CASE WHEN sfr.p2q1x1 = '100' OR sfr.p2q2x1 = '100' OR sfr.p2q3x1 = '100' OR sfr.p2q4x1 = '100' OR sfr.p2q5x1 = '100' THEN 1 ELSE 0 END) AS p2x1_100,
        
        SUM(CASE WHEN sfr.p3q1 = 'Poor' THEN 1 ELSE 0 END) AS p3q1_poor,
        SUM(CASE WHEN sfr.p3q1 = 'Fair' THEN 1 ELSE 0 END) AS p3q1_fair,
        SUM(CASE WHEN sfr.p3q1 = 'Good' THEN 1 ELSE 0 END) AS p3q1_good,
        SUM(CASE WHEN sfr.p3q1 = 'Very Good' THEN 1 ELSE 0 END) AS p3q1_verygood,
        SUM(CASE WHEN sfr.p3q1 = 'Excellent' THEN 1 ELSE 0 END) AS p3q1_excellent
        
        -- Add more questions here
    FROM student_final_reports sfr
    JOIN students s ON sfr.user_id = s.id
    WHERE s.block = :block";

        return $this->get_records(null, null, null, $sql, ['block' => $block]);
    }

    public function getStudentEvaluationAnalytics($block)
    {
        $sql = "SELECT 

        SUM(CASE WHEN sse.p1q1 = '1' THEN 1 ELSE 0 END) AS p1q1_1,
        SUM(CASE WHEN sse.p1q1 = '2' THEN 1 ELSE 0 END) AS p1q1_2,
        SUM(CASE WHEN sse.p1q1 = '3' THEN 1 ELSE 0 END) AS p1q1_3,
        SUM(CASE WHEN sse.p1q1 = '4' THEN 1 ELSE 0 END) AS p1q1_4,
        SUM(CASE WHEN sse.p1q1 = '5' THEN 1 ELSE 0 END) AS p1q1_5,

        SUM(CASE WHEN sse.p1q2 = '1' THEN 1 ELSE 0 END) AS p1q2_1,
        SUM(CASE WHEN sse.p1q2 = '2' THEN 1 ELSE 0 END) AS p1q2_2,
        SUM(CASE WHEN sse.p1q2 = '3' THEN 1 ELSE 0 END) AS p1q2_3,
        SUM(CASE WHEN sse.p1q2 = '4' THEN 1 ELSE 0 END) AS p1q2_4,
        SUM(CASE WHEN sse.p1q2 = '5' THEN 1 ELSE 0 END) AS p1q2_5,
        
        SUM(CASE WHEN sse.p1q3 = '1' THEN 1 ELSE 0 END) AS p1q3_1,
        SUM(CASE WHEN sse.p1q3 = '2' THEN 1 ELSE 0 END) AS p1q3_2,
        SUM(CASE WHEN sse.p1q3 = '3' THEN 1 ELSE 0 END) AS p1q3_3,
        SUM(CASE WHEN sse.p1q3 = '4' THEN 1 ELSE 0 END) AS p1q3_4,
        SUM(CASE WHEN sse.p1q3 = '5' THEN 1 ELSE 0 END) AS p1q3_5,
        
        SUM(CASE WHEN sse.p1q4 = '1' THEN 1 ELSE 0 END) AS p1q4_1,
        SUM(CASE WHEN sse.p1q4 = '2' THEN 1 ELSE 0 END) AS p1q4_2,
        SUM(CASE WHEN sse.p1q4 = '3' THEN 1 ELSE 0 END) AS p1q4_3,
        SUM(CASE WHEN sse.p1q4 = '4' THEN 1 ELSE 0 END) AS p1q4_4,
        SUM(CASE WHEN sse.p1q4 = '5' THEN 1 ELSE 0 END) AS p1q4_5,
        
        SUM(CASE WHEN sse.p1q5 = '1' THEN 1 ELSE 0 END) AS p1q5_1,
        SUM(CASE WHEN sse.p1q5 = '2' THEN 1 ELSE 0 END) AS p1q5_2,
        SUM(CASE WHEN sse.p1q5 = '3' THEN 1 ELSE 0 END) AS p1q5_3,
        SUM(CASE WHEN sse.p1q5 = '4' THEN 1 ELSE 0 END) AS p1q5_4,
        SUM(CASE WHEN sse.p1q5 = '5' THEN 1 ELSE 0 END) AS p1q5_5,

        SUM(CASE WHEN sse.p2q1 = '1' THEN 1 ELSE 0 END) AS p2q1_1,
        SUM(CASE WHEN sse.p2q1 = '2' THEN 1 ELSE 0 END) AS p2q1_2,
        SUM(CASE WHEN sse.p2q1 = '3' THEN 1 ELSE 0 END) AS p2q1_3,
        SUM(CASE WHEN sse.p2q1 = '4' THEN 1 ELSE 0 END) AS p2q1_4,
        SUM(CASE WHEN sse.p2q1 = '5' THEN 1 ELSE 0 END) AS p2q1_5,
        
        SUM(CASE WHEN sse.p2q2 = '1' THEN 1 ELSE 0 END) AS p2q2_1,
        SUM(CASE WHEN sse.p2q2 = '2' THEN 1 ELSE 0 END) AS p2q2_2,
        SUM(CASE WHEN sse.p2q2 = '3' THEN 1 ELSE 0 END) AS p2q2_3,
        SUM(CASE WHEN sse.p2q2 = '4' THEN 1 ELSE 0 END) AS p2q2_4,
        SUM(CASE WHEN sse.p2q2 = '5' THEN 1 ELSE 0 END) AS p2q2_5,
        
        SUM(CASE WHEN sse.p2q3 = '1' THEN 1 ELSE 0 END) AS p2q3_1,
        SUM(CASE WHEN sse.p2q3 = '2' THEN 1 ELSE 0 END) AS p2q3_2,
        SUM(CASE WHEN sse.p2q3 = '3' THEN 1 ELSE 0 END) AS p2q3_3,
        SUM(CASE WHEN sse.p2q3 = '4' THEN 1 ELSE 0 END) AS p2q3_4,
        SUM(CASE WHEN sse.p2q3 = '5' THEN 1 ELSE 0 END) AS p2q3_5,
        
        SUM(CASE WHEN sse.p2q4 = '1' THEN 1 ELSE 0 END) AS p2q4_1,
        SUM(CASE WHEN sse.p2q4 = '2' THEN 1 ELSE 0 END) AS p2q4_2,
        SUM(CASE WHEN sse.p2q4 = '3' THEN 1 ELSE 0 END) AS p2q4_3,
        SUM(CASE WHEN sse.p2q4 = '4' THEN 1 ELSE 0 END) AS p2q4_4,
        SUM(CASE WHEN sse.p2q4 = '5' THEN 1 ELSE 0 END) AS p2q4_5,
        
        SUM(CASE WHEN sse.p2q5 = '1' THEN 1 ELSE 0 END) AS p2q5_1,
        SUM(CASE WHEN sse.p2q5 = '2' THEN 1 ELSE 0 END) AS p2q5_2,
        SUM(CASE WHEN sse.p2q5 = '3' THEN 1 ELSE 0 END) AS p2q5_3,
        SUM(CASE WHEN sse.p2q5 = '4' THEN 1 ELSE 0 END) AS p2q5_4,
        SUM(CASE WHEN sse.p2q5 = '5' THEN 1 ELSE 0 END) AS p2q5_5,

        SUM(CASE WHEN sse.p2q6 = '1' THEN 1 ELSE 0 END) AS p2q6_1,
        SUM(CASE WHEN sse.p2q6 = '2' THEN 1 ELSE 0 END) AS p2q6_2,
        SUM(CASE WHEN sse.p2q6 = '3' THEN 1 ELSE 0 END) AS p2q6_3,
        SUM(CASE WHEN sse.p2q6 = '4' THEN 1 ELSE 0 END) AS p2q6_4,
        SUM(CASE WHEN sse.p2q6 = '5' THEN 1 ELSE 0 END) AS p2q6_5,

        SUM(CASE WHEN sse.p2q7 = '1' THEN 1 ELSE 0 END) AS p2q7_1,
        SUM(CASE WHEN sse.p2q7 = '2' THEN 1 ELSE 0 END) AS p2q7_2,
        SUM(CASE WHEN sse.p2q7 = '3' THEN 1 ELSE 0 END) AS p2q7_3,
        SUM(CASE WHEN sse.p2q7 = '4' THEN 1 ELSE 0 END) AS p2q7_4,
        SUM(CASE WHEN sse.p2q7 = '5' THEN 1 ELSE 0 END) AS p2q7_5,

        SUM(CASE WHEN sse.p2q8 = '1' THEN 1 ELSE 0 END) AS p2q8_1,
        SUM(CASE WHEN sse.p2q8 = '2' THEN 1 ELSE 0 END) AS p2q8_2,
        SUM(CASE WHEN sse.p2q8 = '3' THEN 1 ELSE 0 END) AS p2q8_3,
        SUM(CASE WHEN sse.p2q8 = '4' THEN 1 ELSE 0 END) AS p2q8_4,
        SUM(CASE WHEN sse.p2q8 = '5' THEN 1 ELSE 0 END) AS p2q8_5,

        SUM(CASE WHEN sse.p3q1 = '1' THEN 1 ELSE 0 END) AS p3q1_1,
        SUM(CASE WHEN sse.p3q1 = '2' THEN 1 ELSE 0 END) AS p3q1_2,
        SUM(CASE WHEN sse.p3q1 = '3' THEN 1 ELSE 0 END) AS p3q1_3,
        SUM(CASE WHEN sse.p3q1 = '4' THEN 1 ELSE 0 END) AS p3q1_4,
        SUM(CASE WHEN sse.p3q1 = '5' THEN 1 ELSE 0 END) AS p3q1_5,
        
        SUM(CASE WHEN sse.p3q2 = '1' THEN 1 ELSE 0 END) AS p3q2_1,
        SUM(CASE WHEN sse.p3q2 = '2' THEN 1 ELSE 0 END) AS p3q2_2,
        SUM(CASE WHEN sse.p3q2 = '3' THEN 1 ELSE 0 END) AS p3q2_3,
        SUM(CASE WHEN sse.p3q2 = '4' THEN 1 ELSE 0 END) AS p3q2_4,
        SUM(CASE WHEN sse.p3q2 = '5' THEN 1 ELSE 0 END) AS p3q2_5,
        
        SUM(CASE WHEN sse.p3q3 = '1' THEN 1 ELSE 0 END) AS p3q3_1,
        SUM(CASE WHEN sse.p3q3 = '2' THEN 1 ELSE 0 END) AS p3q3_2,
        SUM(CASE WHEN sse.p3q3 = '3' THEN 1 ELSE 0 END) AS p3q3_3,
        SUM(CASE WHEN sse.p3q3 = '4' THEN 1 ELSE 0 END) AS p3q3_4,
        SUM(CASE WHEN sse.p3q3 = '5' THEN 1 ELSE 0 END) AS p3q3_5,
        
        SUM(CASE WHEN sse.p3q4 = '1' THEN 1 ELSE 0 END) AS p3q4_1,
        SUM(CASE WHEN sse.p3q4 = '2' THEN 1 ELSE 0 END) AS p3q4_2,
        SUM(CASE WHEN sse.p3q4 = '3' THEN 1 ELSE 0 END) AS p3q4_3,
        SUM(CASE WHEN sse.p3q4 = '4' THEN 1 ELSE 0 END) AS p3q4_4,
        SUM(CASE WHEN sse.p3q4 = '5' THEN 1 ELSE 0 END) AS p3q4_5,
        
        SUM(CASE WHEN sse.p3q5 = '1' THEN 1 ELSE 0 END) AS p3q5_1,
        SUM(CASE WHEN sse.p3q5 = '2' THEN 1 ELSE 0 END) AS p3q5_2,
        SUM(CASE WHEN sse.p3q5 = '3' THEN 1 ELSE 0 END) AS p3q5_3,
        SUM(CASE WHEN sse.p3q5 = '4' THEN 1 ELSE 0 END) AS p3q5_4,
        SUM(CASE WHEN sse.p3q5 = '5' THEN 1 ELSE 0 END) AS p3q5_5,

        SUM(CASE WHEN sse.p3q6 = '1' THEN 1 ELSE 0 END) AS p3q6_1,
        SUM(CASE WHEN sse.p3q6 = '2' THEN 1 ELSE 0 END) AS p3q6_2,
        SUM(CASE WHEN sse.p3q6 = '3' THEN 1 ELSE 0 END) AS p3q6_3,
        SUM(CASE WHEN sse.p3q6 = '4' THEN 1 ELSE 0 END) AS p3q6_4,
        SUM(CASE WHEN sse.p3q6 = '5' THEN 1 ELSE 0 END) AS p3q6_5,

        SUM(CASE WHEN sse.p3q7 = '1' THEN 1 ELSE 0 END) AS p3q7_1,
        SUM(CASE WHEN sse.p3q7 = '2' THEN 1 ELSE 0 END) AS p3q7_2,
        SUM(CASE WHEN sse.p3q7 = '3' THEN 1 ELSE 0 END) AS p3q7_3,
        SUM(CASE WHEN sse.p3q7 = '4' THEN 1 ELSE 0 END) AS p3q7_4,
        SUM(CASE WHEN sse.p3q7 = '5' THEN 1 ELSE 0 END) AS p3q7_5,

        SUM(CASE WHEN sse.p3q8 = '1' THEN 1 ELSE 0 END) AS p3q8_1,
        SUM(CASE WHEN sse.p3q8 = '2' THEN 1 ELSE 0 END) AS p3q8_2,
        SUM(CASE WHEN sse.p3q8 = '3' THEN 1 ELSE 0 END) AS p3q8_3,
        SUM(CASE WHEN sse.p3q8 = '4' THEN 1 ELSE 0 END) AS p3q8_4,
        SUM(CASE WHEN sse.p3q8 = '5' THEN 1 ELSE 0 END) AS p3q8_5,

        SUM(CASE WHEN sse.p3q9 = '1' THEN 1 ELSE 0 END) AS p3q9_1,
        SUM(CASE WHEN sse.p3q9 = '2' THEN 1 ELSE 0 END) AS p3q9_2,
        SUM(CASE WHEN sse.p3q9 = '3' THEN 1 ELSE 0 END) AS p3q9_3,
        SUM(CASE WHEN sse.p3q9 = '4' THEN 1 ELSE 0 END) AS p3q9_4,
        SUM(CASE WHEN sse.p3q9 = '5' THEN 1 ELSE 0 END) AS p3q9_5,
        
        SUM(CASE WHEN sse.p3q10 = '1' THEN 1 ELSE 0 END) AS p3q10_1,
        SUM(CASE WHEN sse.p3q10 = '2' THEN 1 ELSE 0 END) AS p3q10_2,
        SUM(CASE WHEN sse.p3q10 = '3' THEN 1 ELSE 0 END) AS p3q10_3,
        SUM(CASE WHEN sse.p3q10 = '4' THEN 1 ELSE 0 END) AS p3q10_4,
        SUM(CASE WHEN sse.p3q10 = '5' THEN 1 ELSE 0 END) AS p3q10_5,

        SUM(CASE WHEN sse.p3q11 = '1' THEN 1 ELSE 0 END) AS p3q11_1,
        SUM(CASE WHEN sse.p3q11 = '2' THEN 1 ELSE 0 END) AS p3q11_2,
        SUM(CASE WHEN sse.p3q11 = '3' THEN 1 ELSE 0 END) AS p3q11_3,
        SUM(CASE WHEN sse.p3q11 = '4' THEN 1 ELSE 0 END) AS p3q11_4,
        SUM(CASE WHEN sse.p3q11 = '5' THEN 1 ELSE 0 END) AS p3q11_5,

        SUM(CASE WHEN sse.p3q12 = '1' THEN 1 ELSE 0 END) AS p3q12_1,
        SUM(CASE WHEN sse.p3q12 = '2' THEN 1 ELSE 0 END) AS p3q12_2,
        SUM(CASE WHEN sse.p3q12 = '3' THEN 1 ELSE 0 END) AS p3q12_3,
        SUM(CASE WHEN sse.p3q12 = '4' THEN 1 ELSE 0 END) AS p3q12_4,
        SUM(CASE WHEN sse.p3q12 = '5' THEN 1 ELSE 0 END) AS p3q12_5,

        SUM(CASE WHEN sse.p3q13 = '1' THEN 1 ELSE 0 END) AS p3q13_1,
        SUM(CASE WHEN sse.p3q13 = '2' THEN 1 ELSE 0 END) AS p3q13_2,
        SUM(CASE WHEN sse.p3q13 = '3' THEN 1 ELSE 0 END) AS p3q13_3,
        SUM(CASE WHEN sse.p3q13 = '4' THEN 1 ELSE 0 END) AS p3q13_4,
        SUM(CASE WHEN sse.p3q13 = '5' THEN 1 ELSE 0 END) AS p3q13_5,
        
        SUM(CASE WHEN sse.p4q1 = 'Poor' THEN 1 ELSE 0 END) AS p4q1_poor,
        SUM(CASE WHEN sse.p4q1 = 'Fair' THEN 1 ELSE 0 END) AS p4q1_fair,
        SUM(CASE WHEN sse.p4q1 = 'Good' THEN 1 ELSE 0 END) AS p4q1_good,
        SUM(CASE WHEN sse.p4q1 = 'Very Good' THEN 1 ELSE 0 END) AS p4q1_verygood,
        SUM(CASE WHEN sse.p4q1 = 'Excellent' THEN 1 ELSE 0 END) AS p4q1_excellent
        
        -- Add more questions here
    FROM student_supervisor_evaluation sse
    JOIN students s ON sse.student_id = s.id
    WHERE s.block = :block";

        return $this->get_records(null, null, null, $sql, ['block' => $block]);
    }


}
