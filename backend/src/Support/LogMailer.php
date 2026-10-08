<?php

declare(strict_types=1);

namespace PractiPro\Support;

/**
 * Development mailer used when no SMTP account is configured: writes each
 * email to the PHP error log (XAMPP: apache/logs/error.log) instead of sending it,
 * so activation and reset links can still be followed locally.
 */
final class LogMailer implements Mailer
{
    public function send(string $to, string $subject, string $htmlBody): void
    {
        error_log(sprintf("[PractiPro mail] To: %s | Subject: %s | %s", $to, $subject, strip_tags($htmlBody, '<a>')));
    }
}
