<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $data = parent::toArray($request);
        $data['genres'] = GenreResource::collection($this->resource->genres);
        $data['categories'] = CategoryResource::collection($this->resource->categories);
        $data['video_file_url'] = $this->resource->video_file_url;
        $data['thumb_file_url'] = $this->resource->thumb_file_url;
        $data['trailer_file_url'] = $this->resource->trailer_file_url;
        $data['banner_file_url'] = $this->resource->banner_file_url;
        return $data;
    }
}
