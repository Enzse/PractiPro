<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

final class AuthorizationTest extends ApiTestCase
{
    public function testRequestsWithoutATokenAreRejected(): void
    {
        $response = $this->call('GET', '/student');

        self::assertStatus(401, $response);
        self::assertSame('Bearer', $response->header('WWW-Authenticate'));
    }

    public function testForgedTokensAreRejected(): void
    {
        $token = $this->tokenFor($this->createUser('student'));
        [$header, , $signature] = explode('.', $token);
        $payload = rtrim(strtr(base64_encode((string) json_encode(['id' => 1, 'role' => 'superadmin', 'exp' => time() + 999])), '+/', '-_'), '=');

        self::assertStatus(401, $this->call('GET', '/user', token: "$header.$payload.$signature"));
    }

    public function testStudentsCannotCallAdminEndpoints(): void
    {
        $student = $this->tokenFor($this->createUser('student'));

        self::assertStatus(403, $this->call('GET', '/user', token: $student));
        self::assertStatus(403, $this->call('DELETE', '/deleteuser/1', token: $student));
    }

    public function testStudentsOnlySeeTheirOwnRecords(): void
    {
        $ana = $this->createUser('student');
        $ben = $this->createUser('student');
        $token = $this->tokenFor($ana);

        self::assertStatus(200, $this->call('GET', "/getdtr/$ana", token: $token));
        self::assertStatus(403, $this->call('GET', "/getdtr/$ben", token: $token));
        self::assertStatus(403, $this->call('GET', "/student/$ben", token: $token));
        self::assertStatus(403, $this->call('POST', "/dtrclockin/$ben", token: $token));
    }

    public function testUserDetailsNeverIncludePasswordHashes(): void
    {
        $admin = $this->createUser('admin');

        $users = self::payload($this->call('GET', '/user', token: $this->tokenFor($admin)));

        self::assertNotEmpty($users);
        foreach ($users as $user) {
            self::assertArrayNotHasKey('password', $user);
            self::assertArrayNotHasKey('reset_token_hash', $user);
        }
    }

    public function testCoordinatorsOnlySeeTheirOwnClasses(): void
    {
        $advisor = $this->createUser('advisor');
        $this->db()->execute("INSERT INTO class_blocks (block_name, course, year_level) VALUES ('MINE-1', 'BSCS', 1), ('OTHER-1', 'BSCS', 1)");
        $this->db()->execute("INSERT INTO rl_class_coordinators (coordinator_id, block_name) VALUES (?, 'MINE-1')", [$advisor]);
        $token = $this->tokenFor($advisor);

        self::assertStatus(200, $this->call('GET', '/getfinalreportsanalytics/MINE-1', token: $token));
        self::assertStatus(403, $this->call('GET', '/getfinalreportsanalytics/OTHER-1', token: $token));
    }

    public function testSupervisorsActOnlyAsThemselves(): void
    {
        $supervisor = $this->createUser('supervisor');
        $otherSupervisor = $this->createUser('supervisor');
        $student = $this->createUser('student');

        $response = $this->call('POST', '/addstudenttosupervisor', [
            'supervisor_id' => $otherSupervisor, 'student_id' => $student,
        ], $this->tokenFor($supervisor));

        self::assertStatus(403, $response);
    }

    public function testStudentsCanOnlyJoinACompanyThatOfferedThemAPlace(): void
    {
        $student = $this->createUser('student');
        $supervisor = $this->createUser('supervisor');
        $companyId = $this->db()->insert("INSERT INTO industry_partners (company_name) VALUES ('Acme')");

        $response = $this->call('POST', '/addstudenttocompany', [
            'company_id' => $companyId, 'student_id' => $student, 'supervisor_id' => $supervisor,
        ], $this->tokenFor($student));

        self::assertStatus(403, $response);
    }

    public function testCommentsAreAttributedToTheLoggedInUser(): void
    {
        $student = $this->createUser('student', firstName: 'Ana', lastName: 'Reyes');
        $submissionId = $this->db()->insert("INSERT INTO submissions (user_id, submission_name, file_name) VALUES (?, 'Resume', 'cv.pdf')", [$student]);

        $this->call('POST', "/submission-comment/comments_requirements/$submissionId", [
            'comments' => 'Uploaded the signed copy.', 'commenter' => 'The Dean',
        ], $this->tokenFor($student));

        $comments = self::payload($this->call('GET', "/submission-comments/comments_requirements/$submissionId", token: $this->tokenFor($student)));
        self::assertSame('Ana Reyes', $comments[0]['commenter']);
    }

    public function testWeeklyReportApprovalsCannotBeSetByTheStudent(): void
    {
        $student = $this->createUser('student');
        $recordId = $this->db()->insert('INSERT INTO student_war_records (user_id, week) VALUES (?, 1)', [$student]);

        $this->call('POST', '/warrecordsubmission', ['id' => $recordId, 'isSubmitted' => 1, 'status' => 'Approved'], $this->tokenFor($student));

        $record = $this->db()->fetchOne('SELECT supervisor_approval, advisor_approval FROM student_war_records WHERE id = ?', [$recordId]);
        self::assertSame(['supervisor_approval' => 'Pending', 'advisor_approval' => 'Pending'], $record);
    }
}
