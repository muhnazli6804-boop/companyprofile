<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Bukti Pendaftaran Yayasan Padindi</title>
    <style>
        /* TODO: Styling PDF bukti pendaftaran per DESIGN.md & dompdf */
        body { font-family: sans-serif; font-size: 12px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; }
        .title { font-size: 16px; font-weight: bold; }
        .details { margin-top: 20px; width: 100%; border-collapse: collapse; }
        .details th, .details td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">YAYASAN PADINDI</h1>
        <p>Bukti Pendaftaran Calon Siswa / Pelamar Guru</p>
    </div>

    <!-- TODO: see Rancangan-API-Padindi.md section 5.1 (GET /receipt) & ARCHITECTURE.md -->
    <table class="details">
        <tr>
            <th>Nomor Pendaftaran</th>
            <td>{{ $registrationNumber ?? 'PPDB-XXXX-XXXXX' }}</td>
        </tr>
        <tr>
            <th>Nama Lengkap</th>
            <td>{{ $fullName ?? '-' }}</td>
        </tr>
        <tr>
            <th>Unit Pendidikan</th>
            <td>{{ $unitName ?? '-' }}</td>
        </tr>
        <tr>
            <th>Tanggal Pengiriman</th>
            <td>{{ $submittedAt ?? '-' }}</td>
        </tr>
    </table>
</body>
</html>
