<?php

namespace App\Services;

use App\Models\Category;

class CategoryService
{
    /**
     * Create a new category.
     */
    public function create(array $data)
    {
        return Category::create($data);
    }

    /**
     * Update a category.
     */
    public function update(array $data)
    {
        $category = Category::findOrFail($data['id']);
        $category->update($data);
        return $category;
    }
}
