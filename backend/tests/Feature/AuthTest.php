<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

final class AuthTest extends ApiTestCase
{
    public function testLoginReturnsATokenForTheUser(): void
    {
        $id = $this->createUser('student', 'ana@practipro.test');

        $response = $this->call('POST', '/login', ['email' => 'ana@practipro.test', 'password' => self::PASSWORD]);

        self::assertStatus(200, $response);
        $token = $response->decoded()['token'];
        self::assertStatus(200, $this->call('GET', "/student/$id", token: $token));
    }

    public function testWrongPasswordAndUnknownEmailGetTheSameResponse(): void
    {
        $this->createUser('student', 'ana@practipro.test');

        $wrongPassword = $this->call('POST', '/login', ['email' => 'ana@practipro.test', 'password' => 'Nope12345']);
        $unknownEmail = $this->call('POST', '/login', ['email' => 'nobody@practipro.test', 'password' => 'Nope12345']);

        self::assertStatus(401, $wrongPassword);
        self::assertStatus(401, $unknownEmail);
        self::assertSame(self::payload($wrongPassword), self::payload($unknownEmail));
        self::assertSame($wrongPassword->decoded()['status'], $unknownEmail->decoded()['status']);
    }

    public function testInactiveAccountsCannotLogIn(): void
    {
        $id = $this->createUser('student', 'ana@practipro.test');
        $this->db()->execute('UPDATE user SET isActive = 0 WHERE id = ?', [$id]);

        self::assertStatus(403, $this->call('POST', '/login', ['email' => 'ana@practipro.test', 'password' => self::PASSWORD]));
    }

    public function testRegistrationEmailsAnActivationLinkThatActivatesTheAccount(): void
    {
        $response = $this->call('POST', '/registeruser', [
            'firstName' => 'Ben', 'lastName' => 'Cruz', 'email' => 'ben@practipro.test', 'password' => 'Secret123',
            'role' => 'student', 'studentId' => '202400001', 'program' => 'BSCS', 'year' => 3,
        ]);

        self::assertStatus(200, $response);
        self::assertSame('ben@practipro.test', $this->mailer->sent[0]['to']);
        self::assertSame('202400001', (string) $this->db()->fetchValue("SELECT studentId FROM students WHERE email = 'ben@practipro.test'"));

        $login = ['email' => 'ben@practipro.test', 'password' => 'Secret123'];
        self::assertStatus(403, $this->call('POST', '/login', $login));
        self::assertStatus(200, $this->call('POST', '/activateaccount', ['token' => $this->mailer->lastToken()]));
        self::assertStatus(200, $this->call('POST', '/login', $login));
    }

    public function testNobodyCanSelfRegisterAsAnAdmin(): void
    {
        $response = $this->call('POST', '/registeruser', [
            'firstName' => 'Eve', 'lastName' => 'X', 'email' => 'eve@practipro.test', 'password' => 'Secret123', 'role' => 'admin',
        ]);

        self::assertStatus(403, $response);
        self::assertFalse((bool) $this->db()->fetchValue("SELECT COUNT(*) FROM user WHERE email = 'eve@practipro.test'"));
    }

    public function testAnAdminCanCreateAnotherAdmin(): void
    {
        $admin = $this->createUser('admin');

        $response = $this->call('POST', '/registeruser', [
            'firstName' => 'New', 'lastName' => 'Admin', 'email' => 'new.admin@practipro.test', 'password' => 'Secret123', 'role' => 'admin',
        ], $this->tokenFor($admin));

        self::assertStatus(200, $response);
    }

    public function testRegistrationRequiresAStrongPassword(): void
    {
        $response = $this->call('POST', '/registeruser', [
            'firstName' => 'Ben', 'lastName' => 'Cruz', 'email' => 'ben@practipro.test', 'password' => 'password',
            'role' => 'advisor', 'department' => 'CCS',
        ]);

        self::assertStatus(422, $response);
    }

    public function testDuplicateEmailIsAConflict(): void
    {
        $this->createUser('advisor', 'taken@practipro.test');

        $response = $this->call('POST', '/registeruser', [
            'firstName' => 'Ben', 'lastName' => 'Cruz', 'email' => 'taken@practipro.test', 'password' => 'Secret123',
            'role' => 'advisor', 'department' => 'CCS',
        ]);

        self::assertStatus(409, $response);
    }

    public function testRegistrationIsUndoneIfTheEmailCannotBeSent(): void
    {
        $this->mailer->fail = true;

        $response = $this->call('POST', '/registeruser', [
            'firstName' => 'Ben', 'lastName' => 'Cruz', 'email' => 'ben@practipro.test', 'password' => 'Secret123',
            'role' => 'advisor', 'department' => 'CCS',
        ]);

        self::assertStatus(502, $response);
        self::assertFalse((bool) $this->db()->fetchValue("SELECT COUNT(*) FROM user WHERE email = 'ben@practipro.test'"));
    }

    public function testPasswordResetWorksOnceAndOnlyWithAValidToken(): void
    {
        $this->createUser('student', 'ana@practipro.test');

        self::assertStatus(200, $this->call('POST', '/resetpasswordtoken', ['email' => 'ana@practipro.test']));
        $token = $this->mailer->lastToken();

        self::assertStatus(400, $this->call('POST', '/resetpassword', ['token' => 'wrong-token', 'password' => 'NewSecret1']));
        self::assertStatus(200, $this->call('POST', '/resetpassword', ['token' => $token, 'password' => 'NewSecret1']));
        self::assertStatus(400, $this->call('POST', '/resetpassword', ['token' => $token, 'password' => 'Another1x']));
        self::assertStatus(200, $this->call('POST', '/login', ['email' => 'ana@practipro.test', 'password' => 'NewSecret1']));
    }

    public function testExpiredResetTokensAreRejected(): void
    {
        $this->createUser('student', 'ana@practipro.test');
        $this->call('POST', '/resetpasswordtoken', ['email' => 'ana@practipro.test']);
        $token = $this->mailer->lastToken();
        $this->db()->execute("UPDATE user SET reset_token_expires_at = NOW() - INTERVAL 1 MINUTE WHERE email = 'ana@practipro.test'");

        self::assertStatus(401, $this->call('GET', "/getresettoken/$token"));
        self::assertStatus(400, $this->call('POST', '/resetpassword', ['token' => $token, 'password' => 'NewSecret1']));
    }
}
