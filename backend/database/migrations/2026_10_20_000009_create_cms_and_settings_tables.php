<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_category_id')->nullable()->constrained('post_categories')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title', 250);
            $table->string('slug', 270);
            $table->string('excerpt', 500)->nullable();
            $table->text('content');
            $table->string('cover_path', 255)->nullable();
            $table->string('status', 10)->default('draft');
            $table->timestampTz('published_at')->nullable();
            $table->string('meta_title', 160)->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement("ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'archived'))");
        DB::statement('CREATE UNIQUE INDEX posts_slug_unique ON posts (slug) WHERE deleted_at IS NULL');
        DB::statement('CREATE INDEX posts_list_idx ON posts (status, published_at DESC)');
        DB::statement('CREATE INDEX posts_category_idx ON posts (post_category_id)');

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('slug', 220);
            $table->text('content');
            $table->string('meta_title', 160)->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement('CREATE UNIQUE INDEX pages_slug_unique ON pages (slug) WHERE deleted_at IS NULL');

        Schema::create('organization_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('position', 150);
            $table->string('photo_path', 255)->nullable();
            $table->text('bio')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('slug', 220);
            $table->text('description')->nullable();
            $table->string('cover_path', 255)->nullable();
            $table->date('event_date')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement('CREATE UNIQUE INDEX galleries_slug_unique ON galleries (slug) WHERE deleted_at IS NULL');

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_id')->constrained('galleries')->cascadeOnDelete();
            $table->string('path', 255);
            $table->string('caption', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement('CREATE INDEX gallery_items_gallery_idx ON gallery_items (gallery_id, sort_order)');

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('subtitle', 300)->nullable();
            $table->string('image_path', 255);
            $table->string('cta_label', 60)->nullable();
            $table->string('link_url', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('starts_at')->nullable();
            $table->timestampTz('ends_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('email', 190);
            $table->string('phone', 20)->nullable();
            $table->string('subject', 200)->nullable();
            $table->text('message');
            $table->string('status', 10)->default('new');
            $table->foreignId('read_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('read_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement("ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('new', 'read', 'replied'))");
        DB::statement('CREATE INDEX contact_messages_status_idx ON contact_messages (status, created_at DESC)');

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->string('group_name', 60)->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('subject_type', 60)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->jsonb('properties')->default('{}');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });

        DB::statement('CREATE INDEX activity_logs_user_idx ON activity_logs (user_id, created_at DESC)');
        DB::statement('CREATE INDEX activity_logs_subject_idx ON activity_logs (subject_type, subject_id)');
        DB::statement('CREATE INDEX activity_logs_action_idx ON activity_logs (action, created_at DESC)');
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('galleries');
        Schema::dropIfExists('organization_members');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('post_categories');
    }
};
