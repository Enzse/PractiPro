<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Comment threads on student records. Each kind of record has its own
 * comments_* table; `file_id` points at the record being discussed, and the
 * record's `comments` column caches how many comments it has.
 */
final class CommentRepository extends Repository
{
    /** Comment table => the table its file_id refers to (as declared by the foreign keys). */
    public const PARENT_TABLES = [
        'comments_requirements' => 'submissions',
        'comments_documentation' => 'documentations',
        'comments_war' => 'student_war_records',
        'comments_finalreports' => 'finalreports',
        'comments_seminar_records' => 'student_seminar_records',
        'comments_evaluations' => 'supervisor_student_evaluations',
    ];

    /**
     * @return list<array<string, mixed>>
     */
    public function forRecord(string $table, int $recordId): array
    {
        self::parentOf($table);

        return $this->db->fetchAll("SELECT * FROM $table WHERE file_id = ? ORDER BY created_at", [$recordId]);
    }

    /**
     * Adds a comment and updates the record's comment count.
     */
    public function add(string $table, int $recordId, string $comment, string $commenter): void
    {
        $parent = self::parentOf($table);

        $this->db->transaction(function () use ($table, $parent, $recordId, $comment, $commenter) {
            $this->db->execute("INSERT INTO $table (comments, file_id, commenter) VALUES (?, ?, ?)", [$comment, $recordId, $commenter]);
            $this->db->execute(
                "UPDATE $parent SET comments = (SELECT COUNT(*) FROM $table WHERE file_id = ?) WHERE id = ?",
                [$recordId, $recordId],
            );
        });
    }

    private static function parentOf(string $table): string
    {
        return self::PARENT_TABLES[$table] ?? throw new \InvalidArgumentException("Table '$table' is not a comments table.");
    }
}
