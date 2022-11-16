<?php

use App\Models\CastMember;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;

class VideoSeeder extends Seeder
{
    private $allGenres;
    private $allCastMembers;
    private $relations = [
        'genres_id' => [],
        'categories_id' => [],
        'cast_members_id' => []
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = \Storage::getDriver()->getAdapter()->getPathPrefix();
        \File::deleteDirectory($dir, true);
        $this->allGenres = Genre::all();
        $this->allCastMembers = CastMember::all();
        Model::reguard(); // active mass assignment on seed
        factory(Video::class, 100)
            ->make()
            ->each(function (Video $video) {
                $this->fetchRelations();
                Video::create(
                    array_merge(
                        $video->toArray(),
                        [
                            'video_file' => $this->getVideoFile(),
                            'thumb_file' => $this->getImageFile(),
                            'banner_file' => $this->getImageFile(),
                            'trailer_file' => $this->getVideoFile(),
                        ],
                        $this->relations
                    )
                );
            });
        Model::unguard();
    }

    public function fetchRelations()
    {
        $subGenres = $this->allGenres->random(5)->load('categories');
        $categoriesId = [];
        foreach ($subGenres as $genre) {
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }
        $categoriesId = array_unique($categoriesId);
        $genresId = $subGenres->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
        $this->relations['cast_members_id'] = $this->allCastMembers->random(3)->pluck('id')->toArray();
    }

    public function getImageFile()
    {
        return new UploadedFile(
            storage_path('faker/thumbs/atlantis_nexus_nebula.jpg'),
            'atlantis_nexus_nebula.jpg'
        );
    }

    public function getVideoFile()
    {
        return new UploadedFile(
            storage_path('faker/videos/Doom_Eternal.mp4'),
            'Doom_Eternal.mp4'
        );
    }
}
