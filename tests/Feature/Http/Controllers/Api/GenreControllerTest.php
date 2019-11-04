<?php

namespace Tests\Feature\Http\Controllers\Api;


use App\Http\Controllers\GenreController;
use App\Http\Resources\GenreResource;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\TestCase;

use Tests\Traits\TestResource;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;


class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResource;

    private $genre;

    private $serializedFields = [
        'id',
        'name',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]


        ]
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this-> genre = factory(Genre::class)->create();
    }



    public function testIndex()
    {

        $response = $this->get(route('genres.index'));

        $response
            ->assertStatus(200)
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [

                    '*' => $this->serializedFields
                ],

                'links' => [],
                'meta'  => [],
            ]);

        $this->assertResource($response, GenreResource::collection(collect([$this->genre])));




    }

    public function testShow()
    {

        $response = $this->get(route('genres.show', [ 'genre' => $this->genre->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields

            ]);



        $id = $response->json('data.id');
        $resource = new GenreResource(Genre::find($id));

        $this->assertResource($response, $resource);
    }

    public function testInvalidationData() {

        $data = [
            'name'   => '',
            'categories_id' => ''
        ];

        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

        $data = [
            'name'   => str_repeat('a', 256)
        ];

        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);

        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);

        $data = [
            'is_active'   => 'a'
        ];

        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');

        $data = [
            'categories_id'   => 'a'
        ];

        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id'   => [100]
        ];

        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $category = factory(Category::class)->create();

        $category->delete();

        $data = [
            'categories_id'   => [$category->id]
        ];

        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testStore() {

        $categoryId = factory(Category::class)->create()->id;

        $data = [
            'name' => 'test'
        ];

        $response =$this->assertStore($data + ['categories_id'   => [$categoryId]] ,
            $data + [ 'is_active' => true, 'deleted_at'=> null]);

        $response->assertJsonStructure([
           'data' => $this->serializedFields
        ]);

        $this->assertHasCategory($response->json('data.id'), $categoryId);

        $this->assertResource($response, new GenreResource(Genre::find($response->json('data.id'))));

        $data = [
            'name' => 'test',
            'is_active' => false
        ];

        $this->assertStore($data + ['categories_id'   => [$categoryId]],
            $data + [ 'is_active' => false]);
    }

    public function testUpdate() {

        $categoryId = factory(Category::class)->create()->id;

        $data = [
            'name' => 'test',
            'is_active' => true
        ];

        $response = $this->assertUpdate($data + ['categories_id'   => [$categoryId]],
            $data + [ 'deleted_at' => null]);

        $response->assertJsonStructure([
            'data' => $this->serializedFields
        ]);

        $this->assertResource($response, new GenreResource(Genre::find($response->json('data.id'))));

        $this->assertHasCategory($response->json('data.id'), $categoryId);
    }



    public function testSyncCategories()
    {
       $categoriesId =  factory(Category::class, 3)->create()->pluck('id')->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id'   => [$categoriesId[0]]
        ];

        $response = $this->json('POST', $this->routeStore(), $sendData);

        $this->assertHasCategory($response->json('data.id'), $categoriesId[0]);

        $sendData = [
            'name' => 'test',
            'categories_id'   => [$categoriesId[1], $categoriesId[2]]
        ];

        $response = $this->json(
            'PUT',
            route('genres.update', ['genre' => $response->json('data.id')]),
            $sendData);

        $this->assertMissingHasCategory($response->json('data.id'), $categoriesId[0]);

        $this->assertHasCategory($response->json('data.id'), $categoriesId[1]);

        $this->assertHasCategory($response->json('data.id'), $categoriesId[2]);

    }

    public function assertHasCategory($genreId, $categoryId) {

        $this->assertDatabaseHas( 'category_genre',
            ['genre_id' => $genreId,
                'category_id' => $categoryId]);
    }

    public function assertMissingHasCategory($genreId, $categoryId) {

        $this->assertDatabaseMissing( 'category_genre',
            ['genre_id' => $genreId,
                'category_id' => $categoryId]);
    }

    public function testRollBackStore()
    {
        $controller = \Mockery::mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(
                ['name' => 'test']
            );

        $controller
            ->shouldReceive('rulesStore')
            ->withAnyArgs()
            ->andReturn([]);

        $controller
            ->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);

        $hasError = false;

        try {
            $controller->store($request);

        } catch ( TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;

        }

        $this->assertTrue($hasError);


    }


    public function testRollBackUpdate()
    {
        $controller = \Mockery::mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('findOrFail')
            ->withAnyArgs()
            ->andReturn(
                $this->genre
            );



        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(
                ['name' => 'test']
            );

        $controller
            ->shouldReceive('rulesUpdate')
            ->withAnyArgs()
            ->andReturn([]);

        $controller
            ->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);

        $hasError = false;

        try {
            $controller->update($request, 1);

        } catch ( TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;

        }

        $this->assertTrue($hasError);


    }




    public function testDelete() {



        $response = $this->json(
            'DELETE',
            route('genres.destroy', ['genre' => $this->genre->id]));

        $response->assertStatus(204);

        $this->assertNull(Genre::find($this->genre->id));
        $this->assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }



    protected function routeStore() {

        return route('genres.store');
    }

    protected function routeUpdate() {
        return route('genres.update', ['genre' => $this->genre->id]);

    }

    protected function model() {

        return Genre::class;
    }
}
