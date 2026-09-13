<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\CategoryService;
use CategoryRequest;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
	public function __construct(public CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }
	public function index()
	{
		$categories = Category::all();

		return view('categories.index', compact('categories'));
	}

	public function create()
	{
		return view('categories.create');
	}

	public function store( $request)
	{
		$validatedData = $request->validated();

        $account = $this->categoryService->create($validatedData);
    
        return $account;
	}

	public function show(Category $category)
	{
		return view('categories.show', compact('category'));
	}

	public function edit(Category $category)
	{
		return view('categories.edit', compact('category'));
	}

	public function update(Request $request, Category $category)
	{
		$validated = $request->validate([
			'name' => ['required', 'string', 'max:255'],
		]);

		$category->update($validated);

		return redirect()->route('categories.index')
			->with('success', 'Categoría actualizada correctamente.');
	}

	public function destroy(Category $category)
	{
		$category->delete();

		return redirect()->route('categories.index')
			->with('success', 'Categoría eliminada correctamente.');
	}
}
