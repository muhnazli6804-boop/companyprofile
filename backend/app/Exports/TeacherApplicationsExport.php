<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;

// TODO: see Rancangan-API-Padindi.md section 8.2 & Struktur-Folder-Padindi.md section 2
class TeacherApplicationsExport implements FromCollection
{
    public function collection()
    {
        // TODO: return koleksi data untuk ekspor Excel/CSV/PDF
        return collect([]);
    }
}
