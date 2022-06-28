<?php

namespace Tests\Feature\Rules;

use App\Models\Category;
use App\Models\Genre;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class GenresHasCategoriesRuleTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * @var Collection
     */
    private $categories;
    private $genres;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categories = factory(Category::class, 4)->create();
        $this->genres = factory(Genre::class, 2)->create();

        $this->genres[0]->categories()->sync([
            $this->categories[0]->getKey(),
            $this->categories[1]->getKey()
        ]);

        $this->genres[1]->categories()->sync([
            $this->categories[2]->getKey()
        ]);
    }

    public function testPassesIsValid()
    {
        $rule = new GenresHasCategoriesRule([
            $this->categories[2]->getKey()
        ]);
        $isValid = $rule->passes('', [
            $this->genres[1]->getKey(),
        ]);
        $this->assertTrue($isValid);

        $rule = new GenresHasCategoriesRule([
            $this->categories[0]->getKey(),
            $this->categories[2]->getKey(),
        ]);
        $isValid = $rule->passes('', [
            $this->genres[0]->getKey(),
            $this->genres[1]->getKey(),
        ]);
        $this->assertTrue($isValid);

        $rule = new GenresHasCategoriesRule([
            $this->categories[0]->getKey(),
            $this->categories[1]->getKey(),
            $this->categories[2]->getKey(),
        ]);
        $isValid = $rule->passes('', [
            $this->genres[0]->getKey(),
            $this->genres[1]->getKey(),
        ]);
        $this->assertTrue($isValid);
    }

    public function testPassesIsNotValid()
    {
        $rule = new GenresHasCategoriesRule([
            $this->categories[0]->getKey()
        ]);
        $isNotValid = $rule->passes('', [
            $this->genres[0]->getKey(),
            $this->genres[1]->getKey(),
        ]);
        $this->assertFalse($isNotValid);

        $rule = new GenresHasCategoriesRule([
            $this->categories[3]->getKey()
        ]);
        $isNotValid = $rule->passes('', [
            $this->genres[0]->getKey(),
        ]);
        $this->assertFalse($isNotValid);
    }
}
