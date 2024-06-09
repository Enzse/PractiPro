<?php

require_once 'global.php';

class Post extends GlobalMethods
{

    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }



    public function doesEmailExist($email)
    {
        $sql = "SELECT email FROM user WHERE email = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result; // Return email or null
        } catch (PDOException $e) {
            // Handle database error
            return array();
        }
    }

    public function registerUser($data)
    {
        $this->pdo->beginTransaction();
        try {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO user (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->firstName,
                $data->lastName,
                $data->email,
                $hashed_password,
                $data->role
            ]);

            $this->registerRoleSpecificData($data);

            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully registered user", 200);
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
                // No additional data to register for admin
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
        $sql = "INSERT INTO industry_partners (company_name, address) VALUES (?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data->company_name,
            $data->address
        ]);
        $company_id = $this->pdo->lastInsertId();

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





    public function addOjtSite($student_id, $data)
    {
        $sql = "INSERT INTO ojt_sites(student_id, company_name, address, job_title, job_description, supervisor_name, supervisor_email, supervisor_phone)
        VALUES (?, ?, ? ,?, ?, ?, ?, ?)";
        try {

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $student_id,
                    $data->company_name,
                    $data->address,
                    $data->job_title,
                    $data->job_description,
                    $data->supervisor_name,
                    $data->supervisor_email,
                    $data->supervisor_phone,
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function add_class($data)
    {
        $sql = "INSERT INTO class_blocks(block_name, department, course, year_level)
        VALUES (?, ?, ? ,?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->block_name,
                    $data->department,
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
    public function assignClassStudent($data, $id)
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


    public function toggleRequirementStatus($studentId, $requirement, $status)
    {
        $sql = "UPDATE student_requirements SET $requirement = ? WHERE student_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$status, $studentId]);
            return $this->sendPayload(null, "success", "Successfully updated requirement status", 200);
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
        $sql = "INSERT INTO rl_supervisor_students(supervisor_id, student_id)
        VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->supervisor_id,
                    $data->student_id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully added student to supervisor selection", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
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



}





