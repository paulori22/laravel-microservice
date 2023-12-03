<?php

namespace App\Observers;

use Bschmitt\Amqp\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SyncModelObserver
{
    public function created(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $id = $model->id;
            $this->reportException([
                'modelName' => $modelName,
                'id' => $id,
                'action' => $action,
                'exception' => $e
            ]);
        }
    }

    public function updated(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = $model->toArray();
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $id = $model->id;
            $this->reportException([
                'modelName' => $modelName,
                'id' => $id,
                'action' => $action,
                'exception' => $e
            ]);
        }
    }

    public function deleted(Model $model)
    {
        $modelName = $this->getModelName($model);
        $data = ['id' => $model->id];
        $action = __FUNCTION__;
        $routingKey = "model.{$modelName}.{$action}";
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $id = $model->id;
            $this->reportException([
                'modelName' => $modelName,
                'id' => $id,
                'action' => $action,
                'exception' => $e
            ]);
        }
    }

    public function belongsToManyAttached($relation, $model, $ids)
    {
        $modelName = $this->getModelName($model);
        $relationName = Str::snake($relation);
        $action = "attached";
        $routingKey = "model.{$modelName}_{$relationName}.{$action}";
        $data = [
            'id' => $model->id,
            'relation_ids' => $ids
        ];
        try {
            $this->publish($routingKey, $data);
        } catch (\Exception $e) {
            $id = $model->id;
            $this->reportException([
                'modelName' => $modelName,
                'id' => $id,
                'action' => $action,
                'exception' => $e
            ]);
        }
    }

    public function restored(Model $model)
    {
        //
    }

    public function forceDeleted(Model $model)
    {
        //
    }

    protected function getModelName(Model $model)
    {
        $shorName = (new \ReflectionClass($model))->getShortName();

        return  Str::snake($shorName);
    }

    protected function publish($routingKey, array $data)
    {
        $message = new Message(
            json_encode($data),
            [
                'content_type' => 'application/json',
                'delivery_mode' => 2
            ]
        );

        \Amqp::publish(
            $routingKey,
            $message,
            [
                'exchange_type' => 'topic',
                'exchange' => 'amq.topic'
            ]
        );
    }

    protected function reportException(array $params)
    {
        list(
            'modelName' => $modelName,
            'id' => $id,
            'action' => $action,
            'exception' => $exception
        ) = $params;
        $myExeption = new \Exception("The model {$modelName} with ID $id not synced on $action", 0, $exception);
        report($myExeption);
    }
}
