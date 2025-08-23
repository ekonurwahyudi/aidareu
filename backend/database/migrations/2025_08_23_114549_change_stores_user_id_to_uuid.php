<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Drop existing foreign key if exists
            $table->dropForeign(['user_id']);
        });

        // Update existing data to use UUIDs
        DB::statement('
            UPDATE stores 
            SET user_id = (
                SELECT u.uuid::text 
                FROM users u 
                WHERE u.id::text = stores.user_id::text
            )
        ');

        Schema::table('stores', function (Blueprint $table) {
            // Change user_id column to UUID
            $table->uuid('user_id')->change();
            
            // Add foreign key constraint to users.uuid
            $table->foreign('user_id')->references('uuid')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Drop UUID foreign key
            $table->dropForeign(['user_id']);
        });

        // Update data back to integer IDs
        DB::statement('
            UPDATE stores 
            SET user_id = (
                SELECT u.id::text 
                FROM users u 
                WHERE u.uuid = stores.user_id::uuid
            )
        ');

        Schema::table('stores', function (Blueprint $table) {
            // Change user_id back to bigint
            $table->bigInteger('user_id')->change();
            
            // Add foreign key constraint to users.id
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};