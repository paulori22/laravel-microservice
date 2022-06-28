<?php

declare(strict_types=1);

namespace App\Unit\Rules;

use App\Rules\GenresHasCategoriesRule;
use Illuminate\Contracts\Validation\Rule;
use Mockery\MockInterface;
use Tests\TestCase;

class GenresHasCategoriesRuleUnitTest extends TestCase
{
    public function testIfImplementsInterfaces()
    {
        $interfaces = [
            Rule::class
        ];
        $implements_classes = array_keys(class_implements(GenresHasCategoriesRule::class));
        $this->assertEquals($interfaces, $implements_classes);
    }

    public function testCategoriesIdField()
    {
        $rule = new GenresHasCategoriesRule(
            [1, 1, 2, 2]
        );
        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('categoriesId');
        $reflectionProperty->setAccessible(true);

        $categoriesId = $reflectionProperty->getValue($rule);
        $this->assertEqualsCanonicalizing([1, 2], $categoriesId);
    }

    public function testGenresIdValue()
    {
        $rule = $this->createRuleMock([]);
        $rule
            ->shouldReceive('getCategoriesRelationRows')
            ->withAnyArgs()
            ->andReturnNull();

        $rule->passes('', [1, 1, 2, 2]);
        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('genresId');
        $reflectionProperty->setAccessible(true);

        $genresId = $reflectionProperty->getValue($rule);
        $this->assertEqualsCanonicalizing([1, 2], $genresId);
    }

    public function testPassesReturnsFalseWhenCategoriesIsEmptyArray()
    {
        $rule = $this->createRuleMock([]);
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPassesReturnsFalseWhenGenresIsEmptyArray()
    {
        $rule = $this->createRuleMock([1]);
        $this->assertFalse($rule->passes('', []));
    }

    public function testPassesReturnsFalseWhenGetCategoriesRelationRowsIsEmpty()
    {
        $rule = $this->createRuleMock([1]);
        $rule
            ->shouldReceive('getCategoriesRelationRows')
            ->withAnyArgs()
            ->andReturn(collect());
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPassesReturnsFalseWhenHasCategoriesWithoutGenres()
    {
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getCategoriesRelationRows')
            ->withAnyArgs()
            ->andReturn(collect(['category_id' => 1]));
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPassesIsValid()
    {
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getCategoriesRelationRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1],
                ['category_id' => 2],
            ]));
        $this->assertTrue($rule->passes('', [1]));

        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getCategoriesRelationRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1],
                ['category_id' => 2],
                ['category_id' => 1],
                ['category_id' => 2],
            ]));
        $this->assertTrue($rule->passes('', [1]));
    }

    /**
     * Create mock of class GenresHasCategoriesRule
     *
     * @param array $categoriesId
     * @return MockInterface|GenresHasCategoriesRule
     */
    protected function createRuleMock(array $categoriesId): MockInterface
    {
        return \Mockery::mock(GenresHasCategoriesRule::class, [$categoriesId])
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
    }
}
