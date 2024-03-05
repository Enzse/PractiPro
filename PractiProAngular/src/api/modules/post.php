<?php

/**
 * Post Class
 *
 * This PHP class provides methods for adding employees and jobs.
 *
 * Usage:
 * 1. Include this class in your project.
 * 2. Create an instance of the class to access the provided methods.
 * 3. Call the appropriate method to add new employees or jobs with the provided data.
 *
 * Example Usage:
 * ```
 * $post = new Post();
 * $employeeData = ... // prepare employee data as an associative array or object
 * $addedEmployee = $post->add_employees($employeeData);
 *
 * $jobData = ... // prepare job data as an associative array or object
 * $addedJob = $post->add_jobs($jobData);
 * ```
 *
 * Note: Customize the methods as needed to handle the addition of data to your actual data source (e.g., database, API).
 */

require_once "global.php"; 

class Post extends GlobalMethods{
    private $pdo;

    public function __construct(\PDO $pdo){
        $this->pdo = $pdo;
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
    public function add_employees($data){
        $sql = "INSERT INTO employees(EMPLOYEE_ID,FIRST_NAME,
        LAST_NAME,EMAIL,PHONE_NUMBER,HIRE_DATE,JOB_ID,SALARY,DEPARTMENT_ID) 
        VALUES (?,?,?,?,?,?,?,?,?)";
        try{
            $statement = $this->pdo->prepare($sql);
            $statement->execute(
                [
                    $data->EMPLOYEE_ID,
                    $data->FIRST_NAME,
                    $data->LAST_NAME,
                    $data->EMAIL,
                    $data->PHONE_NUMBER,
                    $data->HIRE_DATE,
                    $data->JOB_ID,
                    $data->SALARY,
                    $data->DEPARTMENT_ID
                  
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record.", 200);
    
        }
        catch(\PDOException $e){
            $errmsg = $e->getMessage();
            $code = 400;
        }
       
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function edit_employee($data, $id){
        $sql = "UPDATE employees SET EMAIL=? WHERE EMPLOYEE_ID = ?";
        try{
            $statement = $this->pdo->prepare($sql);
            $statement->execute(
                [
                  $data->EMAIL,
                  $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record.", 200);
    
        }
        catch(\PDOException $e){
            $errmsg = $e->getMessage();
            $code = 400;
        }
       
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function delete_employee($id){
        $sql = "DELETE FROM employees WHERE EMPLOYEE_ID = ?";
        try{
            $statement = $this->pdo->prepare($sql);
            $statement->execute(
                [
                  $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully deleted record.", 200);
    
        }
        catch(\PDOException $e){
            $errmsg = $e->getMessage();
            $code = 400;
        }
       
        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
   

    /**
     * Add a new job with the provided data.
     *
     * @param array|object $data
     *   The data representing the new job.
     *
     * @return array|object
     *   The added job data.
     */
    public function add_jobs($data){
        $sql = "INSERT INTO jobs(EMPLOYEE_ID,FIRST_NAME,
        LAST_NAME,EMAIL,PHONE_NUMBER,HIRE_DATE,JOB_ID,SALARY,DEPARTMENT_ID) 
        VALUES (?,?,?,?,?,?,?,?,?)";
        try{
            $statement = $this->pdo->prepare($sql);
            $statement->execute(
                [
                    $data->EMPLOYEE_ID,
                    $data->FIRST_NAME,
                    $data->LAST_NAME,
                    $data->EMAIL,
                    $data->PHONE_NUMBER,
                    $data->HIRE_DATE,
                    $data->JOB_ID,
                    $data->SALARY,
                    $data->DEPARTMENT_ID
                  
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record.", 200);
    
        }
        catch(\PDOException $e){
            $errmsg = $e->getMessage();
            $code = 400;
        }
       
        return $this->sendPayload(null, "failed", $errmsg, 200);
    }
}
