<?php

declare(strict_types=1);

namespace PractiPro\Repositories;

use PractiPro\Database\Database;

/**
 * Base class for repositories: the only classes that contain SQL.
 */
abstract class Repository
{
    public function __construct(protected readonly Database $db)
    {
    }
}
