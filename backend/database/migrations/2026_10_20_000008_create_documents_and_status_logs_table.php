<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('documentable_type', 40);
            $table->unsignedBigInteger('documentable_id');
            $table->string('document_type', 50);
            $table->smallInteger('sequence')->default(1);
            $table->string('disk', 30)->default('private');
            $table->string('path', 255);
            $table->string('original_name', 255);
            $table->string('mime_type', 100);
            $table->bigInteger('size_bytes');
            $table->string('verification_status', 10)->default('pending');
            $table->text('verification_note')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('verified_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement("ALTER TABLE documents ADD CONSTRAINT documents_type_check CHECK (documentable_type IN ('student_application', 'teacher_application'))");
        DB::statement("ALTER TABLE documents ADD CONSTRAINT documents_verification_check CHECK (verification_status IN ('pending', 'valid', 'invalid'))");
        DB::statement("ALTER TABLE documents ADD CONSTRAINT documents_size_check CHECK (size_bytes > 0)");
        DB::statement("CREATE INDEX documents_owner_idx ON documents (documentable_type, documentable_id)");
        DB::statement("CREATE UNIQUE INDEX documents_slot_unique ON documents (documentable_type, documentable_id, document_type, sequence) WHERE deleted_at IS NULL");

        Schema::create('application_status_logs', function (Blueprint $table) {
            $table->id();
            $table->string('loggable_type', 40);
            $table->unsignedBigInteger('loggable_id');
            $table->string('from_status', 25)->nullable();
            $table->string('to_status', 25);
            $table->text('note')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('created_at')->useCurrent();
        });

        DB::statement("ALTER TABLE application_status_logs ADD CONSTRAINT application_status_logs_type_check CHECK (loggable_type IN ('student_application', 'teacher_application'))");
        DB::statement("CREATE INDEX application_status_logs_owner_idx ON application_status_logs (loggable_type, loggable_id, created_at)");
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_logs');
        Schema::dropIfExists('documents');
    }
};
