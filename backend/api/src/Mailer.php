<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . "/../../vendor/autoload.php";

function initializeMailer() {
    $mail = new PHPMailer(true);
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->SMTPAuth = true;
    $mail->Host = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = (int) ($_ENV['MAIL_PORT'] ?? 587);
    $mail->Username = $_ENV['MAIL_USERNAME'] ?? '';
    $mail->Password = $_ENV['MAIL_PASSWORD'] ?? '';
    $mail->setFrom($_ENV['MAIL_FROM_ADDRESS'] ?? $mail->Username, $_ENV['MAIL_FROM_NAME'] ?? 'PractiPro');
    $mail->isHTML(true);
    return $mail;
}
