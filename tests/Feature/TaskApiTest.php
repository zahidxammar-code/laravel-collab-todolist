<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_and_list_own_tasks(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/tasks', ['title' => 'Tes task'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Tes task')
            ->assertJsonPath('data.status', 'todo');

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_cannot_access_another_users_task(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $task = Task::create(['user_id' => $owner->id, 'title' => 'Private task']);

        $this->actingAs($other, 'sanctum')
            ->getJson('/api/tasks/'.$task->id)
            ->assertNotFound();
    }

    public function test_title_is_required(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/tasks', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }
}
