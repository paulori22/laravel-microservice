<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\QueryException;
use Ramsey\Uuid\Uuid;

class VideoCrudTest extends BaseVideoTestCase
{
    private $fileFieldsData = [];

    protected function setUp(): void
    {
        parent::setUp();
        foreach (Video::$fileFields as $field) {
            $this->fileFieldsData[$field] = "$field.test";
        }
    }

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
            'video_file',
            'thumb_file',
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

    public function testCreateWithBasicFields()
    {
        $video = Video::create($this->data + $this->fileFieldsData);
        $video->refresh();

        $this->assertTrue(Uuid::isValid($video->getKey()));
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->data + $this->fileFieldsData + ['opened' => false]);

        $video = Video::create($this->data + ['opened' => true]);
        $video->refresh();
        $this->assertTrue(Uuid::isValid($video->getKey()));
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->data + ['opened' => true]);

        foreach ($this->data as $key => $value) {
            $this->assertEquals($value, $video->getAttributeValue($key));
        }
    }

    public function testCreateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = Video::create(
            $this->data + [
                'categories_id' => [$category->getKey()],
                'genres_id' => [$genre->getKey()],
            ]
        );

        $this->assertHasCategory($video->getKey(), $category->getKey());
        $this->assertHasGenre($video->getKey(), $genre->getKey());
    }

    public function testUpdateWithBasicFields()
    {
        $video = factory(Video::class)->create([
            'opened' => true
        ]);
        $video->update($this->data + ['opened' => false] + $this->fileFieldsData);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', $this->data +  $this->fileFieldsData + ['opened' => false]);

        $video = factory(Video::class)->create([
            'opened' => false
        ]);
        $video->update($this->data + ['opened' => true]);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $this->data + ['opened' => true]);
    }

    public function testUpdateWithRelations()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $video = factory(Video::class)->create();
        $video->update(
            $this->data + [
                'categories_id' => [$category->getKey()],
                'genres_id' => [$genre->getKey()],
            ]
        );

        $this->assertHasCategory($video->getKey(), $category->getKey());
        $this->assertHasGenre($video->getKey(), $genre->getKey());
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

    public function testRollBackStore()
    {
        $hasError = false;
        try {
            Video::create([
                'title' => 'title',
                'description' => 'description',
                'year_release' => 2010,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0, 1, 2]
            ]);
        } catch (QueryException $exception) {
            $this->assertCount(0, Video::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testRollBackUpdate()
    {
        $video = factory(Video::class)->create();
        $oldTitle = $video->title;
        $hasError = false;
        try {
            $video->update([
                'title' => 'title',
                'description' => 'description',
                'year_release' => 2010,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0, 1, 2]
            ]);
        } catch (QueryException $exception) {
            $this->assertDatabaseHas('videos', [
                'title' => $oldTitle
            ]);
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testHandleRelations()
    {
        $video = factory(Video::class)->create();
        Video::handleRelations($video, []);
        $this->assertCount(0, $video->categories);
        $this->assertCount(0, $video->genres);

        $category = factory(Category::class)->create();
        Video::handleRelations($video, [
            'categories_id' => [$category->getKey()],
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);

        $genre = factory(Genre::class)->create();
        Video::handleRelations($video, [
            'genres_id' => [$genre->getKey()],
        ]);
        $video->refresh();
        $this->assertCount(1, $video->genres);

        $video->categories()->delete();
        $video->genres()->delete();

        Video::handleRelations($video, [
            'categories_id' => [$category->getKey()],
            'genres_id' => [$genre->getKey()],
        ]);
        $video->refresh();
        $this->assertCount(1, $video->categories);
        $this->assertCount(1, $video->genres);
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[0]],
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $video->getKey()
        ]);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]],
        ]);
        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $video->getKey()
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[1],
            'video_id' => $video->getKey()
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[2],
            'video_id' => $video->getKey()
        ]);
    }

    public function testSyncGenres()
    {
        $genres = factory(Genre::class, 3)->create();
        $genresId = $genres->pluck('id')->toArray();
        $video = factory(Video::class)->create();
        Video::handleRelations($video, [
            'genres_id' => [$genresId[0]],
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' => $video->getKey()
        ]);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]],
        ]);

        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' => $video->getKey()
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[1],
            'video_id' => $video->getKey()
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[2],
            'video_id' => $video->getKey()
        ]);
    }

    public function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    public function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }
}
