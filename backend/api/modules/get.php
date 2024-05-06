<?php

require_once 'global.php';

class Get extends GlobalMethods
{
    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }


    //naghahandle ng sql statements
    private function get_records($table, $conditions = null)
    {
        $sqlStr = "SELECT * FROM $table";
        if ($conditions != null) {
            $sqlStr = $sqlStr . " WHERE " . $conditions;
        }
        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            // Check if the table contains BLOB data
            if ($table == 'submissions' && isset($result['data'][0]['file_data'])) {
                return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code'], true);
            } else {
                return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
            }
        }
        return $this->sendPayload(null, 'failed', "Failed to retrieve data.", $result['code']);
    }

    //nageexecute ng query
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

    /**
     * Retrieve a list of employees.
     *
     * @return string
     *   A string representing the list of employees.
     */

    public function getByEmail(string $email = null): array|false
    {
        // $condition = null;
        // if ($email != null) {
        //     $condition = "email='$email'";
        // }
        // return $this->get_records('user', $condition);
        // $sql = 'SELECT * FROM user WHERE email = :email';

        // $stmt = $this->conn->prepare($sql);
        // $stmt->bindValue(':email', $email, PDO::PARAM_STR);

        // $stmt->execute();

        // return $stmt->fetch(PDO::FETCH_ASSOC);
        $condition = ($email !== null) ? "email = '$email'" : null;
        $result = $this->get_records('user', $condition);

        if ($result['status']['remarks'] === 'success' && !empty($result['payload'])) {
            return $result['payload'][0]; // Return the first user record
        } else {
            return false; // Return false if no user found
        }
    }
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
    /**
     * Retrieve a list of jobs.
     *
     * @return string
     *   A string representing the list of jobs.
     */
    public function get_roles($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "id=$id";
        }
        return $this->get_records('role', $condition);
    }


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
    public function get_student($userId = null)
    {
        $condition = ($userId !== null) ? "id = $userId" : null;
        $result = $this->get_records('students', $condition);

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

    public function get_submission($id = null)
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

    public function get_file_data($id = null)
    {
        $condition = null;
        if ($id != null) {
            $condition = "submission_id=$id";
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

}
