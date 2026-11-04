<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('registration_period_id')->constrained('registration_periods')->restrictOnDelete();
            $table->foreignId('education_unit_id')->constrained('education_units')->restrictOnDelete();
            $table->string('registration_number', 30)->nullable();
            $table->string('track', 50)->nullable();
            $table->string('status', 25)->default('draft');
            $table->smallInteger('current_step')->default(1);
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

        DB::statement("ALTER TABLE student_applications ADD CONSTRAINT student_applications_status_check CHECK (status IN ('draft', 'submitted', 'in_review', 'revision_required', 'verified', 'accepted', 'rejected', 'waitlisted'))");
        DB::statement("ALTER TABLE student_applications ADD CONSTRAINT student_applications_step_check CHECK (current_step BETWEEN 1 AND 5)");
        DB::statement("ALTER TABLE student_applications ADD CONSTRAINT student_applications_submitted_check CHECK (status = 'draft' OR (registration_number IS NOT NULL AND submitted_at IS NOT NULL))");
        DB::statement("CREATE UNIQUE INDEX student_applications_number_unique ON student_applications (registration_number)");
        DB::statement("CREATE INDEX student_applications_user_idx ON student_applications (user_id)");
        DB::statement("CREATE INDEX student_applications_filter_idx ON student_applications (registration_period_id, education_unit_id, status)");
        DB::statement("CREATE INDEX student_applications_status_idx ON student_applications (status)");

        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_application_id')->unique()->constrained('student_applications')->cascadeOnDelete();
            $table->string('full_name', 150);
            $table->char('gender', 1);
            $table->string('birth_place', 100);
            $table->date('birth_date');
            $table->text('nik')->nullable();
            $table->char('nik_hash', 64)->nullable();
            $table->string('nisn', 10)->nullable();
            $table->string('religion', 30)->nullable();
            $table->text('address');
            $table->string('village', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('previous_school', 150)->nullable();
            $table->string('previous_school_npsn', 10)->nullable();
            $table->smallInteger('graduation_year')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement("ALTER TABLE students ADD CONSTRAINT students_gender_check CHECK (gender IN ('L', 'P'))");
        DB::statement("CREATE INDEX students_nik_hash_idx ON students (nik_hash)");
        DB::statement("CREATE INDEX students_full_name_trgm ON students USING gin (full_name gin_trgm_ops)");

        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_application_id')->constrained('student_applications')->cascadeOnDelete();
            $table->string('relationship', 10);
            $table->string('full_name', 150);
            $table->text('nik')->nullable();
            $table->char('nik_hash', 64)->nullable();
            $table->smallInteger('birth_year')->nullable();
            $table->string('education_level', 50)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('income_range', 50)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email', 190)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_primary_contact')->default(false);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->unique(['student_application_id', 'relationship'], 'guardians_unique_relationship');
        });

        DB::statement("ALTER TABLE guardians ADD CONSTRAINT guardians_relationship_check CHECK (relationship IN ('father', 'mother', 'guardian'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('students');
        Schema::dropIfExists('student_applications');
    }
};
