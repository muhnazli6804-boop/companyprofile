<?php

namespace Database\Seeders;

use App\Models\EducationUnit;
use App\Models\PeriodUnitQuota;
use App\Models\RegistrationPeriod;
use Illuminate\Database\Seeder;

class RegistrationPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $period = RegistrationPeriod::firstOrCreate(
            ['academic_year' => '2027/2028', 'wave' => 1],
            [
                'name' => '[Contoh] PPDB 2027/2028 Gelombang 1',
                'academic_year' => '2027/2028',
                'wave' => 1,
                'opens_at' => now()->subDays(5),
                'closes_at' => now()->addDays(60),
                'announcement_at' => now()->addDays(75),
                'description' => '[Contoh] Periode pendaftaran calon siswa baru tahun ajaran 2027/2028 Yayasan Padindi.',
                'registration_fee' => 0,
                'is_active' => true,
            ]
        );

        $sd = EducationUnit::where('code', 'SD-PADINDI')->first();
        if ($sd) {
            PeriodUnitQuota::firstOrCreate(
                ['registration_period_id' => $period->id, 'education_unit_id' => $sd->id],
                ['quota' => 100]
            );
        }

        $smp = EducationUnit::where('code', 'SMP-PADINDI')->first();
        if ($smp) {
            PeriodUnitQuota::firstOrCreate(
                ['registration_period_id' => $period->id, 'education_unit_id' => $smp->id],
                ['quota' => 120]
            );
        }
    }
}
