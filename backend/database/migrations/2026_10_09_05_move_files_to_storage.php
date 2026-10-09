<?php

declare(strict_types=1);

/*
 * Copies every file stored in the database to FileStorage and records its
 * path. Rows are processed one at a time so large files don't all sit in
 * memory together. Safe to re-run: rows that already have a path are skipped.
 * The next migration drops the BLOB columns.
 */

use PractiPro\Support\FileStorage;

return static function (PDO $pdo, FileStorage $storage): void {
    // table => [blob column, column holding the original extension or null]
    $tables = [
        'submissions' => ['file_data', 'file_type'],
        'documentations' => ['file_data', 'file_type'],
        'finalreports' => ['file_data', 'file_type'],
        'war' => ['file_data', 'file_type'],
        'student_war' => ['file_data', 'file_type'],
        'dtr' => ['file_data', 'file_type'],
        'supervisor_student_evaluations' => ['file_data', 'file_type'],
        'student_seminar_certificates' => ['file_data', 'file_type'],
        'user_avatars' => ['avatar', null],
        'company_logos' => ['avatar', null],
    ];
    $imageExtensions = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);

    foreach ($tables as $table => [$blobColumn, $typeColumn]) {
        $ids = $pdo->query("SELECT id FROM $table WHERE $blobColumn IS NOT NULL AND file_path IS NULL")->fetchAll(PDO::FETCH_COLUMN);
        $select = $pdo->prepare("SELECT $blobColumn" . ($typeColumn ? ", $typeColumn" : '') . " FROM $table WHERE id = ?");
        $update = $pdo->prepare("UPDATE $table SET file_path = ? WHERE id = ?");

        foreach ($ids as $id) {
            $select->execute([$id]);
            $row = $select->fetch(PDO::FETCH_NUM);
            $data = (string) $row[0];
            $extension = $typeColumn ? (string) $row[1] : ($imageExtensions[$finfo->buffer($data)] ?? '');

            $update->execute([$storage->put($table, $data, $extension), $id]);
        }
    }
};
