<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Arr;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Traits\TestResource;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerCrudTest extends BaseVideoControllerTestCase
{


    use TestValidations, TestSaves, TestResource;

    private $serializedFields = [
        'id',
        'title',
        'description',
        'year_launched',
        'rating',
        'duration',
        'opened',
        'video_file_url',
        'thumb_file_url',
        'trailer_file_url',
        'banner_file_url',
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


        ],
        'genres' => [
            '*' => [
                'id',
                'name',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]


        ]

    ];

    public function testIndex()
    {

        $response = $this->get(route('video.index'));

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

        $this->assertResource($response, VideoResource::collection(collect([$this->video])));


    }

    public function testShow()
    {

        $response = $this->json('GET', route('video.show', [ 'video' => $this->video->id]));

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => $this->serializedFields

            ]);

        $id = $response->json('data.id');
        $resource = new VideoResource(Video::find($id));

        $this->assertResource($response, $resource);




    }

    public function testInvalidationRequired() {

        $data = [
            'title'   => '',
            'description'   => '',
            'year_launched'   => '',
            'rating'   => '',
            'duration'  => '',
            'categories_id' => '',
            'genres_id' => '',
        ];

        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');


    }

    public function testInvalidationMax() {

        $data = [
            'title'   => str_repeat('a', 256)
        ];

        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger() {

        $data = [
            'duration'   => 's'
        ];

        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunchedField() {

        $data = [
            'year_launched'   => 'a'
        ];

        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField() {

        $data = [
            'opened'   => 's'
        ];

        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationRatingField() {

        $data = [
            'rating'   => 0
        ];

        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testInvalidationCategoriesField() {

        $data = [
            'categories_id' => 'a',
        ];

        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => [100],
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


    public function testInvalidationGenresField() {

        $data = [
            'genres_id' => 'a',
        ];

        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'genres_id' => [100],
        ];

        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genre = factory(Genre::class)->create();

        $genre->delete();

        $data = [
            'genres_id'   => [$genre->id]
        ];

        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');



    }

    public function testSaveWithoutFiles()
    {

        $testData = Arr::except($this->sendData, ['categories_id', 'genres_id']);
        $data = [

            [
                'send_data' => $this->sendData ,
                'test_data' => $testData + ['opened' => false]
            ],
            [
                'send_data' => $this->sendData + [
                        'opened' => true,
                    ],
                'test_data' => $testData + ['opened' => true]
            ],
            [
                'send_data' => $this->sendData + [
                        'rating' => Video::RATING_LIST[1],
                    ],
                'test_data' => $testData + ['rating' => Video::RATING_LIST[1]]
            ],
        ];

        foreach ( $data as $key => $value) {

            $response =$this->assertStore($value['send_data'] ,
                $value['test_data'] + ['deleted_at'=> null]);

            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);



            $this->assertResource($response, new VideoResource(Video::find($response->json('data.id'))));

            $this->assertHasCategory($response->json('data.id'), $value['send_data']['categories_id'][0] );

            $this->assertHasGenre($response->json('data.id'), $value['send_data']['genres_id'][0] );

            $response =$this->assertUpdate($value['send_data'] ,
                $value['test_data'] + ['deleted_at'=> null]);

            $response->assertJsonStructure([
                'data' => $this->serializedFields
            ]);



            $this->assertResource($response, new VideoResource(Video::find($response->json('data.id'))));

            $this->assertHasCategory($response->json('data.id'), $value['send_data']['categories_id'][0] );

            $this->assertHasGenre($response->json('data.id'), $value['send_data']['genres_id'][0] );

        }

    }


    public function assertHasCategory($videoId, $categoryId) {

        $this->assertDatabaseHas( 'category_video',
            ['video_id' => $videoId,
                'category_id' => $categoryId]);
    }

    public function assertHasGenre($videoId, $genreId) {

        $this->assertDatabaseHas( 'genre_video',
            ['video_id' => $videoId,
                'genre_id' => $genreId]);
    }

    public function assertMissingHasCategory($videoId, $categoryId) {

        $this->assertDatabaseMissing( 'category_video',
            ['video_id' => $videoId,
                'category_id' => $categoryId]);
    }


    public function assertMissingHasGenre($videoId, $genreId) {

        $this->assertDatabaseMissing( 'genre_video',
            ['video_id' => $videoId,
                'genre_id' => $genreId]);
    }



    public function testDelete() {

        $response = $this->json(
            'DELETE',
            route('video.destroy', ['video' => $this->video->id]));

        $response->assertStatus(204);

        $this->assertNull(Video::find($this->video->id));
        $this->assertNotNull(Video::withTrashed()->find($this->video->id));
    }


    protected function routeStore() {

        return route('video.store');
    }

    protected function routeUpdate() {
        return route('video.update', ['video' => $this->video->id]);

    }

    protected function model() {

        return Video::class;
    }



}
