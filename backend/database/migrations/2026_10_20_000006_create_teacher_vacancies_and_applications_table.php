<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_vacancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_unit_id')->nullable()->constrained('education_units')->nullOnDelete();
            $table->string('title', 200);
            $table->string('slug', 220);
            $table->string('subject', 150)->nullable();
            $table->string('employment_type', 30)->nullable();
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->integer('quota')->nullable();
            $table->timestampTz('opens_at')->nullable();
            $table->timestampTz('closes_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement("ALTER TABLE teacher_vacancies ADD CONSTRAINT teacher_vacancies_dates_check CHECK (closes_at IS NULL OR opens_at IS NULL OR closes_at > opens_at)");
        DB::statement("CREATE UNIQUE INDEX teacher_vacancies_slug_unique ON teacher_vacancies (slug) WHERE deleted_at IS NULL");
        DB::statement("CREATE INDEX teacher_vacancies_published_idx ON teacher_vacancies (is_published, closes_at)");

        Schema::create('teacher_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('teacher_vacancy_id')->nullable()->constrained('teacher_vacancies')->nullOnDelete();
            $table->foreignId('education_unit_id')->nullable()->constrained('education_units')->nullOnDelete();
            $table->string('applied_position', 200);
            $table->string('registration_number', 30)->nullable();
            $table->string('status', 25)->default('draft');
            $table->smallInteger('current_step')->default(1);
            $table->string('full_name', 150);
            $table->char('gender', 1);
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->text('nik')->nullable();
            $table->char('nik_hash', 64)->nullable();
            $table->string('religion', 30)->nullable();
            $table->string('phone', 20);
            $table->string('email', 190);
            $table->text('address');
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->jsonb('teaching_subjects')->default('[]');
            $table->text('cover_letter')->nullable();
            $table->timestampTz('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('reviewed_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestampTz('declaration_accepted_at')->nullable();
            $table->timestampTz('consent_accepted_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement("ALTER TABLE teacher_applications ADD CONSTRAINT teacher_applications_status_check CHECK (status IN ('draft', 'submitted', 'administrative_review', 'interview_test', 'passed', 'failed', 'reserve'))");
        DB::statement("ALTER TABLE teacher_applications ADD CONSTRAINT teacher_applications_gender_check CHECK (gender IN ('L', 'P'))");
        DB::statement("ALTER TABLE teacher_applications ADD CONSTRAINT teacher_applications_step_check CHECK (current_step BETWEEN 1 AND 5)");
        DB::statement("ALTER TABLE teacher_applications ADD CONSTRAINT teacher_applications_submitted_check CHECK (status = 'draft' OR (registration_number IS NOT NULL AND submitted_at IS NOT NULL))");
        DB::statement("CREATE UNIQUE INDEX teacher_applications_number_unique ON teacher_applications (registration_number)");
        DB::statement("CREATE INDEX teacher_applications_user_idx ON teacher_applications (user_id)");
        DB::statement("CREATE INDEX teacher_applications_vacancy_idx ON teacher_applications (teacher_vacancy_id)");
        DB::statement("CREATE INDEX teacher_applications_filter_idx ON teacher_applications (education_unit_id, status)");
        DB::statement("CREATE INDEX teacher_applications_nik_hash_idx ON teacher_applications (nik_hash)");
        DB::statement("CREATE INDEX teacher_applications_name_trgm ON teacher_applications USING gin (full_name gin_trgm_ops)");
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_applications');
        Schema::dropIfExists('teacher_vacancies');
    }
};
