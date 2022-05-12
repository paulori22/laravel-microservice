<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VideoController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_release' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => ['required', Rule::in(Video::RATING_LIST)],
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id',
            'genres_id' => 'required|array|exists:genres,id',
        ];
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->rulesStore());
        $obj = \DB::transaction(function () use ($request, $validatedData) {
            /** @var Video $obj */
            $obj = $this->model()::create($validatedData);
            $obj->categories()->sync($request->get('categories_id'));
            $obj->genres()->sync($request->get('genres_id'));
            return $obj;
        });
        $obj->refresh();
        return $obj;
    }

    public function update(Request $request, $id)
    {
        $obj = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->rulesUpdate());
        $obj->update($validatedData);
        $obj->categories()->sync($request->get('categories_id'));
        $obj->genres()->sync($request->get('genres_id'));
        return $obj;
    }

    protected function model()
    {
        return Video::class;
    }

    protected function rulesStore()
    {
        return $this->rules;
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }
}
