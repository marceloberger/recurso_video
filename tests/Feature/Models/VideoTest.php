<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;


class VideoTest extends TestCase
{
    use DatabaseMigrations;


    public function testList()
    {
        $video = Video::create([
            'title' => 'test1',
            'description' => 'test2_description',
            'year_launched' => 1989,
            'opened' => true,
            'rating' => Video::RATING_LIST[0],
            'duration' => 15
        ]);

        $videos = Video::all();

        $this->assertCount(1, $videos);

        $videosKey = array_keys($videos->first()->getAttributes());

        $this->assertEqualsCanonicalizing(
            [
                'id' ,
                'title',
               'description' ,
                'year_launched' ,
                'opened' ,
                'rating' ,
                'duration',
                'deleted_at',
                'created_at',
                'updated_at'
            ],
            $videosKey

        );
    }

    public function testCreate() {

        $video = Video::create([
            'title' => 'test1',
            'description' => 'test2_description',
            'year_launched' => 1989,
            'opened' => true,
            'rating' => Video::RATING_LIST[0],
            'duration' => 15
        ]);

        $video->refresh();

        $this->assertEquals(36, strlen($video->id));
        $this->assertEquals('test1', $video->title);
        $this->assertEquals('test2_description', $video->description);
        $this->assertEquals(1989, $video->year_launched);
        $this->assertTrue($video->opened);
        $this->assertEquals(15, $video->duration);
        $this->assertEquals(Video::RATING_LIST[0], $video->rating);

        $video = Video::create([
            'title' => 'test1',
            'description' => null,
            'year_launched' => 1989,
            'opened' => false,
            'rating' => Video::RATING_LIST[0],
            'duration' => 15
        ]);

        $this->assertNull($video->description);


        $video = Video::create([
            'title' => 'test1',
            'description' => 'test2_description',
            'year_launched' => 1989,
            'opened' => false,
            'rating' => Video::RATING_LIST[0],
            'duration' => 15
        ]);

        $this->assertFalse($video->opened);

        $video = Video::create([
            'title' => 'test1',
            'description' => 'test2_description',
            'year_launched' => 1989,
            'opened' => true,
            'rating' => Video::RATING_LIST[0],
            'duration' => 15
        ]);

        $this->assertTrue($video->opened);

    }

    public function testUpdate()
    {
        $video = factory(Video::class, 1)->create([
            'description' => 'test2_description',
            'opened' => false
        ])->first();

        $data = [
            'title' => 'title_updated',
            'description' => 'description_updated',
            'year_launched' => 1989,
            'opened' => true,
            'rating' => Video::RATING_LIST[1],
            'duration' => 20
        ];

        $video->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});

        }

    }

    public function testDelete() {

        $video = Video::create([
            'title' => 'test1',
            'description' => 'test2_description',
            'year_launched' => 1989,
            'opened' => true,
            'rating' => Video::RATING_LIST[0],
            'duration' => 15
        ]);

        $video->delete();
        $this->assertNull(Video::find($video->id));

        $video->restore();
        $this->assertNotNull(Video::find($video->id));


    }


}
