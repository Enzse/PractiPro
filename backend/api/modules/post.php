<?php

require_once 'global.php';

class Post extends GlobalMethods
{

    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function userLogin($data, $user)
    {
        if ($user !== false && isset($user['password'])) {
            // Verify the password
            if (!password_verify($data['password'], $user['password'])) {
                return $this->sendPayload(null, "failed", "Invalid Credentials.", 401);
            }
            // Verify if account is active
            if ($user['isActive'] === 0) {
                return $this->sendPayload(null, "failed", "Inactive Account.", 403);
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
            return $this->sendPayload(null, "failed", "User not found.", 404);
        }
    }

    public function doesEmailExist($email)
    {
        $sql = "SELECT email FROM user WHERE email = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return array();
        }
    }

    public function registerUser($data)
    {
        $this->pdo->beginTransaction();
        try {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
            $activation_token = bin2hex(random_bytes(16));
            $activation_token_hash = hash("sha256", $activation_token);
            $sql = "INSERT INTO user (firstName, lastName, email, password, role, account_activation_hash) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->firstName,
                $data->lastName,
                $data->email,
                $hashed_password,
                $data->role,
                $activation_token_hash
            ]);


            $this->registerRoleSpecificData($data);

            $this->pdo->commit();
            require __DIR__ . "../../src/Mailer.php";
            $mail = initializeMailer();

            $mail->setFrom("GCPractiPro@gcpractipro.online", "GCPractiProAdmin");
            $mail->addAddress($data->email);
            $mail->Subject = "Account Activation";
            $mail->Body = <<<END
            Click <a href="http://localhost:4200/activateaccount?token=$activation_token">here</a> to activate your account.

            END;

            try {
                $mail->send();
                return $this->sendPayload(null, "success", "Successfully sent activation email", 200);
            } catch (Exception $e) {
                $this->pdo->rollBack();
                $code = 400;
                return $this->sendPayload(null, "failed", $mail->ErrorInfo, $code);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->handleException($e);
        }
    }

    private function registerRoleSpecificData($data)
    {
        switch ($data->role) {
            case 'student':
                $this->registerStudent($data);
                break;
            case 'advisor':
                $this->registerAdvisor($data);
                break;
            case 'supervisor':
                $this->registerSupervisor($data);
                break;
            case 'admin':
                break;
            default:
                throw new Exception("Unknown role: " . $data->role);
        }
    }

    private function registerStudent($data)
    {
        $sql = "UPDATE students SET studentId = ?, program = ?, year = ? WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        try {
            $stmt->execute([
                $data->studentId,
                $data->program,
                $data->year,
                $data->email
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() == '23000') {
                throw new PDOException("The student ID is already in use.", 23002);
            } else {
                throw $e;
            }
        }
    }

    private function registerAdvisor($data)
    {
        $sql = "UPDATE coordinators SET department = ? WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data->department,
            $data->email
        ]);
    }

    private function registerSupervisor($data)
    {
        // Check if the company already exists
        $sql = "SELECT id FROM industry_partners WHERE company_name = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$data->company_name]);
        $company = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$company) {
            // If company doesn't exist, insert new company record
            $sql = "INSERT INTO industry_partners (company_name, address) VALUES (?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->company_name,
                $data->address
            ]);
            $company_id = $this->pdo->lastInsertId();
        } else {
            // If company exists, use its ID
            $company_id = $company['id'];
        }

        // Update supervisor table with company_id
        $sql = "UPDATE supervisors SET company_id = ?, position = ?, phone = ? WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $company_id,
            $data->position,
            $data->phone,
            $data->email
        ]);
    }

    private function handleException(PDOException $e)
    {
        if ($e->getCode() == '23002') {
            $errmsg = "The student ID is already in use.";
            $code = 409; // Conflict HTTP status code
        } elseif ($e->getCode() == '23000' && strpos($e->getMessage(), 'user.email') !== false) {
            $errmsg = "A user with this email already exists.";
            $code = 409; // Conflict HTTP status code
        } else {
            $errmsg = $e->getMessage();
            $code = 400; // Bad request HTTP status code
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }



    public function add_class($data)
    {
        $sql = "INSERT INTO class_blocks(block_name, course, year_level)
        VALUES (?, ? ,?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->block_name,
                    $data->course,
                    $data->year_level,
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function assignClassCoordinator($data)
    {
        $sql = "INSERT INTO rl_class_coordinators(coordinator_id, block_name)
        VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->coordinator_id,
                    $data->block_name
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
    public function assignClassToStudent($data, $id)
    {
        $sql = "UPDATE students SET block = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->block_name,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function edit_user($data, $id)
    {
        $sql = "UPDATE user SET role = ?, isActive = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->role,
                    $data->isActive,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
    public function edit_coordinator($data, $id)
    {
        $sql = "UPDATE coordinators SET department = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->department,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function edit_student_info($data, $id)
    {
        $sql = "UPDATE students SET firstName = ?, lastName = ?, studentId = ?, program = ?, year = ?, phoneNumber = ?, address = ?, dateOfBirth = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->firstName,
                    $data->lastName,
                    $data->studentId,
                    $data->program,
                    $data->year,
                    $data->phoneNumber,
                    $data->address,
                    $data->dateOfBirth,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function toggleSubmissionRemark($table, $submissionId, $newRemark)
    {
        $sql = "UPDATE $table SET remarks = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRemark, $submissionId]);
            return $this->sendPayload(null, "success", "Remark toggled successfully", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }


    public function addSubmissionComment($table, $submissionId, $data)
    {
        $sql = "INSERT INTO $table (comments, file_id, commenter) VALUES (?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->comments,
                    $submissionId,
                    $data->commenter
                ]
            );
            return $this->sendPayload(null, "success", "Successfully submitted comment", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function toggleStudentEvaluation($id, $newRemark)
    {

        $sql = "UPDATE students SET evaluation = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRemark, $id]);
            return $this->sendPayload(null, "success", "Remark toggled successfully", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }

    public function dtrClockIn($user_id)
    {
        // Check if there's an active clock-in record with no clock-out
        $checkSql = "SELECT COUNT(*) FROM student_dailytimerecords WHERE student_id = ? AND date = CURDATE() AND endTime IS NULL";
        try {
            $checkStmt = $this->pdo->prepare($checkSql);
            $checkStmt->execute([$user_id]);
            $count = $checkStmt->fetchColumn();

            if ($count > 0) {
                // If there's an active clock-in record, prevent a new clock-in
                return $this->sendPayload(null, "failed", "You already have an active clock-in. Please clock out first.", 400);
            }

            // If no active clock-in record, proceed with clock-in
            $sql = "INSERT INTO student_dailytimerecords (student_id, date, startTime) VALUES (?, CURDATE(), CURTIME())";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$user_id]);

            return $this->sendPayload(null, "success", "Clock-in successful", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 401);
        }
    }
    public function dtrClockOut($user_id)
    {
        $sql = "UPDATE student_dailytimerecords SET endTime = CURTIME() WHERE student_id = ? AND date = CURDATE() AND endTime IS NULL";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $user_id
                ]
            );

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, "success", "Clock-out successful", 200);
            } else {
                return $this->sendPayload(null, "failed", "No active clock-in found for today", 400);
            }
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 401);
        }
    }


    public function uploadFile($table, $user_id, $category = null)
    {
        if (!isset($_FILES["file"])) {
            return $this->sendPayload(null, "failed", "No file selected", 400);
        }
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        switch ($table) {
            case 'submissions':
                $sql = "INSERT INTO $table (user_id, submission_name, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
                try {
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute(
                        [
                            $user_id,
                            $category,
                            $fileName,
                            $fileType,
                            $fileSize,
                            $fileData
                        ]
                    );
                    return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
                } catch (PDOException $e) {
                    $errmsg = $e->getMessage();
                    $code = 400;
                    return $this->sendPayload(null, "failed", $errmsg, $code);
                }


            case 'documentations':
            case 'war':
                $sql = "INSERT INTO $table (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
                try {
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute(
                        [
                            $user_id,
                            $category,
                            $fileName,
                            $fileType,
                            $fileSize,
                            $fileData
                        ]
                    );
                    return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
                } catch (PDOException $e) {
                    $errmsg = $e->getMessage();
                    $code = 400;
                    return $this->sendPayload(null, "Failed uploading file", $errmsg, $code);
                }


            case 'finalreports':
                $sql = "INSERT INTO finalreports (user_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?)";
                try {
                    $stmt = $this->pdo->prepare($sql);
                    $stmt->execute(
                        [
                            $user_id,
                            $fileName,
                            $fileType,
                            $fileSize,
                            $fileData
                        ]
                    );
                    return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
                } catch (PDOException $e) {
                    $errmsg = $e->getMessage();
                    $code = 400;
                    return $this->sendPayload(null, "failed", $errmsg, $code);
                }


            default:
                return $this->sendPayload(null, "Failed", "Invalid category", 400);
        }
    }

    public function uploadStudentEvaluation($user_id, $student_id)
    {
        if (!isset($_FILES["file"])) {
            return $this->sendPayload(null, "failed", "No file selected", 400);
        }
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

        $sql = "INSERT INTO supervisor_student_evaluations (user_id, student_id, file_name, file_type, file_size, file_data)
         VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $user_id,
                    $student_id,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileData
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    // post.php

    public function uploadSeminarRecord($student_id, $data)
    {

        $sql = "INSERT INTO student_seminar_records (student_id, event_name, event_date, event_type, duration)
            VALUES (?, ?, ?, ?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $student_id,
                    $data->event_name,
                    $data->event_date,
                    $data->event_type,
                    $data->duration
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully uploaded record", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }

    public function uploadSeminarCertificate($id)
    {
        if (!isset($_FILES["file"])) {
            return $this->sendPayload(null, "failed", "No file selected", 400);
        }
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);

        $sql = "INSERT INTO student_seminar_certificates (record_id, file_name, file_type, file_size, file_data)
         VALUES (?, ?, ?, ?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $id,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileData
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function uploadAvatar($id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO user_avatars (user_id, avatar) VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $id,
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded avatar", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }

    public function uploadLogo($id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO company_logos (company_id, avatar) VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $id,
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded logo", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function addStudentToCompany($data)
    {
        $sql = "INSERT INTO rl_company_students(company_id, student_id, hired_by)
        VALUES (?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->company_id,
                    $data->student_id,
                    $data->supervisor_id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully added student to company", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }

    public function addStudentToSupervisor($data)
    {
        $existingAssignment = $this->checkExistingAssignment('rl_supervisor_students', 'supervisor_id', 'student_id', $data->supervisor_id, $data->student_id);
        if ($existingAssignment) {
            return $this->sendPayload(null, "failed", "Student is already assigned to the supervisor", 409);
        }

        $sql = "INSERT INTO rl_supervisor_students(supervisor_id, student_id)
            VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$data->supervisor_id, $data->student_id]);
            return $this->sendPayload(null, "success", "Successfully added student to supervisor selection", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }
    private function checkExistingAssignment($table, $condition1, $condition2, $id1, $id2)
    {
        $sql = "SELECT COUNT(*) AS assignment_count
            FROM $table
            WHERE $condition1 = ? AND $condition2 = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$id1, $id2]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['assignment_count'] > 0;
        } catch (PDOException $e) {
            return false;
        }
    }


    public function createHiringRequest($data)
    {
        $sql = "INSERT INTO company_hiring_requests(company_id, student_id, supervisor_id)
        VALUES (?, ?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->company_id,
                    $data->student_id,
                    $data->supervisor_id
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully created hiring request", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function assignJobToStudent($data)
    {
        $sql = "INSERT INTO student_jobs(student_id, assigned_by, job_title, job_description, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->student_id,
                    $data->supervisor_id,
                    $data->job_title,
                    $data->job_description,
                    $data->start_date,
                    $data->end_date
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully created job assignation", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }



    public function assignSchedulesToStudent($student, $schedules)
    {
        $sql = "INSERT INTO student_ojt_schedules (student_id, day_of_week, start_time, end_time, has_work)
            VALUES (?, ?, ?, ?, ?)";
        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare($sql);

            foreach ($schedules as $schedule) {
                $stmt->execute([
                    $student,
                    $schedule->day_of_week,
                    $schedule->start_time,
                    $schedule->end_time,
                    $schedule->has_work
                ]);
            }

            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully assigned schedules to student", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function updateDTRStatus($id, $data)
    {
        $sql = "UPDATE student_dailytimerecords SET status = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        try {
            $this->pdo->beginTransaction();
            $stmt->execute([
                $data->status,
                $id
            ]);
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully updated DTR.", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function updateSupervisorApproval($table, $id, $data)
    {
        $sql = "UPDATE $table SET supervisor_approval = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        try {
            $this->pdo->beginTransaction();
            $stmt->execute([
                $data->supervisor_approval,
                $id
            ]);
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully updated approval.", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }

    public function updateAdvisorApproval($table, $id, $data)
    {
        $sql = "UPDATE $table SET advisor_approval = ? WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        try {
            $this->pdo->beginTransaction();
            $stmt->execute([
                $data->advisor_approval,
                $id
            ]);
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully updated approval.", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }

    public function resetPasswordToken($data)
    {
        $sql = "SELECT email FROM user WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$data->email]);
        $email = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$email) {
            return $this->sendPayload(null, "failed", "Email not found.", 404);
        }

        $token = bin2hex(random_bytes(16));
        $token_hash = hash("sha256", $token);
        $expiry = date("Y-m-d H:i:s", time() + 60 * 30);
        $sql = "UPDATE user SET reset_token_hash = ?, reset_token_expires_at = ?
                WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        try {
            $this->pdo->beginTransaction();
            $stmt->execute([
                $token_hash,
                $expiry,
                $data->email
            ]);
            $this->pdo->commit();


            require __DIR__ . "../../src/Mailer.php";
            $mail = initializeMailer();

            $mail->setFrom("GCPractiPro@gcpractipro.online", "GCPractiProAdmin");
            $mail->addAddress($data->email);
            $mail->Subject = "Password Reset";
            $mail->Body = <<<END
            Click <a href="http://localhost:4200/resetpassword?token=$token">here</a> to reset your password.

            END;

            try {
                $mail->send();
                return $this->sendPayload(null, "success", "Successfully generated reset token.", 200);
            } catch (Exception $e) {
                $this->pdo->rollBack();
                $code = 400;
                return $this->sendPayload(null, "failed", $mail->ErrorInfo, $code);
            }


        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }

    public function resetPassword($data)
    {
        $this->pdo->beginTransaction();
        try {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
            $token_hash = hash("sha256", $data->token);

            $sql = "UPDATE user 
                    SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL  
                    WHERE reset_token_hash = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $hashed_password,
                $token_hash
            ]);
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully reset password", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->handleException($e);
        }
    }

    public function activateAccount($data)
    {
        $this->pdo->beginTransaction();
        try {
            $token_hash = hash("sha256", $data->token);

            $sql = "UPDATE user 
                    SET isActive = 1, account_activation_hash = NULL
                    WHERE account_activation_hash = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $token_hash
            ]);
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully activated account.", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->handleException($e);
        }
    }



    public function createClassJoinRequest($data)
    {
        // Check for existing join request
        $sqlCheck = "SELECT COUNT(*) FROM class_join_requests WHERE student_id = ?";
        $stmtCheck = $this->pdo->prepare($sqlCheck);
        $stmtCheck->execute([$data->student_id]);
        $existingRequest = $stmtCheck->fetchColumn();

        if ($existingRequest > 0) {
            return $this->sendPayload(null, "failed", "Join request already exists", 409);
        }

        // Insert new join request
        $sql = "INSERT INTO class_join_requests (student_id, class) VALUES (?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$data->student_id, $data->class]);
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully created join request", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, "failed", $e->getMessage(), 400);
        }
    }

    public function createClassInvitation($data)
    {
        // Check for existing join request
        $sqlCheck = "SELECT COUNT(*) FROM class_join_invitations WHERE student_id = ? AND class = ?";
        $stmtCheck = $this->pdo->prepare($sqlCheck);
        $stmtCheck->execute([$data->student_id, $data->class]);
        $existingRequest = $stmtCheck->fetchColumn();

        if ($existingRequest > 0) {
            return $this->sendPayload(null, "failed", "Join invitation already exists", 409);
        }

        $sql = "INSERT INTO class_join_invitations(student_id, advisor_id, class)
        VALUES (?, ?, ?)";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->student_id,
                    $data->advisor_id,
                    $data->class
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully created class invitation", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }



}





