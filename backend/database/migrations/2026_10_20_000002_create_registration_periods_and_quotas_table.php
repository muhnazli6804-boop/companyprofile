<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('academic_year', 9);
            $table->smallInteger('wave')->default(1);
            $table->timestampTz('opens_at');
            $table->timestampTz('closes_at');
            $table->timestampTz('announcement_at')->nullable();
            $table->text('description')->nullable();
            $table->decimal('registration_fee', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();
        });

        DB::statement("ALTER TABLE registration_periods ADD CONSTRAINT registration_periods_dates_check CHECK (closes_at > opens_at)");
        DB::statement("ALTER TABLE registration_periods ADD CONSTRAINT registration_periods_fee_check CHECK (registration_fee >= 0)");
        DB::statement("CREATE INDEX registration_periods_window_idx ON registration_periods (is_active, opens_at, closes_at)");

        Schema::create('period_unit_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_period_id')->constrained('registration_periods')->cascadeOnDelete();
            $table->foreignId('education_unit_id')->constrained('education_units')->restrictOnDelete();
            $table->integer('quota');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->unique(['registration_period_id', 'education_unit_id'], 'period_unit_quotas_unique');
        });

        DB::statement("ALTER TABLE period_unit_quotas ADD CONSTRAINT period_unit_quotas_quota_check CHECK (quota >= 0)");
    }

    public function down(): void
    {
        Schema::dropIfExists('period_unit_quotas');
        Schema::dropIfExists('registration_periods');
    }
};
