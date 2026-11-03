<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['todo', 'done'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = $request->user()->tasks()->latest();
        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $tasks = $query->paginate((int) ($validated['per_page'] ?? 15));

        return response()->json([
            'success' => true,
            'message' => 'Daftar task berhasil dimuat.',
            'data' => TaskResource::collection($tasks->getCollection())->resolve($request),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil dibuat.',
            'data' => (new TaskResource($task))->resolve($request),
        ], 201);
    }

    public function show(Request $request, string $task): JsonResponse
    {
        $item = $this->ownedTask($request, $task);

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil dimuat.',
            'data' => (new TaskResource($item))->resolve($request),
        ]);
    }

    public function update(UpdateTaskRequest $request, string $task): JsonResponse
    {
        $item = $this->ownedTask($request, $task);
        $item->update($request->validated());
        $item->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil diperbarui.',
            'data' => (new TaskResource($item))->resolve($request),
        ]);
    }

    public function destroy(Request $request, string $task): JsonResponse
    {
        $this->ownedTask($request, $task)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil dihapus.',
            'data' => null,
        ]);
    }

    public function updateStatus(Request $request, string $task): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['todo', 'done'])],
        ]);

        $item = $this->ownedTask($request, $task);
        $item->update(['status' => $validated['status']]);
        $item->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Status task berhasil diperbarui.',
            'data' => (new TaskResource($item))->resolve($request),
        ]);
    }

    private function ownedTask(Request $request, string $id): Task
    {
        return $request->user()->tasks()->findOrFail($id);
    }
}
