<?php

declare(strict_types=1);

namespace Tests\Traits;

trait TestProd
{
    protected function skipTestIfNotProd($message = '')
    {
        if (!$this->istTestingProd()) {
            $this->markTestSkipped($message);
        }
    }

    protected function istTestingProd()
    {
        return env('TESTING_PROD') !== false;
    }
}
