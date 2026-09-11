<?php

namespace App\Http\Controllers;

use App\Models\GroupDebt;
use Illuminate\Http\Request;

class GroupDebtController extends Controller
{
	public function index()
	{
		return response()->json(GroupDebt::all());
	}

	public function store(Request $request)
	{
		$data = $request->validate([
			'group_id' => ['required', 'integer'],
			'user_id' => ['required', 'integer'],
			'amount' => ['required', 'numeric', 'min:0'],
			'description' => ['nullable', 'string'],
			'status' => ['nullable', 'string'],
		]);

		return response()->json(GroupDebt::create($data), 201);
	}

	public function show(GroupDebt $groupDebt)
	{
		return response()->json($groupDebt);
	}

	public function update(Request $request, GroupDebt $groupDebt)
	{
		$data = $request->validate([
			'group_id' => ['sometimes', 'integer'],
			'user_id' => ['sometimes', 'integer'],
			'amount' => ['sometimes', 'numeric', 'min:0'],
			'description' => ['nullable', 'string'],
			'status' => ['nullable', 'string'],
		]);

		$groupDebt->update($data);

		return response()->json($groupDebt);
	}

	public function destroy(GroupDebt $groupDebt)
	{
		$groupDebt->delete();

		return response()->json(null, 204);
	}
}
