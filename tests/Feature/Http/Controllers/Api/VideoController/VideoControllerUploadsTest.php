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
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            1024,
            'mimetypes',
            ['values' => 'video/mp4']
        );
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
        ];
    }
}
