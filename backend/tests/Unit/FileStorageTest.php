<?php

declare(strict_types=1);

namespace PractiPro\Tests\Unit;

use PHPUnit\Framework\TestCase;
use PractiPro\Support\FileStorage;

final class FileStorageTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = sys_get_temp_dir() . '/pp-storage-' . bin2hex(random_bytes(4));
    }

    protected function tearDown(): void
    {
        foreach (glob($this->root . '/*/*/*/*') ?: [] as $file) {
            unlink($file);
        }
        foreach (array_reverse(glob($this->root . '/*/*/*') ?: []) as $dir) {
            rmdir($dir);
        }
        foreach (glob($this->root . '/*/*') ?: [] as $dir) {
            rmdir($dir);
        }
        foreach (glob($this->root . '/*') ?: [] as $dir) {
            rmdir($dir);
        }
        @rmdir($this->root);
    }

    public function testStoresAndReadsBackFiles(): void
    {
        $storage = new FileStorage($this->root);

        $path = $storage->put('submissions', 'hello', 'PDF');

        self::assertMatchesRegularExpression('#^submissions/\d{4}/\d{2}/[a-f0-9]{32}\.pdf$#', $path);
        self::assertSame('hello', $storage->get($path));
        $storage->delete($path);
        self::assertNull($storage->get($path));
    }

    public function testCleansFolderAndExtensionNames(): void
    {
        $path = (new FileStorage($this->root))->put('../Evil Folder', 'x', 'p/h.p');

        self::assertMatchesRegularExpression('#^evilfolder/\d{4}/\d{2}/[a-f0-9]{32}\.php$#', $path);
    }

    public function testRefusesPathsOutsideStorage(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        (new FileStorage($this->root))->get('../../.env');
    }
}
