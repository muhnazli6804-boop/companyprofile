<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

// TODO: see Struktur-Folder-Padindi.md section 2
class GenerateApplicationsExport implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        // TODO: inisialisasi parameter job
    }

    public function handle(): void
    {
        // TODO: proses pekerjaan antrean
    }
}
