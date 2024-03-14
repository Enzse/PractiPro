<?php
require_once "./config/database.php";

class GetPDF extends Connection {
    private $pdo;
    public function __construct(\PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function downloadPDF($submissionId) {
        // Fetch the PDF file data from the database
        $sql = "SELECT file_name, file_data FROM submissions WHERE submission_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$submissionId]);
        $result = $stmt->fetch();

        if ($result) {
            // Set appropriate headers for PDF file download
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $result['file_name'] . '"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . strlen($result['file_data']));

            // Output the PDF file data
            echo $result['file_data'];
            exit();
        } else {
            // Submission with the given ID not found
            echo "Submission not found";
            http_response_code(404);
            exit();
        }
    }
}

// Check if 'submission_id' parameter is set in the request
if (isset($_GET['submission_id'])) {
    $submissionId = $_GET['submission_id'];

    // Initialize GetPDF object
    $con = new Connection();
    $pdo = $con->connect();
    $getPDF = new GetPDF($pdo);

    // Call downloadPDF method with the submission ID to download the PDF file
    $getPDF->downloadPDF($submissionId);
} else {
    // 'submission_id' parameter not provided
    echo "Submission ID not provided";
    http_response_code(400);
}
?>
