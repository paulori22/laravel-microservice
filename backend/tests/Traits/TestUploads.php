<?php

namespace Tests\Traits;

use App\Models\Video;
use Illuminate\Http\UploadedFile;

trait TestUploads
{
    protected function assertInvalidationFile($field, $extension, $maxSize, $rule, $ruleParams = [])
    {
        $routes = [
            [
                'method' => 'POST',
                'route' => $this->routeStore()
            ],
            [
                'method' => 'PUT',
                'route' => $this->routeUpdate()
            ],
        ];

        foreach ($routes as $route) {
            $file = "not_a_file";
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);
            $this->assertInvalidationFields($response, [$field], 'file');

            $file = UploadedFile::fake()->create("$field.other$extension");
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);

            $this->assertInvalidationFields($response, [$field], $rule, $ruleParams);

            $file = UploadedFile::fake()->create("$field.$extension")->size($maxSize + 1);
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);

            $this->assertInvalidationFields($response, [$field], 'max.file', ['max' => $maxSize]);
        }
    }

    protected function assertFilesExistInStorage(Video $model, array $files)
    {
        /** @var UploadFiles $model */
        foreach ($files as $file) {
            \Storage::assertExists($model->relativeFilePath($file->hashName()));
        }
    }
}
