<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Category::class, 1)->create();
        $categories = Category::all();
        $this->assertCount(1, $categories);
    }

    public function testAttributes()
    {
        factory(Category::class, 1)->create();
        $categories = Category::all();
        $expectedCategoryKey = [
            'id',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at'
        ];
        $categoryKey = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing($expectedCategoryKey, $categoryKey);
    }

    public function testCreate()
    {
        $category = Category::create([
            'name' => 'test1'
        ]);
        $category->refresh();

        $uuid_regex = "/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i";
        $this->assertRegExp($uuid_regex, $category->id);

        $this->assertEquals('test1', $category->name);
        $this->assertNull($category->description);
        $this->assertTrue($category->is_active);

        $category = Category::create([
            'name' => 'test1',
            'description' => null
        ]);
        $this->assertNull($category->description);

        $category = Category::create([
            'name' => 'test1',
            'description' => 'test_desc'
        ]);
        $this->assertEquals('test_desc', $category->description);

        $category = Category::create([
            'name' => 'test1',
            'is_active' => false
        ]);
        $this->assertFalse($category->is_active);

        $category = Category::create([
            'name' => 'test1',
            'is_active' => true
        ]);
        $this->assertTrue($category->is_active);
    }

    public function testUpdate()
    {
        /**
         * @var Category $category
         */
        $category = factory(Category::class)->create([
            'description' => 'test_desc',
            'is_active' => false,
        ])->first();
        $update_data = [
            'name' => 'test_name_update',
            'description' => 'test_desc_update',
            'is_active' => true,
        ];
        $category->update($update_data);
        foreach ($update_data as $key => $value) {
            $this->assertEquals($value, $category->{$key});
        }
    }

    public function testDelete()
    {
        /**
         * @var Category $category
         */
        $category = factory(Category::class)->create([
            'description' => 'test_desc',
            'is_active' => false,
        ])->first();

        $category_id = $category->id;
        $category->delete();

        $findCategory = Category::find($category_id);
        $this->assertNull($findCategory);
    }
}
