<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Http\UploadedFile;

use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use  TestValidations, TestSaves, TestUploads;

    public function testInvalidationVideoFileField()
    {
        $files = [
            [
                'field' => 'video_file',
                'type' => 'mp4',
                'maxSize' => 52428800,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'video/mp4']
            ],
            [
                'field' => 'thumb_file',
                'type' => 'jpg',
                'maxSize' => 5120,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'image/jpeg']
            ],
            [
                'field' => 'trailer_file',
                'type' => 'mp4',
                'maxSize' => 1048576,
                'rule' => 'mimetypes',
                'ruleParams' => ['values' => 'video/mp4']
            ],
            [
                'field' => 'banner_file',
                'type' => 'jpg',
                'maxSize' => 10240,
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

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->getKey());

        $data = [
            'send_data' => $this->sendData +
                [
                    'categories_id' => [$category->getKey()],
                    'genres_id' => [$genre->getKey()],
                ] +
                $files,
            'test_data' => $this->sendData
        ];

        $response = $this->assertStore($data['send_data'], $data['test_data'] + ['deleted_at' => null]);
        $videoId = $response['id'];
        foreach ($files as $file) {
            $filePath = "$videoId/{$file->hashName()}";
            \Storage::assertExists($filePath);
        }
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
