<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Comment threads on student records. Each kind of record has its own
 * comments_* table; `file_id` points at the record being discussed.
 */
final class CommentRepository extends Repository
{
    /** Comment table => the table its file_id refers to. */
    public const PARENT_TABLES = [
        'comments_requirements' => 'submissions',
        'comments_documentation' => 'documentations',
        'comments_war' => 'student_war_records',
        'comments_finalreports' => 'student_final_reports',
        'comments_seminar_records' => 'student_seminar_records',
        'comments_evaluations' => 'student_supervisor_evaluation',
    ];

    /**
     * @return list<array<string, mixed>>
     */
    public function forRecord(string $table, int $recordId): array
    {
        self::assertTable($table);

        return $this->db->fetchAll("SELECT * FROM $table WHERE file_id = ? ORDER BY created_at", [$recordId]);
    }

    public function add(string $table, int $recordId, string $comment, string $commenter): void
    {
        self::assertTable($table);
        $this->db->execute("INSERT INTO $table (comments, file_id, commenter) VALUES (?, ?, ?)", [$comment, $recordId, $commenter]);
    }

    private static function assertTable(string $table): void
    {
        if (!array_key_exists($table, self::PARENT_TABLES)) {
            throw new \InvalidArgumentException("Table '$table' is not a comments table.");
        }
    }
}
