<?php

namespace Tests\Unit\Models;


use App\Models\CastMember;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CastMemberTest extends TestCase
{
    private $member;

    protected function setUp(): void
    {
        parent::setUp();
        $this->member = new CastMember();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name',  'type'];

        $this->assertEquals($fillable, $this->member->getFillable());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];

        foreach ($dates as $date) {
            $this->assertContains($date,  $this->member->getDates());

        }


    }

    public function testIfUseTraits()
    {

        $traits = [
            SoftDeletes::class,
            Uuid::class

        ];

        $categoryTraits = array_keys(class_uses(CastMember::class));

        foreach ( $traits as $trait) {

            $this->assertContains($trait,  $categoryTraits);
        }


    }

    public function testCatsAttribute() {
        $casts = ['id' => 'string', 'type' => 'integer'];

        $this->assertEquals($casts, $this->member->getCasts());
    }

    public function testIncremeting() {
        $member = new CastMember();
        $this->assertFalse($member->incrementing);
    }
}
