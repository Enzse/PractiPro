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
        $sql = "INSERT INTO user(firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)";
        try {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->firstName,
                $data->lastName,
                $data->email,
                $hashed_password,
                $data->role
            ]);

            switch ($data->role) {
                case 'student':
                    $sql = "UPDATE students SET studentId = ?, program = ?, year = ? WHERE email = ?";
                    try {
                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute([
                            $data->studentId,
                            $data->program,
                            $data->year,
                            $data->email
                        ]);
                        return $this->sendPayload(null, "success", "Successfully registered student", 200);
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                        return $this->sendPayload(null, "failed", $errmsg, $code);
                    }

                case 'advisor':
                    $sql = "UPDATE coordinators SET department = ? WHERE email = ?";
                    try {
                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute(
                            [
                                $data->department,
                                $data->email
                            ]
                        );
                        return $this->sendPayload(null, "success", "Successfully registered advisor", 200);
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                        return $this->sendPayload(null, "failed", $errmsg, $code);
                    }
                
                case 'supervisor':
                    $sql = "UPDATE supervisors SET company = ?, position = ?, phone = ? WHERE email = ?";
                    try {
                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute(
                            [
                                $data->company,
                                $data->position,
                                $data->phone,
                                $data->email
                            ]
                        );
                        return $this->sendPayload(null, "success", "Successfully registered supervisor", 200);
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                        return $this->sendPayload(null, "failed", $errmsg, $code);
                    }


                default:
                    return $this->sendPayload(null, "failed", "Unknown role: " . $data->role, 400);
            }

        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code); 
        }
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

    public function toggleSubmissionRemark($submissionId, $newRemark, $table)
    {
        $file_id = null;
        switch ($table) {
            case 'submissions':
                $file_id = 'submission_id';
                break;
            case 'documentations':
                $file_id = 'doc_id';
                break;
            case 'dtr':
                $file_id = 'dtr_id';
                break;
            case 'war':
                $file_id = 'war_id';
                break;
            case 'finalreports':
                $file_id = 'report_id';
                break;
            default:
                $file_id = 'id';
                break;

        }
        $sql = "UPDATE $table SET remarks = ? WHERE $file_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRemark, $submissionId]);
            return $this->sendPayload(null, "success", "Remark toggled successfully", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }
    public function addSubmissionComment($submissionId, $data, $table)
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
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function toggleStudentEvaluation($id, $newRemark, )
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


    public function upload_requirement($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO submissions (user_id, submission_name, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
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
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function upload_documentation($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO documentations (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
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
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function upload_dtr($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO dtr (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
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
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function upload_war($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO war (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
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
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function upload_finalReport($data)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO finalreports (user_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
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
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function uploadAvatar($id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "UPDATE students SET avatar = ? WHERE id = $id";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
}





