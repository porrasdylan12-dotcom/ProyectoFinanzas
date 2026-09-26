<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Attributes\Controllers\Authorize;

class CategoryController extends Controller
{
    public function __construct(public CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->all();
        $filters['user_id'] = $request->user()->id;

        return CategoryResource::collection($this->categoryService->list($filters));
    }

    #[Authorize('create', Category::class)]
    public function store(CategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $category = $this->categoryService->create($data);

        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.categories.show', $category));
    }

    #[Authorize('view', 'category')]
    public function show(Request $request, Category $category): CategoryResource
    {
        $category = $this->categoryService->findForUser($category->id, $request->user()->id);

        return new CategoryResource($category);
    }

    #[Authorize('update', 'category')]
    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $category = $this->categoryService->update($category, $request->validated());

        return new CategoryResource($category);
    }

    #[Authorize('delete', 'category')]
    public function destroy(Request $request, Category $category): JsonResponse
    {
        $category = $this->categoryService->findForUser($category->id, $request->user()->id);
        $this->categoryService->delete($category);

        return response()->json(null, 204);
    }
}
