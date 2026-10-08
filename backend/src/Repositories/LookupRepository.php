<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

/**
 * Small reference tables: roles and departments.
 */
final class LookupRepository extends Repository
{
    /**
     * @return list<array<string, mixed>>
     */
    public function roles(?int $id = null): array
    {
        return $id === null
            ? $this->db->fetchAll('SELECT id, code, name FROM role ORDER BY id')
            : $this->db->fetchAll('SELECT id, code, name FROM role WHERE id = ?', [$id]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function departments(?int $id = null): array
    {
        return $id === null
            ? $this->db->fetchAll('SELECT id, code, name FROM departments ORDER BY id')
            : $this->db->fetchAll('SELECT id, code, name FROM departments WHERE id = ?', [$id]);
    }
}
