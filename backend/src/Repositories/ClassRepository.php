<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Class blocks (sections such as "BSCS2-B").
 */
final class ClassRepository extends Repository
{
    /**
     * @return list<array<string, mixed>>
     */
    public function blocks(?string $block = null): array
    {
        return $block === null
            ? $this->db->fetchAll('SELECT * FROM class_blocks')
            : $this->db->fetchAll('SELECT * FROM class_blocks WHERE block_name = ?', [$block]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function profile(string $block): array
    {
        return $this->db->fetchAll('SELECT * FROM vw_class_profile WHERE block_name = ?', [$block]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function byCourseAndYear(string $course, int $year): array
    {
        return $this->db->fetchAll('SELECT * FROM vw_class_profile WHERE course = ? AND year_level = ?', [$course, $year]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function byCoordinator(int $coordinatorId): array
    {
        return $this->db->fetchAll(
            'SELECT cb.*
             FROM vw_class_profile cb
             JOIN rl_class_coordinators rcc ON cb.block_name = rcc.block_name
             WHERE rcc.coordinator_id = ?',
            [$coordinatorId],
        );
    }

    public function create(string $block, string $course, int $yearLevel): void
    {
        $this->db->execute('INSERT INTO class_blocks (block_name, course, year_level) VALUES (?, ?, ?)', [$block, $course, $yearLevel]);
    }
}
