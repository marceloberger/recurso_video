<?php

namespace App\Http\Controllers;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;


class GenreController extends BasicCrudController
{

    private $rules = [
        'name' => 'required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
    ];


    public function store(Request $request)
    {

        /** @var genre $obj */
        $validateData = $this->validate($request, $this->rulesStore());

        $self = $this;

        $obj = \DB::transaction(function () use ($request, $validateData, $self) {

            $obj = $this->model()::create($validateData);

            $self->handleRelations($obj, $request);

            return $obj;

        });

        $obj->refresh();
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function update(Request $request, $id)
    {
        /** @var video $obj */
        $obj = $this->findOrFail($id);
        $validateData = $this->validate($request, $this->rulesUpdate());

        $self = $this;

        $obj = \DB::transaction(function () use ($request, $validateData, $self, $obj) {

            $obj->update($validateData);

            $self->handleRelations($obj, $request);

            return $obj;

        });

        $resource = $this->resource();
        return new $resource($obj);


    }

    protected function  handleRelations($video, Request $request)
    {
        $video->categories()->sync($request->get('categories_id'));


    }

    protected function model()
    {
        return Genre::class;
    }


    protected function rulesStore()
    {
        return $this->rules;

    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }

    protected function resource()
    {
        return GenreResource::class;
    }

    protected function resourceCollection()
    {
        return $this->resource();
    }

    protected function queryBuilder(): Builder
    {
        return parent::queryBuilder()->with('categories');
    }
}
