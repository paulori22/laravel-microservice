<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;

abstract class BaseVideoControllerTestCase extends TestCase
{
    use DatabaseMigrations;

    protected $video;

    protected $serializedFields = [
        'id',
        'title',
        'description',
        'year_release',
        'rating',
        'duration',
        'opened',
        'video_file_url',
        'thumb_file_url',
        'trailer_file_url',
        'banner_file_url',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' =>  [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'categories' => [
                    '*' =>  [
                        'id',
                        'name',
                        'description',
                        'is_active',
                        'created_at',
                        'updated_at',
                        'deleted_at'
                    ]
                ],
                'created_at',
                'updated_at',
                'deleted_at'
            ]
        ]
    ];

    protected $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false,
            'thumb_file' => 'thumb.jpg',
            'banner_file' => 'banner.jpg',
            'video_file' => 'video.mp4',
            'trailer_file' => 'trailer.mp4',
        ]);
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->getKey());
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_release' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
            'categories_id' => [$category->getKey()],
            'genres_id' => [$genre->getKey()]
        ];
    }

    protected function assertIfFileUrlExists(Video $video, TestResponse $response)
    {
        $fileFields = Video::$fileFields;
        $data = $response->json('data');
        $data = array_key_exists(0, $data) ? $data[0] : $data;
        foreach ($fileFields as $field) {
            $file = $video->{$field};
            $this->assertEquals(
                \Storage::url($video->relativeFilePath($file)),
                $data[$field . '_url']
            );
        }
    }

    protected function routeStore()
    {
        return route('videos.store');
    }

    protected function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->getKey()]);
    }

    protected function model()
    {
        return Video::class;
    }
}
