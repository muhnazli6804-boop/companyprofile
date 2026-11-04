<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_application_id')->constrained('teacher_applications')->cascadeOnDelete();
            $table->string('level', 20);
            $table->string('institution', 200);
            $table->string('major', 150)->nullable();
            $table->smallInteger('graduation_year')->nullable();
            $table->decimal('gpa', 4, 2)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement("ALTER TABLE teacher_educations ADD CONSTRAINT teacher_educations_gpa_check CHECK (gpa IS NULL OR (gpa >= 0 AND gpa <= 4.00))");
        DB::statement("CREATE INDEX teacher_educations_app_idx ON teacher_educations (teacher_application_id)");

        Schema::create('teacher_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_application_id')->constrained('teacher_applications')->cascadeOnDelete();
            $table->string('institution', 200);
            $table->string('position', 150);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement("ALTER TABLE teacher_experiences ADD CONSTRAINT teacher_experiences_dates_check CHECK (end_date IS NULL OR end_date >= start_date)");
        DB::statement("CREATE INDEX teacher_experiences_app_idx ON teacher_experiences (teacher_application_id)");

        Schema::create('teacher_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_application_id')->constrained('teacher_applications')->cascadeOnDelete();
            $table->string('name', 200);
            $table->string('issuer', 200)->nullable();
            $table->string('certificate_number', 100)->nullable();
            $table->smallInteger('year')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement("CREATE INDEX teacher_certifications_app_idx ON teacher_certifications (teacher_application_id)");
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_certifications');
        Schema::dropIfExists('teacher_experiences');
        Schema::dropIfExists('teacher_educations');
    }
};
