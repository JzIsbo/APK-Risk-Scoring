<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::orderBy('name')->get();
        return response()->json($users);
    }

    /**
     * Store a newly created user in database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,analyst,management',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User baru berhasil dibuat!',
            'data' => $user
        ], 201);
    }

    /**
     * Update the specified user in database.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:admin,analyst,management',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Informasi user berhasil diperbarui!',
            'data' => $user
        ]);
    }

    /**
     * Remove the specified user from database.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri!'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus!'
        ]);
    }
}
