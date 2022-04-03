<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $castMembers = CastMember::all();
        $this->assertCount(1, $castMembers);
    }

    public function testAttributes()
    {
        factory(CastMember::class, 1)->create();
        $categories = CastMember::all();
        $expectedCastMemberKey = [
            'id',
            'name',
            'type',
            'created_at',
            'updated_at',
            'deleted_at'
        ];
        $castMemberKey = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing($expectedCastMemberKey, $castMemberKey);
    }

    public function testCreate()
    {
        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_ACTOR
        ]);
        $castMember->refresh();

        $uuid_regex = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";
        $this->assertRegExp($uuid_regex, $castMember->id);

        $this->assertEquals('test1', $castMember->name);
        $this->assertEquals(CastMember::TYPE_ACTOR, $castMember->type);

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR
        ]);
        $this->assertEquals(CastMember::TYPE_DIRECTOR, $castMember->type);
    }

    public function testUpdate()
    {
        /**
         * @var CastMember $castMember
         */
        $castMember = factory(CastMember::class)->create([
            'name' => 'actor1',
            'type' => CastMember::TYPE_ACTOR,
        ])->first();
        $update_data = [
            'name' => 'test_name_update',
            'type' => CastMember::TYPE_DIRECTOR,
        ];
        $castMember->update($update_data);
        foreach ($update_data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }
    }

    public function testDelete()
    {
        /**
         * @var CastMember $castMember
         */
        $castMember = factory(CastMember::class)->create([
            'name' => 'actor1',
            'type' => CastMember::TYPE_ACTOR,
        ])->first();

        $castMember_id = $castMember->id;
        $castMember->delete();

        $findCategory = CastMember::find($castMember_id);
        $this->assertNull($findCategory);
    }
}
