<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

/**
 * Coordinators only see students in their classes, and supervisors only see
 * students placed at their company.
 */
final class ScopingTest extends ApiTestCase
{
    public function testCoordinatorsOnlySeeRecordsOfTheirOwnStudents(): void
    {
        $advisor = $this->createUser('advisor');
        $mine = $this->createUser('student');
        $notMine = $this->createUser('student');
        $this->assignToClass($mine, $advisor);
        $token = $this->tokenFor($advisor);

        self::assertStatus(200, $this->call('GET', "/getdtr/$mine", token: $token));
        self::assertStatus(403, $this->call('GET', "/getdtr/$notMine", token: $token));
        self::assertStatus(403, $this->call('GET', "/student-submission/submissions/$notMine", token: $token));
        self::assertStatus(403, $this->call('GET', "/getfinalreport/$notMine", token: $token));
    }

    public function testCoordinatorsCanOnlyApproveTheirOwnStudentsWork(): void
    {
        $advisor = $this->createUser('advisor');
        $mine = $this->createUser('student');
        $notMine = $this->createUser('student');
        $this->assignToClass($mine, $advisor);
        $myRecord = $this->db()->insert("INSERT INTO submissions (user_id, submission_name, file_name) VALUES (?, 'Resume', 'a.pdf')", [$mine]);
        $otherRecord = $this->db()->insert("INSERT INTO submissions (user_id, submission_name, file_name) VALUES (?, 'Resume', 'b.pdf')", [$notMine]);
        $token = $this->tokenFor($advisor);

        self::assertStatus(200, $this->call('POST', "/updateadvisorapproval/submissions/$myRecord", ['advisor_approval' => 'Approved'], $token));
        self::assertStatus(403, $this->call('POST', "/updateadvisorapproval/submissions/$otherRecord", ['advisor_approval' => 'Approved'], $token));
        self::assertStatus(403, $this->call('GET', "/submission-comments/comments_requirements/$otherRecord", token: $token));
    }

    public function testSupervisorsOnlySeeStudentsPlacedAtTheirCompany(): void
    {
        $supervisor = $this->createUser('supervisor');
        $placed = $this->createUser('student');
        $elsewhere = $this->createUser('student');
        $this->placeAtCompany($placed, $supervisor);
        $this->placeAtCompany($elsewhere, $this->createUser('supervisor'));
        $token = $this->tokenFor($supervisor);

        self::assertStatus(200, $this->call('GET', "/getdtr/$placed", token: $token));
        self::assertStatus(403, $this->call('GET', "/getdtr/$elsewhere", token: $token));
        self::assertStatus(403, $this->call('GET', "/ojtschedules/$elsewhere", token: $token));
        self::assertStatus(403, $this->call('POST', '/assignjobtostudent', [
            'student_id' => $elsewhere, 'supervisor_id' => $supervisor, 'job_title' => 'Dev',
            'job_description' => 'x', 'start_date' => '2026-01-01', 'end_date' => '2026-06-01',
        ], $token));
    }

    public function testStaffCanLookUpAnyStudentButOnlySeeContactDetailsOfTheirOwn(): void
    {
        $advisor = $this->createUser('advisor');
        $mine = $this->createUser('student');
        $notMine = $this->createUser('student');
        $this->assignToClass($mine, $advisor);
        $this->db()->execute("UPDATE students SET phoneNumber = '09170000000', address = 'Olongapo' WHERE id IN (?, ?)", [$mine, $notMine]);
        $token = $this->tokenFor($advisor);

        $own = self::payload($this->call('GET', "/studentsojt/$mine", token: $token))[0];
        $other = self::payload($this->call('GET', "/studentsojt/$notMine", token: $token))[0];

        self::assertSame('09170000000', $own['phoneNumber']);
        self::assertNull($other['phoneNumber']);
        self::assertNull($other['address']);
        self::assertSame($notMine, $other['id']);
    }

    public function testListingEveryStudentsRecordsIsAdminOnly(): void
    {
        $advisor = $this->tokenFor($this->createUser('advisor'));
        $supervisor = $this->tokenFor($this->createUser('supervisor'));

        foreach (['/getdtr', '/studentsojt', '/student-submission/submissions'] as $path) {
            self::assertStatus(403, $this->call('GET', $path, token: $advisor));
            self::assertStatus(403, $this->call('GET', $path, token: $supervisor));
        }
    }

    public function testCoordinatorsOnlyWithdrawTheirOwnInvitations(): void
    {
        $advisor = $this->createUser('advisor');
        $otherAdvisor = $this->createUser('advisor');
        $student = $this->createUser('student');
        $this->assignToClass($this->createUser('student'), $advisor, 'MINE-1');
        $this->assignToClass($this->createUser('student'), $otherAdvisor, 'THEIRS-1');
        $this->db()->execute(
            "INSERT INTO class_join_invitations (student_id, advisor_id, class) VALUES (?, ?, 'MINE-1'), (?, ?, 'THEIRS-1')",
            [$student, $advisor, $student, $otherAdvisor],
        );

        self::assertStatus(200, $this->call('DELETE', "/cancelclassinvitation/$student", token: $this->tokenFor($advisor)));

        $remaining = $this->db()->fetchAll('SELECT class FROM class_join_invitations WHERE student_id = ?', [$student]);
        self::assertSame([['class' => 'THEIRS-1']], $remaining);
    }
}
