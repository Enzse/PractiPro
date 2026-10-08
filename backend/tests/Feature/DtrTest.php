<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

final class DtrTest extends ApiTestCase
{
    public function testAStudentClocksInAndOut(): void
    {
        $student = $this->createUser('student');
        $token = $this->tokenFor($student);

        self::assertStatus(200, $this->call('POST', "/dtrclockin/$student", token: $token));
        self::assertStatus(400, $this->call('POST', "/dtrclockin/$student", token: $token), 'A second clock-in is refused.');
        self::assertStatus(200, $this->call('POST', "/dtrclockout/$student", token: $token));
        self::assertStatus(400, $this->call('POST', "/dtrclockout/$student", token: $token), 'Nothing left to clock out of.');

        $records = self::payload($this->call('GET', "/getdtr/$student", token: $token));
        self::assertCount(1, $records);
        self::assertSame('Pending', $records[0]['status']);
    }

    public function testRecordsUnderAnHourAreCleared(): void
    {
        $student = $this->createUser('student');
        $this->db()->execute(
            "INSERT INTO student_dailytimerecords (student_id, date, startTime, endTime) VALUES
             (?, CURDATE(), '08:00:00', '08:30:00'), (?, CURDATE(), '09:00:00', '12:00:00')",
            [$student, $student],
        );

        $response = $this->call('DELETE', "/clearobsoletedtrs/$student", token: $this->tokenFor($student));

        self::assertStatus(200, $response);
        self::assertStringContainsString('Successfully deleted 1 records', $response->decoded()['status']['message']);
        self::assertSame(1, (int) $this->db()->fetchValue('SELECT COUNT(*) FROM student_dailytimerecords WHERE student_id = ?', [$student]));
    }

    public function testSupervisorsApproveTimeRecords(): void
    {
        $student = $this->createUser('student');
        $recordId = $this->db()->insert("INSERT INTO student_dailytimerecords (student_id, date, startTime, endTime) VALUES (?, CURDATE(), '08:00', '17:00')", [$student]);

        self::assertStatus(403, $this->call('POST', "/updatedtrstatus/$recordId", ['status' => 'Approved'], $this->tokenFor($student)));
        self::assertStatus(200, $this->call('POST', "/updatedtrstatus/$recordId", ['status' => 'Approved'], $this->tokenFor($this->createUser('supervisor'))));
    }
}
