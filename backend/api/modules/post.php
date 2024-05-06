<?php

require_once 'global.php';

class Post extends GlobalMethods
{

    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function add_record()
    {

    }

    /**
     * Add a new employee with the provided data.
     *
     * @param array|object $data
     *   The data representing the new employee.
     *
     * @return array|object
     *   The added employee data.
     */

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


    public function delete_user($id)
    {
        $sql = "DELETE FROM user WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully deleted record", 200);
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


    public function upload_file($data, $category)
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



}


