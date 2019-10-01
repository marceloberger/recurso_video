<?php

namespace Tests\Unit\Models;


use App\Models\Traits\Uuid;
use App\Models\Video;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;




class VideoTest extends TestCase
{
    private $video;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testFillableAttribute()
    {
        $fillable = ['title', 'description', 'year_launched', 'opened', 'rating', 'duration'];

        $this->assertEquals($fillable, $this->video->getFillable());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];

        foreach ($dates as $date) {
            $this->assertContains($date,  $this->video->getDates());

        }


    }

    public function testIfUseTraits()
    {

        $traits = [
            SoftDeletes::class,
            Uuid::class
        ];

        $videoTraits = array_keys(class_uses(Video::class));

        foreach ( $traits as $trait) {

            $this->assertContains($trait,  $videoTraits);
        }


    }

    public function testCatsAttribute() {

        $casts = ['id' => 'string', 'opened' => 'boolean', 'year_launched' => 'integer', 'duration' => 'integer'];

        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testIncremeting() {
        $video = new Video();
        $this->assertFalse($video->incrementing);
    }
}
