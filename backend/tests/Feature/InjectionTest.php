<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

/**
 * The original API built SQL from URL segments, including table and column
 * names. These tests pin down that it no longer does.
 */
final class InjectionTest extends ApiTestCase
{
    public function testValuesFromTheUrlAreNotInterpretedAsSql(): void
    {
        $admin = $this->tokenFor($this->createUser('admin'));
        $this->db()->execute("INSERT INTO class_blocks (block_name, course, year_level) VALUES ('BSCS1-A', 'BSCS', 1)");

        $response = $this->call('GET', "/classes/x' OR '1'='1", token: $admin);

        self::assertStatus(200, $response);
        self::assertSame([], self::payload($response));
    }

    public function testTableNamesFromTheUrlMustBeOnTheAllowList(): void
    {
        $admin = $this->createUser('admin');
        $token = $this->tokenFor($admin);
        $victim = $this->createUser('student');

        // Previously: DELETE FROM user WHERE id = <victim>
        self::assertStatus(400, $this->call('DELETE', "/deletesubmission/$victim/user", token: $token));
        self::assertStatus(400, $this->call('GET', '/student-submission/user', token: $token));
        self::assertStatus(400, $this->call('GET', "/getsubmissionfile/user/$victim", token: $token));
        self::assertStatus(400, $this->call('POST', '/updateadvisorapproval/user/1', ['advisor_approval' => 'x'], $token));
        self::assertStatus(400, $this->call('GET', "/checkexistingassignment/user/id/role/$victim/1", token: $token));

        self::assertTrue((bool) $this->db()->fetchValue('SELECT COUNT(*) FROM user WHERE id = ?', [$victim]));
    }

    public function testColumnNamesFromTheUrlMustBeOnTheAllowList(): void
    {
        $advisor = $this->createUser('advisor');
        $this->db()->execute("INSERT INTO class_blocks (block_name, course, year_level) VALUES ('B-1', 'BSCS', 1)");
        $this->db()->execute("INSERT INTO rl_class_coordinators (coordinator_id, block_name) VALUES (?, 'B-1')", [$advisor]);

        $response = $this->call('GET', '/getstudentswithpendingsubmissions/B-1/(SELECT password FROM user LIMIT 1)', token: $this->tokenFor($advisor));

        self::assertStatus(400, $response);
    }
}
