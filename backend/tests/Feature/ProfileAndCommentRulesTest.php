<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

/**
 * Rules that used to live in database triggers: profile rows for accounts,
 * and comment counts on commented records.
 */
final class ProfileAndCommentRulesTest extends ApiTestCase
{
    public function testTheDatabaseHasNoTriggersLeft(): void
    {
        self::assertSame(0, (int) $this->db()->fetchValue('SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = DATABASE()'));
    }

    public function testEachRoleGetsItsProfileRow(): void
    {
        $student = $this->createUser('student', 'ana@practipro.test', 'Ana', 'Reyes');
        $advisor = $this->createUser('advisor', 'ben@practipro.test', 'Ben', 'Cruz');
        $supervisor = $this->createUser('supervisor', 'cy@practipro.test', 'Cy', 'Lim');
        $admin = $this->createUser('admin');

        self::assertSame(['firstName' => 'Ana', 'email' => 'ana@practipro.test'], $this->db()->fetchOne('SELECT firstName, email FROM students WHERE id = ?', [$student]));
        self::assertSame('Ben', $this->db()->fetchValue('SELECT first_name FROM coordinators WHERE id = ?', [$advisor]));
        self::assertSame('Cy', $this->db()->fetchValue('SELECT firstName FROM supervisors WHERE id = ?', [$supervisor]));
        foreach (['students', 'coordinators', 'supervisors'] as $table) {
            self::assertFalse((bool) $this->db()->fetchValue("SELECT COUNT(*) FROM $table WHERE id = ?", [$admin]));
        }
    }

    public function testRegistrationCreatesTheProfile(): void
    {
        $this->call('POST', '/registeruser', [
            'firstName' => 'Dee', 'lastName' => 'Uy', 'email' => 'dee@practipro.test', 'password' => 'Secret123',
            'role' => 'student', 'studentId' => '202400002', 'program' => 'BSIT', 'year' => 2,
        ]);

        self::assertSame(['studentId' => 202400002, 'program' => 'BSIT'], $this->db()->fetchOne(
            "SELECT studentId, program FROM students WHERE email = 'dee@practipro.test'",
        ));
    }

    public function testChangingRoleMovesTheProfile(): void
    {
        $id = $this->createUser('advisor');
        $admin = $this->tokenFor($this->createUser('superadmin'));

        self::assertStatus(200, $this->call('POST', "/edituser/$id", ['role' => 'supervisor', 'isActive' => 1], $admin));
        self::assertFalse((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM coordinators WHERE id = ?', [$id]));
        self::assertTrue((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM supervisors WHERE id = ?', [$id]));
    }

    public function testAStudentWithoutRecordsCanChangeRoleAndBack(): void
    {
        $id = $this->createUser('student');
        $admin = $this->tokenFor($this->createUser('superadmin'));

        self::assertStatus(200, $this->call('POST', "/edituser/$id", ['role' => 'advisor', 'isActive' => 1], $admin));
        self::assertFalse((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM students WHERE id = ?', [$id]));
        self::assertStatus(200, $this->call('POST', "/edituser/$id", ['role' => 'student', 'isActive' => 1], $admin));

        self::assertTrue((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM students WHERE id = ?', [$id]));
        self::assertFalse((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM coordinators WHERE id = ?', [$id]));
    }

    public function testAStudentWithPracticumRecordsKeepsTheirRole(): void
    {
        $id = $this->createUser('student');
        $this->db()->execute("INSERT INTO student_dailytimerecords (student_id, date, startTime) VALUES (?, CURDATE(), '08:00')", [$id]);
        $admin = $this->tokenFor($this->createUser('superadmin'));

        self::assertStatus(409, $this->call('POST', "/edituser/$id", ['role' => 'advisor', 'isActive' => 1], $admin));

        self::assertSame('student', $this->db()->fetchValue('SELECT role FROM user WHERE id = ?', [$id]));
        self::assertTrue((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM students WHERE id = ?', [$id]));
        self::assertFalse((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM coordinators WHERE id = ?', [$id]));
    }

    public function testCommentingUpdatesTheRecordsCommentCount(): void
    {
        $student = $this->createUser('student');
        $token = $this->tokenFor($student);
        $submission = $this->db()->insert("INSERT INTO submissions (user_id, submission_name, file_name) VALUES (?, 'Resume', 'cv.pdf')", [$student]);

        $this->call('POST', "/submission-comment/comments_requirements/$submission", ['comments' => 'First'], $token);
        $this->call('POST', "/submission-comment/comments_requirements/$submission", ['comments' => 'Second'], $token);

        self::assertSame(2, (int) $this->db()->fetchValue('SELECT comments FROM submissions WHERE id = ?', [$submission]));
    }

    public function testFinalReportCommentsBelongToTheUploadedFile(): void
    {
        $student = $this->createUser('student');
        $file = $this->db()->insert("INSERT INTO finalreports (user_id, file_name) VALUES (?, 'report.pdf')", [$student]);

        $response = $this->call('POST', "/submission-comment/comments_finalreports/$file", ['comments' => 'Looks good'], $this->tokenFor($student));

        self::assertStatus(200, $response);
        self::assertSame(1, (int) $this->db()->fetchValue('SELECT comments FROM finalreports WHERE id = ?', [$file]));
    }

    public function testUploadingACertificateMarksTheSeminarCertified(): void
    {
        $student = $this->createUser('student');
        $record = $this->db()->insert(
            "INSERT INTO student_seminar_records (student_id, event_name, event_date, event_type, duration) VALUES (?, 'Cybersecurity 101', CURDATE(), 'Webinar', 2)",
            [$student],
        );
        $pdf = (string) tempnam(sys_get_temp_dir(), 'pp');
        file_put_contents($pdf, "%PDF-1.4
");

        $response = $this->call('POST', "/uploadseminarcertificate/$record", token: $this->tokenFor($student), files: [
            'file' => ['name' => 'cert.pdf', 'tmp_name' => $pdf, 'size' => (int) filesize($pdf), 'error' => UPLOAD_ERR_OK],
        ]);
        @unlink($pdf);

        self::assertStatus(200, $response);
        self::assertSame(1, (int) $this->db()->fetchValue('SELECT certified FROM student_seminar_records WHERE id = ?', [$record]));
    }
}
