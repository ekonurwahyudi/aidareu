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
            // Drop existing foreign key constraint if it exists
            try {
                $table->dropForeign(['user_id']);
            } catch (Exception $e) {
                // Foreign key might not exist, continue
            }
        });
        
        // Add a temporary UUID column
        Schema::table('stores', function (Blueprint $table) {
            $table->uuid('user_uuid_temp')->nullable();
        });
        
        // Update the temporary column with UUID values from users table
        DB::statement("
            UPDATE stores 
            SET user_uuid_temp = users.uuid 
            FROM users 
            WHERE stores.user_id = users.id
        ");
        
        Schema::table('stores', function (Blueprint $table) {
            // Drop the old user_id column
            $table->dropColumn('user_id');
            
            // Rename the temporary column to user_id
            $table->renameColumn('user_uuid_temp', 'user_id');
        });
        
        Schema::table('stores', function (Blueprint $table) {
            // Make user_id not nullable and add foreign key
            $table->uuid('user_id')->nullable(false)->change();
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
