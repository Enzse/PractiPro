<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

/**
 * Self-registered coordinators and supervisors need an admin's approval
 * before they can log in.
 */
final class ApprovalTest extends ApiTestCase
{
    private const ADVISOR = [
        'firstName' => 'Carla', 'lastName' => 'Santos', 'email' => 'carla@practipro.test',
        'password' => 'Secret123', 'role' => 'advisor', 'department' => 'CCS',
    ];

    public function testASelfRegisteredCoordinatorWaitsForApproval(): void
    {
        self::assertStatus(200, $this->call('POST', '/registeruser', self::ADVISOR));
        $activation = $this->call('POST', '/activateaccount', ['token' => $this->mailer->lastToken()]);
        self::assertTrue(self::payload($activation)['awaitingApproval']);

        $login = ['email' => 'carla@practipro.test', 'password' => 'Secret123'];
        $refused = $this->call('POST', '/login', $login);
        self::assertStatus(403, $refused);
        self::assertStringContainsString('approval', $refused->decoded()['status']['message']);

        $advisorId = (int) $this->db()->fetchValue("SELECT id FROM user WHERE email = 'carla@practipro.test'");
        $admin = $this->createUser('admin');
        self::assertStatus(200, $this->call('POST', "/approveuser/$advisorId", token: $this->tokenFor($admin)));

        self::assertStatus(200, $this->call('POST', '/login', $login));
        self::assertSame($admin, (int) $this->db()->fetchValue('SELECT approved_by FROM user WHERE id = ?', [$advisorId]));
    }

    public function testStudentsDoNotNeedApproval(): void
    {
        $this->call('POST', '/registeruser', [
            'firstName' => 'Ben', 'lastName' => 'Cruz', 'email' => 'ben@practipro.test', 'password' => 'Secret123',
            'role' => 'student', 'studentId' => '202400001', 'program' => 'BSCS', 'year' => 3,
        ]);
        $this->call('POST', '/activateaccount', ['token' => $this->mailer->lastToken()]);

        self::assertStatus(200, $this->call('POST', '/login', ['email' => 'ben@practipro.test', 'password' => 'Secret123']));
    }

    public function testAccountsCreatedByAnAdminAreApprovedAlready(): void
    {
        $admin = $this->createUser('admin');
        $this->call('POST', '/registeruser', self::ADVISOR, $this->tokenFor($admin));
        $this->call('POST', '/activateaccount', ['token' => $this->mailer->lastToken()]);

        self::assertStatus(200, $this->call('POST', '/login', ['email' => 'carla@practipro.test', 'password' => 'Secret123']));
    }

    public function testOnlyAdminsCanApprove(): void
    {
        $this->call('POST', '/registeruser', self::ADVISOR);
        $advisorId = (int) $this->db()->fetchValue("SELECT id FROM user WHERE email = 'carla@practipro.test'");

        $response = $this->call('POST', "/approveuser/$advisorId", token: $this->tokenFor($this->createUser('advisor')));

        self::assertStatus(403, $response);
        self::assertNull($this->db()->fetchValue('SELECT approved_at FROM user WHERE id = ?', [$advisorId]));
    }
}
