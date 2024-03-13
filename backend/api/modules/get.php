<?php
/**
 * Get Class
 *
 * This PHP class provides methods for retrieving data related to employees and jobs.
 *
 * Usage:
 * 1. Include this class in your project.
 * 2. Create an instance of the class to access the provided methods.
 * 3. Call the appropriate method to retrieve the desired data.
 *
 * Example Usage:
 * ```
 * $get = new Get();
 * $employeesData = $get->get_employees();
 * $jobsData = $get->get_jobs();
 * ```
 *
 * Note: Customize the methods as needed to fetch data from your actual data source (e.g., database, API).
 */

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
            return $this->sendPayload($result['data'], 'success', "Successfully retrieved data.", $result['code']);
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
            if ($result = $this->pdo->query($sql)->fetchAll()) {
                foreach ($result as $record) {
                    array_push($data, $record);
                }
                $code = 200;
                $result = null;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found.";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsh = $e->getMessage();
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

    /**
     * Retrieve a list of jobs.
     *
     * @return string
     *   A string representing the list of jobs.
     */
    public function get_jobs()
    {
        return $this->get_records('jobs');
    }
}
