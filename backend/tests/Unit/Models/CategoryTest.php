<?php

namespace Tests\Unit\Models;


use App\Models\Category;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;


class CategoryTest extends TestCase
{

    private $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = new Category();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'description', 'is_active'];

        $this->assertEquals($fillable, $this->category->getFillable());
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];

        foreach ($dates as $date) {
            $this->assertContains($date,  $this->category->getDates());

        }


    }

    public function testIfUseTraits()
    {

        $traits = [
            SoftDeletes::class,
            Uuid::class
        ];

        $categoryTraits = array_keys(class_uses(Category::class));

        foreach ( $traits as $trait) {

            $this->assertContains($trait,  $categoryTraits);
        }


    }

    public function testCatsAttribute() {
        $casts = ['id' => 'string', 'is_active' => 'boolean'];

        $this->assertEquals($casts, $this->category->getCasts());
    }

    public function testIncremeting() {
        $category = new Category();
        $this->assertFalse($category->incrementing);
    }

}
