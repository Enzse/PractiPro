<?php

declare(strict_types=1);

namespace PractiPro\Tests\Support;

use PractiPro\Support\Mailer;

/**
 * Records emails instead of sending them, and can be told to fail.
 */
final class FakeMailer implements Mailer
{
    /** @var list<array{to: string, subject: string, body: string}> */
    public array $sent = [];

    public bool $fail = false;

    public function send(string $to, string $subject, string $htmlBody): void
    {
        if ($this->fail) {
            throw new \RuntimeException('SMTP is down');
        }
        $this->sent[] = ['to' => $to, 'subject' => $subject, 'body' => $htmlBody];
    }

    /**
     * The token from the link in the most recent email.
     */
    public function lastToken(): string
    {
        $last = end($this->sent);
        if ($last === false || preg_match('/token=([a-f0-9]+)/', $last['body'], $m) !== 1) {
            throw new \LogicException('No email with a token was sent.');
        }

        return $m[1];
    }
}
