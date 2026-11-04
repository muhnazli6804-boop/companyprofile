<?php

namespace Database\Seeders;

use App\Models\DocumentRequirement;
use Illuminate\Database\Seeder;

class DocumentRequirementSeeder extends Seeder
{
    public function run(): void
    {
        $requirements = [
            // Murid
            [
                'applicant_type' => 'student',
                'education_unit_id' => null,
                'document_type' => 'family_card',
                'label' => 'Kartu Keluarga (KK)',
                'description' => 'Unggah salinan Kartu Keluarga resmi yang masih berlaku.',
                'is_required' => true,
                'max_size_kb' => 2048,
                'allowed_mimes' => 'pdf,jpg,jpeg,png',
                'max_files' => 1,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'applicant_type' => 'student',
                'education_unit_id' => null,
                'document_type' => 'diploma',
                'label' => 'Ijazah / Surat Keterangan Lulus',
                'description' => 'Ijazah jenjang sebelumnya atau Surat Keterangan Lulus (SKL) sementara.',
                'is_required' => true,
                'max_size_kb' => 2048,
                'allowed_mimes' => 'pdf,jpg,jpeg,png',
                'max_files' => 1,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'applicant_type' => 'student',
                'education_unit_id' => null,
                'document_type' => 'photo',
                'label' => 'Pas Foto Calon Murid',
                'description' => 'Foto berwarna terbaru berpakaian rapi dengan latar belakang polos.',
                'is_required' => true,
                'max_size_kb' => 2048,
                'allowed_mimes' => 'jpg,jpeg,png',
                'max_files' => 1,
                'sort_order' => 3,
                'is_active' => true,
            ],

            // Guru
            [
                'applicant_type' => 'teacher',
                'education_unit_id' => null,
                'document_type' => 'cv_portfolio',
                'label' => 'CV & Portofolio',
                'description' => 'Curriculum Vitae ringkas beserta portofolio atau riwayat karya dalam format PDF.',
                'is_required' => true,
                'max_size_kb' => 4096,
                'allowed_mimes' => 'pdf',
                'max_files' => 1,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'applicant_type' => 'teacher',
                'education_unit_id' => null,
                'document_type' => 'family_card',
                'label' => 'Kartu Keluarga (KK)',
                'description' => 'Unggah salinan Kartu Keluarga resmi pelamar.',
                'is_required' => true,
                'max_size_kb' => 2048,
                'allowed_mimes' => 'pdf,jpg,jpeg,png',
                'max_files' => 1,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'applicant_type' => 'teacher',
                'education_unit_id' => null,
                'document_type' => 'diploma',
                'label' => 'Ijazah Pendidikan Terakhir',
                'description' => 'Salinan ijazah asli S1/S2 yang relevan dengan formasi yang dilamar.',
                'is_required' => true,
                'max_size_kb' => 2048,
                'allowed_mimes' => 'pdf,jpg,jpeg,png',
                'max_files' => 1,
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'applicant_type' => 'teacher',
                'education_unit_id' => null,
                'document_type' => 'photo',
                'label' => 'Pas Foto Terbaru',
                'description' => 'Pas foto formal terbaru dengan pakaian rapi.',
                'is_required' => true,
                'max_size_kb' => 2048,
                'allowed_mimes' => 'jpg,jpeg,png',
                'max_files' => 1,
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($requirements as $req) {
            DocumentRequirement::firstOrCreate(
                [
                    'applicant_type' => $req['applicant_type'],
                    'education_unit_id' => $req['education_unit_id'],
                    'document_type' => $req['document_type'],
                ],
                $req
            );
        }
    }
}
