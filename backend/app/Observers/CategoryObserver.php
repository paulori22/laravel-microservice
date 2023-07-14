<?php

namespace App\Observers;

use App\Models\Category;

class CategoryObserver
{
    public function created(Category $category)
    {
        $message = $category->toJson();
        \Amqp::publish('model.category.created', $message);
    }

    public function updated(Category $category)
    {
        $message = $category->toJson();
        \Amqp::publish('model.category.updated', $message);
    }

    public function deleted(Category $category)
    {
        $message = json_encode(['id' => $category->id]);
        \Amqp::publish('model.category.deleted', $message);
    }

    public function restored(Category $category)
    {
        //
    }

    public function forceDeleted(Category $category)
    {
        //
    }
}
