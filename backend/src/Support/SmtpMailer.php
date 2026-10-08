<?php

declare(strict_types=1);

namespace PractiPro\Support;

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;
use PractiPro\Config;

final class SmtpMailer implements Mailer
{
    public function __construct(private readonly Config $config)
    {
    }

    public function send(string $to, string $subject, string $htmlBody): void
    {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->SMTPAuth = true;
            $mail->Host = $this->config->mailHost;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->config->mailPort;
            $mail->Username = $this->config->mailUsername;
            $mail->Password = $this->config->mailPassword;
            $mail->setFrom($this->config->mailFromAddress ?: $this->config->mailUsername, $this->config->mailFromName);
            $mail->isHTML(true);
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->send();
        } catch (PHPMailerException $e) {
            throw new \RuntimeException('Could not send email: ' . $mail->ErrorInfo, 0, $e);
        }
    }
}
