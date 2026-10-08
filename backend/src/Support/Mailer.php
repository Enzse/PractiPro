<?php

declare(strict_types=1);

namespace PractiPro\Support;

interface Mailer
{
    /**
     * @throws \RuntimeException If the message could not be sent.
     */
    public function send(string $to, string $subject, string $htmlBody): void;
}
