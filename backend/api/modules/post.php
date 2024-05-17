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

    public function add_user($data)
    {
        $sql = "INSERT INTO user(firstName, lastName, email, password)
        VALUES (?, ?, ? ,?)";
        try {
            //hash the password.
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->firstName,
                    $data->lastName,
                    $data->email,
                    $hashed_password
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
        $sql = "UPDATE students SET firstName = ?, lastName = ?, studentId = ?, program = ?, block = ?, year = ?, email = ?, phoneNumber = ?, address = ?, dateOfBirth = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->firstName,
                    $data->lastName,
                    $data->studentId,
                    $data->program,
                    $data->block,
                    $data->year,
                    $data->email,
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





