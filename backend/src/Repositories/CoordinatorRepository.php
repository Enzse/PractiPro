<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Practicum coordinators (role "advisor") and their class assignments.
 */
final class CoordinatorRepository extends Repository
{
    /**
     * @return list<array<string, mixed>>
     */
    public function withClassCount(?int $id = null): array
    {
        $sql = 'SELECT c.*, COUNT(r.block_name) AS number_of_classes
                FROM coordinators c
                LEFT JOIN rl_class_coordinators r ON c.id = r.coordinator_id';
        $params = [];
        if ($id !== null) {
            $sql .= ' WHERE c.id = ?';
            $params[] = $id;
        }

        return $this->db->fetchAll($sql . ' GROUP BY c.id', $params);
    }

    public function updateDepartment(int $id, string $department): void
    {
        $this->db->execute('UPDATE coordinators SET department = ? WHERE id = ?', [$department, $id]);
    }

    public function assignBlock(int $coordinatorId, string $block): void
    {
        $this->db->execute('INSERT INTO rl_class_coordinators (coordinator_id, block_name) VALUES (?, ?)', [$coordinatorId, $block]);
    }

    public function unassignBlock(int $coordinatorId, string $block): int
    {
        return $this->db->execute('DELETE FROM rl_class_coordinators WHERE coordinator_id = ? AND block_name = ?', [$coordinatorId, $block]);
    }
}
