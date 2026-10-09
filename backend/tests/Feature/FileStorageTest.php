<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

/**
 * Uploaded files live on disk; the database only stores their path.
 */
final class FileStorageTest extends ApiTestCase
{
    private string $pdf;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pdf = (string) tempnam(sys_get_temp_dir(), 'pp');
        file_put_contents($this->pdf, "%PDF-1.4\n% " . bin2hex(random_bytes(8)) . "\n");
    }

    protected function tearDown(): void
    {
        @unlink($this->pdf);
        parent::tearDown();
    }

    public function testTheDatabaseNoLongerHoldsFileContents(): void
    {
        $blobColumns = (int) $this->db()->fetchValue(
            "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND data_type LIKE '%blob%'",
        );

        self::assertSame(0, $blobColumns);
    }

    public function testUploadsAreStoredOnDiskAndDeletedWithTheirRecord(): void
    {
        $student = $this->createUser('student');
        $token = $this->tokenFor($student);

        $this->call('POST', "/uploadfile/submissions/$student/Resume", token: $token, files: ['file' => $this->upload()]);
        $row = $this->db()->fetchOne('SELECT id, file_path FROM submissions WHERE user_id = ?', [$student]);
        self::assertNotNull($row);
        $file = self::storedFile((string) $row['file_path']);
        self::assertFileEquals($this->pdf, $file);

        self::assertStatus(200, $this->call('DELETE', "/deletesubmission/{$row['id']}/submissions", token: $token));
        self::assertFileDoesNotExist($file);
    }

    public function testReplacingAnAvatarRemovesTheOldImage(): void
    {
        $student = $this->createUser('student');
        $token = $this->tokenFor($student);
        $png = (string) tempnam(sys_get_temp_dir(), 'pp');
        file_put_contents($png, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg=='));
        $image = ['name' => 'me.png', 'tmp_name' => $png, 'size' => (int) filesize($png), 'error' => UPLOAD_ERR_OK];

        $this->call('POST', "/uploadavatar/$student", token: $token, files: ['file' => $image]);
        $first = self::storedFile((string) $this->db()->fetchValue('SELECT file_path FROM user_avatars WHERE user_id = ?', [$student]));
        $this->call('POST', "/uploadavatar/$student", token: $token, files: ['file' => $image]);
        $second = self::storedFile((string) $this->db()->fetchValue('SELECT file_path FROM user_avatars WHERE user_id = ?', [$student]));
        @unlink($png);

        self::assertFileDoesNotExist($first);
        self::assertFileExists($second);
        self::assertSame((string) file_get_contents($second), $this->call('GET', "/getavatar/$student", token: $token)->body());
    }

    public function testDeletingAnAccountDeletesItsFiles(): void
    {
        $student = $this->createUser('student');
        $this->call('POST', "/uploadfile/submissions/$student/Resume", token: $this->tokenFor($student), files: ['file' => $this->upload()]);
        $file = self::storedFile((string) $this->db()->fetchValue('SELECT file_path FROM submissions WHERE user_id = ?', [$student]));

        self::assertStatus(200, $this->call('DELETE', "/deleteuser/$student", token: $this->tokenFor($this->createUser('admin'))));

        self::assertFileDoesNotExist($file);
    }

    public function testDeletingASeminarRecordDeletesItsCertificate(): void
    {
        $student = $this->createUser('student');
        $token = $this->tokenFor($student);
        $record = $this->db()->insert(
            "INSERT INTO student_seminar_records (student_id, event_name, event_date, event_type, duration) VALUES (?, 'Talk', CURDATE(), 'Seminar', 1)",
            [$student],
        );
        $this->call('POST', "/uploadseminarcertificate/$record", token: $token, files: ['file' => $this->upload()]);
        $file = self::storedFile((string) $this->db()->fetchValue('SELECT file_path FROM student_seminar_certificates WHERE record_id = ?', [$record]));

        self::assertStatus(200, $this->call('DELETE', "/deleteseminarrecord/$record", token: $token));

        self::assertFileDoesNotExist($file);
    }

    /**
     * @return array{name: string, tmp_name: string, size: int, error: int}
     */
    private function upload(): array
    {
        return ['name' => 'doc.pdf', 'tmp_name' => $this->pdf, 'size' => (int) filesize($this->pdf), 'error' => UPLOAD_ERR_OK];
    }
}
