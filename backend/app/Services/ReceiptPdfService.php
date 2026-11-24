<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\StudentApplication;
use App\Models\TeacherApplication;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReceiptPdfService
{
    /**
     * Generate official PDF receipt for student application.
     */
    public function generateStudentReceipt(StudentApplication $application): string
    {
        $application->loadMissing([
            'user',
            'registrationPeriod',
            'educationUnit',
            'student',
            'guardians',
            'documents',
        ]);

        $settings = $this->getFoundationSettings();
        $logoBase64 = $this->getLogoBase64();

        $primaryGuardian = $application->guardians->firstWhere('is_primary_contact', true)
            ?? $application->guardians->first();

        $data = [
            'type' => 'student',
            'application' => $application,
            'student' => $application->student,
            'guardian' => $primaryGuardian,
            'guardians' => $application->guardians,
            'unit' => $application->educationUnit,
            'period' => $application->registrationPeriod,
            'documents' => $application->documents,
            'user' => $application->user,
            'settings' => $settings,
            'logoBase64' => $logoBase64,
            'registrationNumber' => $application->registration_number ?: ('PPDB-' . str_pad((string) $application->id, 5, '0', STR_PAD_LEFT)),
            'submittedAtFormatted' => $application->submitted_at
                ? Carbon::parse($application->submitted_at)->locale('id')->isoFormat('D MMMM Y, HH:mm') . ' WIB'
                : 'Masih dalam proses pendaftaran',
            'printedAt' => Carbon::now()->locale('id')->isoFormat('D MMMM Y, HH:mm:ss') . ' WIB',
            'currentDate' => Carbon::now()->locale('id')->isoFormat('D MMMM Y'),
            'securityHash' => strtoupper(substr(hash('sha256', ($application->registration_number ?? '') . $application->id . $application->created_at), 0, 16)),
        ];

        $pdf = Pdf::loadView('pdf.receipt', $data);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
        ]);

        return $pdf->output();
    }

    /**
     * Generate official PDF receipt for teacher application.
     */
    public function generateTeacherReceipt(TeacherApplication $application): string
    {
        $application->loadMissing([
            'user',
            'vacancy',
            'educationUnit',
            'educations',
            'experiences',
            'documents',
        ]);

        $settings = $this->getFoundationSettings();
        $logoBase64 = $this->getLogoBase64();

        $data = [
            'type' => 'teacher',
            'application' => $application,
            'teacher' => $application,
            'vacancy' => $application->vacancy,
            'unit' => $application->educationUnit,
            'educations' => $application->educations,
            'experiences' => $application->experiences,
            'documents' => $application->documents,
            'user' => $application->user,
            'settings' => $settings,
            'logoBase64' => $logoBase64,
            'registrationNumber' => $application->registration_number ?: ('GURU-' . str_pad((string) $application->id, 5, '0', STR_PAD_LEFT)),
            'submittedAtFormatted' => $application->submitted_at
                ? Carbon::parse($application->submitted_at)->locale('id')->isoFormat('D MMMM Y, HH:mm') . ' WIB'
                : 'Masih dalam proses pendaftaran',
            'printedAt' => Carbon::now()->locale('id')->isoFormat('D MMMM Y, HH:mm:ss') . ' WIB',
            'currentDate' => Carbon::now()->locale('id')->isoFormat('D MMMM Y'),
            'securityHash' => strtoupper(substr(hash('sha256', ($application->registration_number ?? '') . $application->id . $application->created_at), 0, 16)),
        ];

        $pdf = Pdf::loadView('pdf.receipt', $data);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
        ]);

        return $pdf->output();
    }

    /**
     * Retrieve base64-encoded logo image for fast and reliable DomPDF rendering.
     */
    protected function getLogoBase64(): ?string
    {
        $paths = [
            public_path('images/logo.png'),
            base_path('../frontend/public/images/logo.png'),
            base_path('public/images/logo.png'),
        ];

        foreach ($paths as $path) {
            if (file_exists($path) && is_readable($path)) {
                $content = file_get_contents($path);
                if ($content !== false && strlen($content) > 0) {
                    return 'data:image/png;base64,' . base64_encode($content);
                }
            }
        }

        return null;
    }

    /**
     * Retrieve foundation settings with fallbacks.
     */
    protected function getFoundationSettings(): array
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return array_merge([
            'site_name' => 'YAYASAN PENDIDIKAN PADINDI',
            'site_tagline' => 'Mendidik Generasi Berkarakter, Cerdas, dan Berintegritas',
            'contact_address' => 'Jl. Padindi Raya No. 1, Kalideres, Jakarta Barat 11830',
            'contact_phone' => '(021) 5439-0123 / 0812-3456-7890',
            'contact_email' => 'info@padindi.sch.id / ppdb@padindi.sch.id',
            'contact_whatsapp' => '0812-3456-7890',
            'contact_website' => 'www.padindi.sch.id',
            'foundation_leader' => 'Drs. H. M. Nurhadi, M.Pd.',
            'committee_nipy' => 'NIPY. 19780512 200401 1 002',
        ], $settings);
    }
}
