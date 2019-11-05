<?php

namespace Tests\Feature\Models;


use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR
        ]);

        $castMembers = CastMember::all();

        $this->assertCount(1, $castMembers);

        $memberKey = array_keys($castMembers->first()->getAttributes());

        $this->assertEqualsCanonicalizing(
            [
                'id',
                'name',
                'type',
                'deleted_at',
                'created_at',
                'updated_at'
            ],
            $memberKey

        );
    }

    public function testCreate() {

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR
        ]);

        $castMember->refresh();

        $this->assertEquals(36, strlen($castMember->id));
        $this->assertEquals('test1', $castMember->name);
        $this->assertEquals(CastMember::TYPE_DIRECTOR, $castMember->type);

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_ACTOR
        ]);

        $this->assertEquals(CastMember::TYPE_ACTOR, $castMember->type);


    }

    public function testUpdate()
    {
        $member = factory(CastMember::class, 1)->create([
            'type' => CastMember::TYPE_DIRECTOR
        ])->first();

        $data = [
            'name' => 'test_name_updated',
            'type' => CastMember::TYPE_ACTOR
        ];

        $member->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value,$member->{$key});

        }

    }

    public function testDelete() {
        $member = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_DIRECTOR
        ]);

        $member->delete();
        $this->assertNull(CastMember::find($member->id));

        $member->restore();
        $this->assertNotNull(CastMember::find($member->id));


    }
}
