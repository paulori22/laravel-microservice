<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
    private $controller;

    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();
        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();
    }

    public function testIndex()
    {
        /**
         * @var CategoryStub $category
         */
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $resource = $this->controller->index();
        $serialized = $resource->response()->getData(true);
        $this->assertEquals(
            [$category->toArray()],
            $serialized['data']
        );
        $this->assertArrayHasKey('meta', $serialized);
        $this->assertArrayHasKey('links', $serialized);
    }

    public function testInvalidationDataInStore()
    {
        $this->expectException(ValidationException::class);
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);
        $this->controller->store($request);
    }

    public function testStore()
    {
        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name', 'description' => 'test_description']);
        $resource = $this->controller->store($request);
        $serialized = $resource->response()->getData(true);
        $this->assertEquals(
            CategoryStub::first()->toArray(),
            $serialized['data']
        );
    }

    public function testIfFindOrFailFetchModel()
    {
        /**
         * @var CategoryStub $category
         */
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $resource = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(CategoryStub::class, $resource);
    }

    public function testIfFindOrFailFetchThrowExceptionIdInvalid()
    {
        $this->expectException(ModelNotFoundException::class);
        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);

        $reflectionMethod->invokeArgs($this->controller, [0]);
    }

    public function testShow()
    {
        /**
         * @var CategoryStub $category
         */
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $resource = $this->controller->show($category->id);
        $serialized = $resource->response()->getData(true);
        $this->assertEquals($category->toArray(), $serialized['data']);
    }

    public function testUpdate()
    {
        /**
         * @var CategoryStub $category
         */
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $request = \Mockery::mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name_update', 'description' => 'test_description_update']);

        $resource = $this->controller->update($request, $category->id);
        $serialized = $resource->response()->getData(true);
        $category->refresh();
        $this->assertEquals($category->toArray(), $serialized['data']);

        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name_update', 'description' => null]);

        $resource = $this->controller->update($request, $category->id);
        $serialized = $resource->response()->getData(true);
        $category->refresh();
        $this->assertEquals($category->toArray(), $serialized['data']);
    }

    public function testDestroy()
    {
        /**
         * @var CategoryStub $category
         */
        $category = CategoryStub::create(['name' => 'test_name', 'description' => 'test_description']);

        $response = $this->controller->destroy($category->id);

        $this->createTestResponse($response)->assertStatus(204);
        $this->assertCount(0, CategoryStub::all());
    }
}
