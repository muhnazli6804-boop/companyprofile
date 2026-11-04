<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('applicant_type', 10);
            $table->foreignId('education_unit_id')->nullable()->constrained('education_units')->cascadeOnDelete();
            $table->string('document_type', 50);
            $table->string('label', 150);
            $table->string('description', 255)->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('max_size_kb')->default(2048);
            $table->string('allowed_mimes', 100)->default('pdf,jpg,jpeg,png');
            $table->smallInteger('max_files')->default(1);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement("ALTER TABLE document_requirements ADD CONSTRAINT document_requirements_type_check CHECK (applicant_type IN ('student', 'teacher'))");
        DB::statement("ALTER TABLE document_requirements ADD CONSTRAINT document_requirements_size_check CHECK (max_size_kb > 0)");
        DB::statement("ALTER TABLE document_requirements ADD CONSTRAINT document_requirements_files_check CHECK (max_files >= 1)");
        DB::statement("CREATE UNIQUE INDEX document_requirements_unique ON document_requirements (applicant_type, COALESCE(education_unit_id, 0), document_type)");
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requirements');
    }
};
