<?php

declare(strict_types=1);

namespace PractiPro\Tests\Feature;

final class SubmissionTest extends ApiTestCase
{
    private string $tempFile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tempFile = (string) tempnam(sys_get_temp_dir(), 'pp');
        file_put_contents($this->tempFile, "%PDF-1.4\n% test document\n");
    }

    protected function tearDown(): void
    {
        @unlink($this->tempFile);
        parent::tearDown();
    }

    public function testAStudentUploadsAndDownloadsTheirOwnFile(): void
    {
        $student = $this->createUser('student');
        $token = $this->tokenFor($student);

        $upload = $this->call('POST', "/uploadfile/submissions/$student/Resume", token: $token, files: ['file' => $this->upload('resume.pdf')]);
        self::assertStatus(200, $upload);

        $files = self::payload($this->call('GET', "/student-submission/submissions/$student", token: $token));
        self::assertCount(1, $files);
        self::assertSame('Resume', $files[0]['submission_name']);
        self::assertArrayNotHasKey('file_data', $files[0]);

        $download = $this->call('GET', "/getsubmissionfile/submissions/{$files[0]['id']}", token: $token);
        self::assertStatus(200, $download);
        self::assertSame((string) file_get_contents($this->tempFile), $download->body());
        self::assertSame('application/pdf', $download->header('Content-Type'));
        self::assertSame('attachment; filename="resume.pdf"', $download->header('Content-Disposition'));
    }

    public function testStudentsCannotDownloadOrDeleteSomeoneElsesFile(): void
    {
        $owner = $this->createUser('student');
        $intruder = $this->tokenFor($this->createUser('student'));
        $this->call('POST', "/uploadfile/submissions/$owner/Resume", token: $this->tokenFor($owner), files: ['file' => $this->upload('resume.pdf')]);
        $fileId = (int) $this->db()->fetchValue('SELECT id FROM submissions WHERE user_id = ?', [$owner]);

        self::assertStatus(403, $this->call('GET', "/getsubmissionfile/submissions/$fileId", token: $intruder));
        self::assertStatus(403, $this->call('DELETE', "/deletesubmission/$fileId/submissions", token: $intruder));
        self::assertStatus(403, $this->call('POST', "/uploadfile/submissions/$owner/Resume", token: $intruder, files: ['file' => $this->upload('x.pdf')]));
    }

    public function testAvatarsMustBeImages(): void
    {
        $student = $this->createUser('student');

        $response = $this->call('POST', "/uploadavatar/$student", token: $this->tokenFor($student), files: ['file' => $this->upload('me.png')]);

        self::assertStatus(422, $response);
    }

    /**
     * @return array{name: string, tmp_name: string, size: int, error: int}
     */
    private function upload(string $name): array
    {
        return ['name' => $name, 'tmp_name' => $this->tempFile, 'size' => (int) filesize($this->tempFile), 'error' => UPLOAD_ERR_OK];
    }
}
