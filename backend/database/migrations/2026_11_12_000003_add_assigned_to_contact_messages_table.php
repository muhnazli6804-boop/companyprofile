<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table) {
            if (! Schema::hasColumn('contact_messages', 'assigned_to')) {
                $table->foreignId('assigned_to')
                    ->nullable()
                    ->after('read_by')
                    ->constrained('users')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('contact_messages', 'reply_notes')) {
                $table->text('reply_notes')->nullable()->after('message');
            }
        });

        DB::statement('CREATE INDEX IF NOT EXISTS contact_messages_assigned_status_idx ON contact_messages (assigned_to, status, created_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS contact_messages_assigned_status_idx');

        Schema::table('contact_messages', function (Blueprint $table) {
            if (Schema::hasColumn('contact_messages', 'assigned_to')) {
                $table->dropConstrainedForeignId('assigned_to');
            }
            if (Schema::hasColumn('contact_messages', 'reply_notes')) {
                $table->dropColumn('reply_notes');
            }
        });
    }
};

