<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();
        $this->assertCount(1, $genres);
    }

    public function testAttributes()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();
        $expectedGenreKey = [
            'id',
            'name',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at'
        ];
        $genreKey = array_keys($genres->first()->getAttributes());
        $this->assertEqualsCanonicalizing($expectedGenreKey, $genreKey);
    }

    public function testCreate()
    {
        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $genre->refresh();

        $uuid_regex = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";
        $this->assertRegExp($uuid_regex, $genre->id);

        $this->assertEquals('test1', $genre->name);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => false
        ]);
        $this->assertFalse($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => true
        ]);
        $this->assertTrue($genre->is_active);
    }

    public function testUpdate()
    {
        /**
         * @var Genre $category
         */
        $genre = factory(Genre::class)->create([
            'is_active' => false,
        ])->first();
        $update_data = [
            'name' => 'test_name_update',
            'is_active' => true,
        ];
        $genre->update($update_data);
        foreach ($update_data as $key => $value) {
            $this->assertEquals($value, $genre->{$key});
        }
    }

    public function testDelete()
    {
        /**
         * @var Genre $category
         */
        $genre = factory(Genre::class)->create([
            'is_active' => false,
        ])->first();

        $genre_id = $genre->id;
        $genre->delete();

        $findGenre = Genre::find($genre_id);
        $this->assertNull($findGenre);
    }
}
