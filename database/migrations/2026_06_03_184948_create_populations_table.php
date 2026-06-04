<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('populations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('dti', 5, 2); // Debt to income %
            $table->integer('payment_delay'); // Days
            $table->integer('credit_score'); // Credit rating
            $table->integer('age'); // Age in years
            $table->decimal('co_burden', 5, 2); // CO Burden %
            $table->decimal('risk_score', 5, 2)->nullable(); // Calculated cumulative score
            $table->string('risk_level')->nullable(); // Low, Medium, High
            $table->string('status')->default('No Order'); // No Order, Active, Settled
            $table->string('co_class')->default('PR-1'); // PR-1, PR-2, PR-3
            $table->string('payment_pattern')->default('L1'); // L1, L2, L3, L4, L5
            $table->string('ps_ambc')->default('PS-1'); // PS-1, PS-2, PS-3, PS-4
            $table->string('period')->default('2026-04'); // YYYY-MM
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('populations');
    }
};
