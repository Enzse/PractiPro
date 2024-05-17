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


    public function unassignCoordinatorFromClass($id, $class)
    {
        $sql = "DELETE FROM rl_class_coordinators
                WHERE coordinator_id = :coordinator_id AND block_name = :block_name";
    
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':coordinator_id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':block_name', $class, PDO::PARAM_STR);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, 'success', "Successfully deleted the class assignment.", 200);
            } else {
                return $this->sendPayload(null, 'failed', "No class assignment found for the provided coordinator ID and block name.", 404);
            }
        } catch (PDOException $e) {
            return $this->sendPayload(null, 'failed', $e->getMessage(), 500);
        }
    }

}