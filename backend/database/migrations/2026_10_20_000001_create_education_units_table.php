<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('education_units', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30);
            $table->string('name', 150);
            $table->string('slug', 170);
            $table->string('level', 20);
            $table->string('tagline', 255)->nullable();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 190)->nullable();
            $table->string('website_url', 255)->nullable();
            $table->string('logo_path', 255)->nullable();
            $table->string('cover_path', 255)->nullable();
            $table->string('accreditation', 30)->nullable();
            $table->string('principal_name', 150)->nullable();
            $table->jsonb('facilities')->default('[]');
            $table->jsonb('programs')->default('[]');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement("ALTER TABLE education_units ADD CONSTRAINT education_units_level_check CHECK (level IN ('paud', 'tk', 'sd', 'smp', 'sma', 'smk', 'other'))");
        DB::statement('CREATE UNIQUE INDEX education_units_code_unique ON education_units (code) WHERE deleted_at IS NULL');
        DB::statement('CREATE UNIQUE INDEX education_units_slug_unique ON education_units (slug) WHERE deleted_at IS NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('education_units');
    }
};
