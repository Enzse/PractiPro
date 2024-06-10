<?php

require_once 'global.php';

class Delete extends GlobalMethods
{

    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function delete_user($id)
    {
        $sql = "DELETE FROM user WHERE id = ?";
        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $id
                ]
            );
            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully deleted record", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function unassignCoordinatorFromClass($id, $class)
    {
        $sql = "DELETE FROM rl_class_coordinators
                WHERE coordinator_id = :coordinator_id AND block_name = :block_name";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':coordinator_id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':block_name', $class, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $this->pdo->commit();
                return $this->sendPayload(null, 'success', "Successfully deleted the class assignment.", 200);
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "No class assignment found for the provided coordinator ID and block name.", 404);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function deleteSubmission($id, $table)
    {
        $sql = "DELETE FROM $table
                WHERE id = :id";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully deleted record", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function removeStudentFromCompany($company_id, $student_id)
    {
        $sql = "DELETE FROM rl_company_students
                WHERE company_id = :company_id AND student_id = :student_id";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':company_id', $company_id, PDO::PARAM_INT);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $this->pdo->commit();
                return $this->sendPayload(null, 'success', "Successfully removed student from company.", 200);
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "No student found from company", 404);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function removeStudentFromSupervisor($supervisor_id, $student_id)
    {
        $sql = "DELETE FROM rl_supervisor_students
                WHERE supervisor_id = :supervisor_id AND student_id = :student_id";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':supervisor_id', $supervisor_id, PDO::PARAM_INT);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $this->pdo->commit();
                return $this->sendPayload(null, 'success', "Successfully removed student from supervisor selection.", 200);
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "No student found from supervisor selection", 404);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function deleteHiringRequest($id)
    {
        $sql = "DELETE FROM company_hiring_requests
                WHERE id = :request_id";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':request_id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $this->pdo->commit();
                return $this->sendPayload(null, 'success', "Successfully deleted hiring request.", 200);
            } else {
                $this->pdo->rollBack();
                return $this->sendPayload(null, 'failed', "No hiring request found", 404);
            }
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

    public function deleteAvatar($id)
    {
        $sql = "DELETE FROM user_avatars
                WHERE user_id = :id";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully deleted avatar", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
    public function deleteLogo($id)
    {
        $sql = "DELETE FROM company_logos
                WHERE company_id = :id";

        try {
            $this->pdo->beginTransaction();
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $this->pdo->commit();
            return $this->sendPayload(null, "success", "Successfully deleted logo", 200);
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }
}