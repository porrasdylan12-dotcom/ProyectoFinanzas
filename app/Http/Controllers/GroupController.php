<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;

class GroupController extends Controller
{
	/**
	 * Display a listing of the groups.
	 */
	public function index()
	{
		return view('groups.index');
	}

	/**
	 * Store a newly created group.
	 */
	public function store(Request $request)
	{
		$validated = $request->validate([
			'name' => ['required', 'string', 'max:255'],
		]);

		Group::create($validated);
		return redirect()->route('groups.index');
	}
}
