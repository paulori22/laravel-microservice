<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Video::class, 1)->create();
        $videos = Video::all();
        $this->assertCount(1, $videos);
    }

    public function testAttributes()
    {
        factory(Video::class, 1)->create();
        $videos = Video::all();
        $expectedVideoKey = [
            'id',
            'title',
            'description',
            'year_release',
            'opened',
            'rating',
            'duration',
            'created_at',
            'updated_at',
            'deleted_at'
        ];
        $videoKey = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing($expectedVideoKey, $videoKey);
    }

    public function testCreate()
    {
        $createData = [
            'title' => 'title',
            'description' => 'description',
            'year_release' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
        $video = Video::create($createData);
        $video->refresh();

        $uuid_regex = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";
        $this->assertRegExp($uuid_regex, $video->getKey());

        foreach ($createData as $key => $value) {
            $this->assertEquals($value, $video->getAttributeValue($key));
        }
    }

    public function testUpdate()
    {
        /**
         * @var Video $category
         */
        $video = factory(Video::class)->create([
            'title' => 'title',
            'description' => 'description',
            'opened' => false,
            'year_release' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ])->first();
        $update_data = [
            'title' => 'title_update',
            'description' => 'description_update',
            'opened' => true,
            'year_release' => 2011,
            'rating' => Video::RATING_LIST[1],
            'duration' => 100,
        ];
        $video->update($update_data);
        foreach ($update_data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
    }

    public function testDelete()
    {
        /**
         * @var Video $category
         */
        $video = factory(Video::class)->create([
            'title' => 'title',
            'description' => 'description',
            'opened' => false,
            'year_release' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ])->first();

        $videoId = $video->getKey();
        $video->delete();

        $findVideo = Video::find($videoId);
        $this->assertNull($findVideo);
    }
}
