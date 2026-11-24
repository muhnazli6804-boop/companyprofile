<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Posts table: update column length and constraint
        Schema::table('posts', function (Blueprint $table) {
            $table->string('status', 20)->default('draft')->change();
        });

        DB::statement('ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check');
        DB::statement("ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'archived', 'pending', 'revision', 'rejected'))");

        // 2. Galleries table: add status column and constraint
        if (!Schema::hasColumn('galleries', 'status')) {
            Schema::table('galleries', function (Blueprint $table) {
                $table->string('status', 20)->default('draft')->after('event_date');
            });

            // Sinkronkan data galeri yang sudah ada
            DB::table('galleries')->where('is_published', true)->update(['status' => 'published']);
            DB::table('galleries')->where('is_published', false)->update(['status' => 'draft']);
        }

        DB::statement('ALTER TABLE galleries DROP CONSTRAINT IF EXISTS galleries_status_check');
        DB::statement("ALTER TABLE galleries ADD CONSTRAINT galleries_status_check CHECK (status IN ('draft', 'published', 'archived', 'pending', 'revision', 'rejected'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check');
        DB::statement("ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'archived'))");

        DB::statement('ALTER TABLE galleries DROP CONSTRAINT IF EXISTS galleries_status_check');
        if (Schema::hasColumn('galleries', 'status')) {
            Schema::table('galleries', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
