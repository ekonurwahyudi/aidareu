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
        // First, update existing data to use UUID references
        DB::statement("
            UPDATE stores 
            SET user_id = users.uuid::uuid 
            FROM users 
            WHERE stores.user_id::text = users.id::text
        ");
        
        Schema::table('stores', function (Blueprint $table) {
            // Drop existing foreign key constraint if it exists
            try {
                $table->dropForeign(['user_id']);
            } catch (Exception $e) {
                // Foreign key might not exist, continue
            }
            
            // Change user_id to UUID type to match users.uuid (if not already UUID)
            // Skip this if already UUID type
            
            // Recreate the foreign key constraint to reference users.uuid instead of users.id
            $table->foreign('user_id')->references('uuid')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Drop the UUID foreign key
            $table->dropForeign(['user_id']);
            
            // Change user_id back to integer
            $table->unsignedBigInteger('user_id')->change();
            
            // Recreate the foreign key constraint to reference users.id
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
