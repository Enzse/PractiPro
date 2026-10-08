<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

/**
 * A student gets into a class by accepting an invitation, opening a join
 * link, or having their join request accepted. Nothing else.
 */
final class ClassJoinTest extends ApiTestCase
{
    private int $advisor;
    private int $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->advisor = $this->createUser('advisor');
        $this->student = $this->createUser('student');
        $this->db()->execute("INSERT INTO class_blocks (block_name, course, year_level) VALUES ('BSCS3-A', 'BSCS', 3)");
        $this->db()->execute("INSERT INTO rl_class_coordinators (coordinator_id, block_name) VALUES (?, 'BSCS3-A')", [$this->advisor]);
    }

    public function testStudentsCannotJustPutThemselvesInAClass(): void
    {
        self::assertStatus(403, $this->join($this->student, ['block_name' => 'BSCS3-A']));
        self::assertNull($this->blockOf($this->student));
    }

    public function testStudentsJoinByAcceptingAnInvitation(): void
    {
        $this->db()->execute("INSERT INTO class_join_invitations (student_id, advisor_id, class) VALUES (?, ?, 'BSCS3-A')", [$this->student, $this->advisor]);

        self::assertStatus(200, $this->join($this->student, ['block_name' => 'BSCS3-A']));
        self::assertSame('BSCS3-A', $this->blockOf($this->student));
        self::assertSame(0, (int) $this->db()->fetchValue('SELECT COUNT(*) FROM class_join_invitations WHERE student_id = ?', [$this->student]));
    }

    public function testStudentsJoinWithAValidLinkToken(): void
    {
        $link = self::payload($this->call('POST', '/createclassjoinlink', ['class' => 'BSCS3-A'], $this->tokenFor($this->advisor)));
        $token = substr((string) $link, (int) strpos((string) $link, 'token=') + 6);

        self::assertStatus(403, $this->join($this->student, ['block_name' => 'BSCS3-A', 'token' => 'not-the-token']));
        self::assertStatus(200, $this->join($this->student, ['block_name' => 'BSCS3-A', 'token' => $token]));
    }

    public function testExpiredLinksDoNotWork(): void
    {
        $this->db()->execute("INSERT INTO class_join_links (class, join_token_hash, join_token_expires_at) VALUES ('BSCS3-A', 'old-token', NOW() - INTERVAL 1 MINUTE)");

        self::assertStatus(403, $this->join($this->student, ['block_name' => 'BSCS3-A', 'token' => 'old-token']));
    }

    public function testCoordinatorsAddStudentsByAcceptingTheirRequest(): void
    {
        $token = $this->tokenFor($this->advisor);
        self::assertStatus(403, $this->call('POST', "/assignclasstostudent/{$this->student}", ['block_name' => 'BSCS3-A'], $token));

        $this->db()->execute("INSERT INTO class_join_requests (student_id, class) VALUES (?, 'BSCS3-A')", [$this->student]);

        self::assertStatus(200, $this->call('POST', "/assignclasstostudent/{$this->student}", ['block_name' => 'BSCS3-A'], $token));
        self::assertSame('BSCS3-A', $this->blockOf($this->student));
    }

    /**
     * @param array<string, string> $body
     */
    private function join(int $studentId, array $body): \PractiPro\Http\Response
    {
        return $this->call('POST', "/assignclasstostudent/$studentId", $body, $this->tokenFor($studentId));
    }

    private function blockOf(int $studentId): ?string
    {
        $block = $this->db()->fetchValue('SELECT block FROM students WHERE id = ?', [$studentId]);

        return $block === null || $block === false ? null : (string) $block;
    }
}
