<?php

declare(strict_types=1);

namespace PractiPro\Database;

use PDO;

/**
 * Runs a mysqldump-style .sql file through PDO. PDO executes one statement at
 * a time and doesn't understand the client-side "DELIMITER" command that
 * dumps use around triggers, so statements are split here.
 */
final class SqlFile
{
    public static function run(PDO $pdo, string $path): void
    {
        $delimiter = ';';
        $statement = '';

        foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
            $trimmed = trim($line);
            if (preg_match('/^DELIMITER\s+(\S+)$/i', $trimmed, $m) === 1) {
                $delimiter = $m[1];
                continue;
            }
            if ($statement === '' && ($trimmed === '' || str_starts_with($trimmed, '--'))) {
                continue;
            }

            $statement .= $line . "\n";
            if (str_ends_with($trimmed, $delimiter)) {
                $sql = trim(substr(rtrim($statement), 0, -strlen($delimiter)));
                if ($sql !== '') {
                    $pdo->exec($sql);
                }
                $statement = '';
            }
        }
    }
}
