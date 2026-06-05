<?php

namespace App\Http\Controllers;

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
        // Restrict to admins
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        $users = User::orderBy('name')->get();
        return view('user.index', compact('users'));
    }

    /**
     * Store a newly created user in database.
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,analyst,management',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User baru berhasil dibuat!');
    }

    /**
     * Update the specified user in database.
     */
    public function update(Request $request, User $user)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

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

        return redirect()->route('users.index')->with('success', 'Informasi user berhasil diperbarui!');
    }

    /**
     * Remove the specified user from database.
     */
    public function destroy(User $user)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['general_error' => 'Anda tidak dapat menghapus akun Anda sendiri!']);
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus!');
    }
}
