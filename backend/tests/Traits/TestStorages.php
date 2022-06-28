<?php

declare(strict_types=1);

namespace Tests\Traits;

use Illuminate\Foundation\Testing\TestResponse;

trait TestStorages
{
    protected function deleteAllFiles()
    {
        $dirs = \Storage::directories();
        foreach ($dirs as $dir) {
            $files = \Storage::files($dir);
            \Storage::delete($files);
            \Storage::deleteDirectory($dir);
        }
    }
}
