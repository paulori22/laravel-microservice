<?php

use App\Models\Category;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['namespace' => 'Api'], function () {
    $exceptAndEdit = [
        'except' => ['create', 'edit']
    ];
    Route::resource('categories', 'CategoryController', $exceptAndEdit);
    Route::resource('genres', 'GenreController', $exceptAndEdit);
    Route::resource('cast_members', 'CastMemberController', $exceptAndEdit);
    Route::resource('videos', 'VideoController', $exceptAndEdit);
});
