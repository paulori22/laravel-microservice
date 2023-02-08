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
    Route::delete('categories', 'CategoryController@destroyCollection');
    Route::resource('genres', 'GenreController', $exceptAndEdit);
    Route::delete('genres', 'GenreController@destroyCollection');
    Route::resource('cast_members', 'CastMemberController', $exceptAndEdit);
    Route::delete('cast_members', 'CastMemberController@destroyCollection');
    Route::resource('videos', 'VideoController', $exceptAndEdit);
    Route::delete('videos', 'VideoController@destroyCollection');
});
