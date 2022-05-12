<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Models\Video;
use Faker\Generator as Faker;

$factory->define(Video::class, function (Faker $faker) {
    $random_rating = Video::RATING_LIST[array_rand(Video::RATING_LIST)];
    return [
        'title' => $faker->sentence(3),
        'description' => $faker->sentence(10),
        'year_release' => rand(1895, 2022),
        'opened' => rand(0, 1),
        'rating' => $random_rating,
        'duration' => rand(30, 4 * 60)
    ];
});
