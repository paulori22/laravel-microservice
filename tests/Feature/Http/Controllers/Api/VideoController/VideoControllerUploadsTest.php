<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;
use Tests\Unit\Models\VideoUnitTest;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use  TestValidations, TestSaves, TestUploads;

    public function testInvalidationVideoFileField()
    {
        $files = [
            [
                'field' => 'video_file',
                'type' => 'mp4',
                'maxSize' => Video::VIDEO_FILE_MAX_SIZE,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'video/mp4']
            ],
            [
                'field' => 'thumb_file',
                'type' => 'jpg',
                'maxSize' => Video::THUMB_FILE_MAX_SIZE,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'image/jpeg']
            ],
            [
                'field' => 'trailer_file',
                'type' => 'mp4',
                'maxSize' => Video::TRAILER_FILE_MAX_SIZE,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'video/mp4']
            ],
            [
                'field' => 'banner_file',
                'type' => 'jpg',
                'maxSize' => Video::BANNER_FILE_MAX_SIZE,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'image/jpeg']
            ],
        ];
        foreach ($files as $file) {
            $this->assertInvalidationFile(
                $file['field'],
                $file['type'],
                $file['maxSize'],
                $file['rule'],
                $file['ruleParams'],
            );
        }
    }

    public function testSaveWithFiles()
    {
        \Storage::fake();
        $files = $this->getTestFiles();

        $testData = Arr::except($this->sendData, ['categories_id', 'genres_id']);

        $data = [
            'send_data' => $this->sendData +
                $files,
            'test_data' => $testData
        ];

        $response = $this->assertStore($data['send_data'], $data['test_data'] + ['deleted_at' => null]);
        $this->assertFileOnPersist($response, $files);
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $files = $this->getTestFiles();

        $testData = Arr::except($this->sendData, ['categories_id', 'genres_id']);

        $data = [
            'send_data' => $this->sendData +
                $files,
            'test_data' => $testData
        ];

        $response = $this->assertUpdate($data['send_data'], $data['test_data'] + ['deleted_at' => null]);
        $this->assertFileOnPersist($response, $files);

        $newFiles = [
            'video_file' => UploadedFile::fake()->create('video.mp4', 1024),
            'thumb_file' => UploadedFile::fake()->image('thumb.jpg', 1024),
        ];

        $data = [
            'send_data' => $this->sendData +
                $newFiles,
            'test_data' => $testData
        ];

        $response = $this->assertUpdate($data['send_data'], $data['test_data'] + ['deleted_at' => null]);
        $this->assertFileOnPersist($response, $newFiles);
        $id = $response->json('id');
        $video = Video::find($id);
        \Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        \Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
    }

    protected function assertFileOnPersist(TestResponse $testResponse, $files)
    {
        $id = $testResponse->json('id');
        $video = Video::find($id);
        $this->assertFilesExistInStorage($video, $files);
    }

    protected function getTestFiles()
    {
        return [
            'video_file' => UploadedFile::fake()->create('video.mp4', 1024),
            'thumb_file' => UploadedFile::fake()->image('thumb.jpg', 1024),
            'trailer_file' => UploadedFile::fake()->create('trailer.mp4', 1024),
            'banner_file' => UploadedFile::fake()->image('banner.jpg', 1024),
        ];
    }
}
