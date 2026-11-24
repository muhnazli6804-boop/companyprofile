<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE teacher_applications DROP CONSTRAINT IF EXISTS teacher_applications_status_check');
        DB::statement("ALTER TABLE teacher_applications ADD CONSTRAINT teacher_applications_status_check CHECK (status IN ('draft', 'submitted', 'administrative_review', 'revision_required', 'interview_test', 'passed', 'failed', 'reserve'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE teacher_applications DROP CONSTRAINT IF EXISTS teacher_applications_status_check');
        DB::statement("ALTER TABLE teacher_applications ADD CONSTRAINT teacher_applications_status_check CHECK (status IN ('draft', 'submitted', 'administrative_review', 'interview_test', 'passed', 'failed', 'reserve'))");
    }
};
