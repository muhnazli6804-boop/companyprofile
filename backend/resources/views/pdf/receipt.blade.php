<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $type === 'teacher' ? 'Bukti Registrasi Lamaran Guru' : 'Bukti Pendaftaran Siswa Baru' }} — Yayasan Padindi</title>
    <style>
        @page {
            margin: 10mm 15mm 12mm 15mm;
            size: a4 portrait;
        }

        body {
            font-family: 'DejaVu Sans', Helvetica, Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.35;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat Resmi */
        .kop-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }

        .kop-logo {
            width: 75px;
            text-align: center;
            vertical-align: middle;
        }

        .kop-logo img {
            max-width: 68px;
            max-height: 68px;
        }

        .kop-text {
            text-align: center;
            vertical-align: middle;
            padding-left: 8px;
            padding-right: 20px;
        }

        .kop-title-main {
            font-size: 15pt;
            font-weight: bold;
            color: #1e3a8a;
            letter-spacing: 0.5px;
            margin: 0;
            padding: 0;
            text-transform: uppercase;
        }

        .kop-subtitle-decree {
            font-size: 7.5pt;
            color: #475569;
            margin: 2px 0;
        }

        .kop-units {
            font-size: 8.5pt;
            font-weight: bold;
            color: #0284c7;
            margin: 2px 0;
            letter-spacing: 0.3px;
        }

        .kop-address {
            font-size: 7.5pt;
            color: #334155;
            margin: 2px 0 0 0;
            line-height: 1.25;
        }

        /* Garis Ganda Pemisah Kop Surat */
        .kop-separator {
            width: 100%;
            border-top: 2px solid #1e3a8a;
            border-bottom: 1px solid #1e3a8a;
            height: 2px;
            margin-top: 5px;
            margin-bottom: 10px;
        }

        /* Judul Dokumen & Badge Nomor Registrasi */
        .doc-title-container {
            text-align: center;
            margin-bottom: 10px;
        }

        .doc-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            margin: 0 0 2px 0;
            letter-spacing: 0.5px;
        }

        .doc-subtitle {
            font-size: 8.5pt;
            color: #64748b;
            margin: 0 0 6px 0;
        }

        .reg-badge-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1.5px solid #0284c7;
            margin-bottom: 10px;
        }

        .reg-badge-table td {
            padding: 6px 10px;
            vertical-align: middle;
        }

        .reg-number-label {
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #475569;
        }

        .reg-number-value {
            font-size: 13pt;
            font-weight: bold;
            color: #1e3a8a;
            font-family: 'DejaVu Sans', monospace;
            letter-spacing: 1px;
        }

        .reg-status-badge {
            display: inline-block;
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            color: #065f46;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 3px;
        }

        /* Section Styling */
        .section-header {
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 4px 8px;
            margin-top: 8px;
            margin-bottom: 4px;
        }

        /* Tabel Rincian Data */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        .data-table th, .data-table td {
            padding: 3.5px 6px;
            font-size: 8.5pt;
            vertical-align: top;
            border-bottom: 1px solid #f1f5f9;
        }

        .data-table th {
            width: 28%;
            text-align: left;
            font-weight: bold;
            color: #334155;
            background-color: #f8fafc;
        }

        .data-table td {
            color: #0f172a;
        }

        .data-table td.colon {
            width: 2%;
            text-align: center;
            font-weight: bold;
            color: #475569;
            padding-left: 0;
            padding-right: 0;
        }

        /* Checklist Dokumen */
        .doc-list-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 8pt;
        }

        .doc-list-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-align: left;
            padding: 4px 6px;
            border: 1px solid #e2e8f0;
        }

        .doc-list-table td {
            padding: 3px 6px;
            border: 1px solid #e2e8f0;
            color: #1e293b;
        }

        .badge-verified {
            color: #065f46;
            font-weight: bold;
        }

        /* Instruksi / Kotak Langkah Berikutnya */
        .instruction-box {
            background-color: #f0fdf4;
            border-left: 3px solid #10b981;
            border-top: 1px solid #d1fae5;
            border-right: 1px solid #d1fae5;
            border-bottom: 1px solid #d1fae5;
            padding: 6px 10px;
            margin-top: 6px;
            margin-bottom: 8px;
        }

        .instruction-title {
            font-size: 8.5pt;
            font-weight: bold;
            color: #065f46;
            margin-bottom: 2px;
        }

        .instruction-list {
            margin: 0;
            padding-left: 14px;
            font-size: 7.5pt;
            color: #047857;
            line-height: 1.35;
        }

        /* Area Tanda Tangan & Stempel */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .signature-cell {
            width: 50%;
            vertical-align: top;
            font-size: 8pt;
        }

        .stamp-container {
            position: relative;
            height: 95px;
            margin-top: 3px;
        }

        .official-signature-line {
            font-weight: bold;
            font-size: 8.5pt;
            color: #0f172a;
            border-bottom: 1px solid #0f172a;
            display: inline-block;
            padding-bottom: 1px;
        }

        /* Legal Disclaimer Footer */
        .legal-footer {
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px dashed #cbd5e1;
            font-size: 6.8pt;
            color: #64748b;
            text-align: justify;
            line-height: 1.25;
        }

        .security-meta {
            font-family: monospace;
            font-size: 6.8pt;
            color: #475569;
            margin-top: 2px;
        }
    </style>
</head>
<body>

    <!-- 1. KOP SURAT RESMI YAYASAN PADINDI -->
    <table class="kop-table">
        <tr>
            <td class="kop-logo">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Logo Yayasan Padindi">
                @else
                    <div style="width: 60px; height: 60px; border: 2px solid #1e3a8a; border-radius: 50%; text-align: center; line-height: 60px; font-weight: bold; color: #1e3a8a; font-size: 11pt;">PADINDI</div>
                @endif
            </td>
            <td class="kop-text">
                <div class="kop-title-main">{{ $settings['site_name'] ?? 'YAYASAN PENDIDIKAN PADINDI' }}</div>
                <div class="kop-subtitle-decree">Akta Notaris No. 24 / SK Kemenkumham RI No. AHU-0012948.AH.01.04.Tahun 2018</div>
                <div class="kop-units">KB &bull; TK &bull; SD &bull; SMP &bull; SMA &bull; SMK PADINDI</div>
                <div class="kop-address">
                    {{ $settings['contact_address'] ?? 'Jl. Padindi Raya No. 1, Kalideres, Jakarta Barat 11830' }}<br>
                    Telp: {{ $settings['contact_phone'] ?? '(021) 5439-0123' }} &bull; Website: {{ $settings['contact_website'] ?? 'www.padindi.sch.id' }} &bull; Email: {{ $settings['contact_email'] ?? 'info@padindi.sch.id' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="kop-separator"></div>

    <!-- 2. JUDUL DOKUMEN & KOTAK NOMOR REGISTRASI -->
    <div class="doc-title-container">
        @if($type === 'teacher')
            <div class="doc-title">Tanda Bukti Registrasi Lamaran Pendidik</div>
            <div class="doc-subtitle">Sistem Rekrutmen Elektronik Tenaga Pendidik Yayasan Padindi</div>
        @else
            <div class="doc-title">Tanda Bukti Pendaftaran Resmi PPDB</div>
            <div class="doc-subtitle">Penerimaan Peserta Didik Baru Tahun Ajaran {{ $period->academic_year ?? '2027/2028' }}</div>
        @endif
    </div>

    <table class="reg-badge-table">
        <tr>
            <td style="width: 55%;">
                <div class="reg-number-label">Nomor Registrasi Resmi:</div>
                <div class="reg-number-value">{{ $registrationNumber }}</div>
            </td>
            <td style="width: 45%; text-align: right;">
                <div style="font-size: 7.5pt; color: #64748b; margin-bottom: 2px;">Waktu Penyerahan:</div>
                <div style="font-size: 8pt; font-weight: bold; color: #1e293b; margin-bottom: 3px;">{{ $submittedAtFormatted }}</div>
                <span class="reg-status-badge">
                    @if($application->status && method_exists($application->status, 'label'))
                        {{ $application->status->label() }}
                    @else
                        {{ strtoupper($application->status ?? 'TERKIRIM') }}
                    @endif
                </span>
            </td>
        </tr>
    </table>

    @if($type === 'teacher')
        <!-- =================== BAGIAN LAMARAN GURU =================== -->
        <div class="section-header">A. Data Diri Pelamar Tenaga Pendidik</div>
        <table class="data-table">
            <tr>
                <th>Nama Lengkap & Gelar</th>
                <td class="colon">:</td>
                <td><strong>{{ $teacher->full_name ?? '-' }}</strong></td>
            </tr>
            <tr>
                <th>Posisi yang Dilamar</th>
                <td class="colon">:</td>
                <td><strong>{{ $teacher->applied_position ?? ($vacancy->title ?? 'Tenaga Pendidik') }}</strong></td>
            </tr>
            <tr>
                <th>Unit Sekolah Tujuan</th>
                <td class="colon">:</td>
                <td>{{ $unit->name ?? 'Semua Unit Yayasan' }}</td>
            </tr>
            <tr>
                <th>Mata Pelajaran yang Diampu</th>
                <td class="colon">:</td>
                <td>
                    @if(!empty($teacher->teaching_subjects) && is_array($teacher->teaching_subjects))
                        {{ implode(', ', $teacher->teaching_subjects) }}
                    @else
                        {{ is_string($teacher->teaching_subjects) ? $teacher->teaching_subjects : '-' }}
                    @endif
                </td>
            </tr>
            <tr>
                <th>NIK (Kependudukan)</th>
                <td class="colon">:</td>
                <td>{{ !empty($teacher->masked_nik) ? $teacher->masked_nik : ($teacher->nik ? substr($teacher->nik, 0, 4) . '********' . substr($teacher->nik, -4) : '-') }}</td>
            </tr>
            <tr>
                <th>Tempat, Tanggal Lahir</th>
                <td class="colon">:</td>
                <td>
                    {{ $teacher->birth_place ?? '-' }},
                    {{ $teacher->birth_date ? \Carbon\Carbon::parse($teacher->birth_date)->locale('id')->isoFormat('D MMMM Y') : '-' }}
                </td>
            </tr>
            <tr>
                <th>Jenis Kelamin</th>
                <td class="colon">:</td>
                <td>
                    @if($teacher->gender && method_exists($teacher->gender, 'label'))
                        {{ $teacher->gender->label() }}
                    @else
                        {{ $teacher->gender === 'L' || $teacher->gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                    @endif
                </td>
            </tr>
            <tr>
                <th>Kontak & WhatsApp</th>
                <td class="colon">:</td>
                <td>{{ $teacher->masked_phone ?? $teacher->phone ?? '-' }} &bull; Email: {{ $user->email ?? '-' }}</td>
            </tr>
            <tr>
                <th>Alamat Domisili</th>
                <td class="colon">:</td>
                <td>{{ $teacher->address ?? '-' }}</td>
            </tr>
        </table>

        <!-- B. RIWAYAT PENDIDIKAN & PENGALAMAN -->
        <div class="section-header">B. Kualifikasi Pendidikan & Pengalaman Terakhir</div>
        <table class="data-table">
            @if(isset($educations) && count($educations) > 0)
                @foreach($educations->take(2) as $edu)
                    <tr>
                        <th>Pendidikan ({{ $edu->degree ?? 'S1' }})</th>
                        <td class="colon">:</td>
                        <td>{{ $edu->institution ?? '-' }} &bull; Jurusan {{ $edu->major ?? '-' }} (Lulus {{ $edu->graduation_year ?? '-' }})</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <th>Pendidikan Terakhir</th>
                    <td class="colon">:</td>
                    <td>Data pendidikan terlampir pada Curriculum Vitae (CV)</td>
                </tr>
            @endif
        </table>

    @else
        <!-- =================== BAGIAN PENDAFTARAN SISWA (PPDB) =================== -->
        <div class="section-header">A. Data Calon Siswa Baru</div>
        <table class="data-table">
            <tr>
                <th>Nama Lengkap Calon Siswa</th>
                <td class="colon">:</td>
                <td><strong style="font-size: 9.5pt; color: #1e3a8a;">{{ $student->full_name ?? '-' }}</strong></td>
            </tr>
            <tr>
                <th>Unit Pendidikan Dituju</th>
                <td class="colon">:</td>
                <td><strong>{{ $unit->name ?? 'Sekolah Padindi' }}</strong> &bull; Jalur: {{ ucfirst($application->track ?? 'Reguler') }}</td>
            </tr>
            <tr>
                <th>NISN / NIK Siswa</th>
                <td class="colon">:</td>
                <td>
                    NISN: {{ $student->nisn ?? '-' }} &bull;
                    NIK: {{ !empty($student->masked_nik) ? $student->masked_nik : ($student->nik ? substr($student->nik, 0, 4) . '********' . substr($student->nik, -4) : '-') }}
                </td>
            </tr>
            <tr>
                <th>Tempat, Tanggal Lahir</th>
                <td class="colon">:</td>
                <td>
                    {{ $student->birth_place ?? '-' }},
                    {{ $student->birth_date ? \Carbon\Carbon::parse($student->birth_date)->locale('id')->isoFormat('D MMMM Y') : '-' }}
                </td>
            </tr>
            <tr>
                <th>Jenis Kelamin & Agama</th>
                <td class="colon">:</td>
                <td>
                    @if($student->gender && method_exists($student->gender, 'label'))
                        {{ $student->gender->label() }}
                    @else
                        {{ $student->gender === 'L' || $student->gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                    @endif
                    &bull; Agama: {{ ucfirst($student->religion ?? '-') }}
                </td>
            </tr>
            <tr>
                <th>Asal Sekolah Sebelumnya</th>
                <td class="colon">:</td>
                <td>{{ $student->previous_school ?? 'Belum Sekolah / Sekolah Sebelumnya' }}</td>
            </tr>
            <tr>
                <th>Alamat Domisili Siswa</th>
                <td class="colon">:</td>
                <td>{{ $student->address ?? '-' }}</td>
            </tr>
        </table>

        <!-- B. DATA ORANG TUA / WALI -->
        <div class="section-header">B. Data Orang Tua / Wali Utama</div>
        <table class="data-table">
            <tr>
                <th>Nama Orang Tua / Wali</th>
                <td class="colon">:</td>
                <td>
                    <strong>{{ $guardian->full_name ?? $guardian->name ?? $user->name ?? '-' }}</strong>
                    @if(isset($guardian->relationship))
                        ({{ is_object($guardian->relationship) && method_exists($guardian->relationship, 'label') ? $guardian->relationship->label() : ucfirst($guardian->relationship) }})
                    @endif
                </td>
            </tr>
            <tr>
                <th>Nomor Telepon / WhatsApp</th>
                <td class="colon">:</td>
                <td><strong>{{ $guardian->phone ?? '-' }}</strong> (Kontak Konfirmasi Panitia)</td>
            </tr>
            <tr>
                <th>Alamat Email Pendaftar</th>
                <td class="colon">:</td>
                <td>{{ $guardian->email ?? $user->email ?? '-' }}</td>
            </tr>
            <tr>
                <th>Pekerjaan</th>
                <td class="colon">:</td>
                <td>{{ $guardian->occupation ?? '-' }}</td>
            </tr>
        </table>
    @endif

    <!-- C. DOKUMEN PERSYARATAN TERUNGGAH -->
    <div class="section-header">{{ $type === 'teacher' ? 'C' : 'C' }}. Berkas Dokumen Persyaratan Digital</div>
    <table class="doc-list-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 35%;">Jenis Dokumen</th>
                <th style="width: 40%;">Nama Berkas Terunggah</th>
                <th style="width: 20%; text-align: center;">Status Verifikasi</th>
            </tr>
        </thead>
        <tbody>
            @forelse($documents as $idx => $doc)
                <tr>
                    <td style="text-align: center;">{{ $idx + 1 }}</td>
                    <td><strong>{{ ucwords(str_replace('_', ' ', $doc->document_type)) }}</strong></td>
                    <td style="color: #475569;">{{ $doc->original_name }}</td>
                    <td style="text-align: center;">
                        @if($doc->verification_status === 'valid')
                            <span class="badge-verified">&#10004; Sesuai</span>
                        @elseif($doc->verification_status === 'invalid')
                            <span style="color: #b91c1c; font-weight: bold;">Revisi</span>
                        @else
                            <span style="color: #b45309;">Menunggu Verifikasi</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; color: #64748b; padding: 6px;">
                        Berkas dokumen digital telah tersimpan pada sistem pendaftaran.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- D. LANGKAH & INSTRUKSI BERIKUTNYA -->
    <div class="instruction-box">
        <div class="instruction-title">
            &#9658; PETUNJUK TAHAPAN SELEKSI BERIKUTNYA:
        </div>
        <ol class="instruction-list">
            @if($type === 'teacher')
                <li>Pelamar yang memenuhi kualifikasi administrasi akan dihubungi oleh Tim Rekrutmen melalui kontak telepon / WhatsApp di atas.</li>
                <li>Pelamar wajib mempersiapkan Curriculum Vitae (CV) dan dokumen portofolio asli saat sesi wawancara daring / tatap muka.</li>
                <li>Simpan lembar bukti registrasi elektronik ini sebagai tanda bukti resmi pelamaran posisi tenaga pendidik.</li>
            @else
                <li>Calon murid wajib mengikuti <strong>tes observasi / pemetaan kemampuan secara offline</strong> di lokasi kampus Yayasan Padindi.</li>
                <li>Jadwal spesifik pelaksanaan tes akan dikirimkan oleh Panitia PPDB melalui nomor WhatsApp terdaftar maksimal 2 hari kerja setelah pendaftaran.</li>
                <li><strong>Wajib membawa cetakan lembar Tanda Bukti Pendaftaran Resmi ini</strong> beserta berkas fisik asli (Kartu Keluarga, Akta Kelahiran, dan Ijazah/Rapor) saat verifikasi ke sekolah.</li>
            @endif
        </ol>
    </div>

    <!-- E. AREA PENGESAHAN, STEMPEL DIGITAL & TANDA TANGAN -->
    <table class="signature-table">
        <tr>
            <!-- Kolom Tanda Tangan Orang Tua / Pelamar -->
            <td class="signature-cell" style="padding-right: 15px;">
                <div style="color: #334155; margin-bottom: 2px;">Jakarta, {{ $currentDate }}</div>
                <div style="font-weight: bold; color: #0f172a; margin-bottom: 45px;">
                    {{ $type === 'teacher' ? 'Pelamar Tenaga Pendidik,' : 'Orang Tua / Wali Calon Siswa,' }}
                </div>
                <div class="official-signature-line">
                    @if($type === 'teacher')
                        {{ $teacher->full_name ?? $user->name ?? 'Nama Pelamar' }}
                    @else
                        {{ $guardian->full_name ?? $guardian->name ?? $user->name ?? 'Nama Orang Tua / Wali' }}
                    @endif
                </div>
                <div style="font-size: 7pt; color: #64748b; margin-top: 1px;">Tanda tangan penyetor formulir</div>

                <!-- QR Seal Keaslian Dokumen -->
                <div style="margin-top: 10px;">
                    <table style="border-collapse: collapse;">
                        <tr>
                            <td style="vertical-align: middle; padding-right: 8px;">
                                <!-- SVG QR Code Emulation -->
                                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="50" height="50" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
                                    <!-- QR Target 1 (Top Left) -->
                                    <rect x="4" y="4" width="14" height="14" fill="#1e3a8a"/>
                                    <rect x="6" y="6" width="10" height="10" fill="#ffffff"/>
                                    <rect x="8" y="8" width="6" height="6" fill="#1e3a8a"/>
                                    <!-- QR Target 2 (Top Right) -->
                                    <rect x="32" y="4" width="14" height="14" fill="#1e3a8a"/>
                                    <rect x="34" y="6" width="10" height="10" fill="#ffffff"/>
                                    <rect x="36" y="8" width="6" height="6" fill="#1e3a8a"/>
                                    <!-- QR Target 3 (Bottom Left) -->
                                    <rect x="4" y="32" width="14" height="14" fill="#1e3a8a"/>
                                    <rect x="6" y="34" width="10" height="10" fill="#ffffff"/>
                                    <rect x="8" y="36" width="6" height="6" fill="#1e3a8a"/>
                                    <!-- Decorative QR Data Bits -->
                                    <rect x="22" y="6" width="4" height="4" fill="#1e3a8a"/>
                                    <rect x="22" y="14" width="4" height="4" fill="#1e3a8a"/>
                                    <rect x="14" y="22" width="4" height="4" fill="#1e3a8a"/>
                                    <rect x="22" y="22" width="6" height="6" fill="#0284c7"/>
                                    <rect x="32" y="22" width="4" height="4" fill="#1e3a8a"/>
                                    <rect x="40" y="22" width="4" height="4" fill="#1e3a8a"/>
                                    <rect x="22" y="32" width="4" height="4" fill="#1e3a8a"/>
                                    <rect x="32" y="32" width="6" height="4" fill="#1e3a8a"/>
                                    <rect x="40" y="38" width="6" height="6" fill="#1e3a8a"/>
                                    <rect x="22" y="40" width="4" height="6" fill="#1e3a8a"/>
                                    <rect x="30" y="42" width="4" height="4" fill="#0284c7"/>
                                </svg>
                            </td>
                            <td style="vertical-align: middle; font-size: 6.8pt; color: #475569; line-height: 1.25;">
                                <strong style="color: #1e3a8a;">VALIDASI ELEKTRONIK</strong><br>
                                Dokumen sah terverifikasi<br>
                                ID: <span style="font-family: monospace;">{{ $securityHash }}</span>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>

            <!-- Kolom Pengesahan Panitia & STEMPEL DIGITAL RESMI -->
            <td class="signature-cell" style="padding-left: 15px; text-align: left;">
                <div style="color: #334155; margin-bottom: 2px;">Diterbitkan di: Jakarta</div>
                <div style="font-weight: bold; color: #0f172a;">
                    {{ $type === 'teacher' ? 'Panitia Seleksi Rekrutmen,' : 'Panitia Penerimaan Siswa Baru (PPDB),' }}
                </div>
                <div style="font-size: 7.5pt; color: #475569; margin-bottom: 2px;">
                    {{ $settings['site_name'] ?? 'Yayasan Pendidikan Padindi' }}
                </div>

                <!-- Wadah Stempel Digital Resmi & Tanda Tangan Digital -->
                <div class="stamp-container">
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr>
                            <td style="vertical-align: middle; width: 110px;">
                                <!-- STEMPEL DIGITAL RESMI YAYASAN PADINDI (SVG Vektor Murni) -->
                                <svg width="102" height="102" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.88;">
                                    <!-- Lingkaran Luar Ganda -->
                                    <circle cx="65" cy="65" r="61" fill="none" stroke="#1e3a8a" stroke-width="2.8" />
                                    <circle cx="65" cy="65" r="56" fill="none" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="3,2" />
                                    <!-- Lingkaran Dalam -->
                                    <circle cx="65" cy="65" r="39" fill="none" stroke="#1e3a8a" stroke-width="1.4" />
                                    
                                    <!-- Teks Melingkar Atas -->
                                    <text x="65" y="24" font-family="DejaVu Sans, sans-serif" font-size="8" font-weight="bold" fill="#1e3a8a" text-anchor="middle" letter-spacing="0.5">YAYASAN PADINDI</text>
                                    <text x="65" y="34" font-family="DejaVu Sans, sans-serif" font-size="6.5" font-weight="bold" fill="#1e3a8a" text-anchor="middle">&#9733; JAKARTA BARAT &#9733;</text>
                                    
                                    <!-- Garis Pembatas Tengah -->
                                    <line x1="26" y1="48" x2="104" y2="48" stroke="#1e3a8a" stroke-width="1.2" />
                                    
                                    <!-- Teks Tengah Stempel -->
                                    <text x="65" y="59" font-family="DejaVu Sans, sans-serif" font-size="7.5" font-weight="bold" fill="#1e3a8a" text-anchor="middle">DIVERIFIKASI</text>
                                    <text x="65" y="70" font-family="DejaVu Sans, sans-serif" font-size="8" font-weight="bold" fill="#1e3a8a" text-anchor="middle">DIGITAL RESMI</text>
                                    <text x="65" y="81" font-family="DejaVu Sans, sans-serif" font-size="6.5" font-weight="bold" fill="#1e3a8a" text-anchor="middle">{{ date('d.m.Y') }}</text>
                                    
                                    <!-- Garis Pembatas Bawah -->
                                    <line x1="26" y1="86" x2="104" y2="86" stroke="#1e3a8a" stroke-width="1.2" />
                                    
                                    <!-- Teks Bawah Stempel -->
                                    <text x="65" y="100" font-family="DejaVu Sans, sans-serif" font-size="7" font-weight="bold" fill="#1e3a8a" text-anchor="middle">{{ $type === 'teacher' ? 'TIM REKRUTMEN GURU' : 'PANITIA PPDB RESMI' }}</text>
                                    <text x="65" y="111" font-family="DejaVu Sans, sans-serif" font-size="6" fill="#1e3a8a" text-anchor="middle">KEABSAHAN RESMI</text>
                                </svg>
                            </td>
                            <td style="vertical-align: middle; padding-left: 6px;">
                                <!-- Tanda Tangan Digital Resmi -->
                                <div style="font-family: monospace; font-size: 6.5pt; color: #0284c7; margin-bottom: 2px;">
                                    [TERVERIFIKASI DIGITAL]
                                </div>
                                <svg width="90" height="32" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M 5 25 Q 20 5, 35 22 T 60 15 T 85 28 T 95 18" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round"/>
                                    <path d="M 25 32 Q 55 25, 80 30" fill="none" stroke="#1e3a8a" stroke-width="1.2" stroke-linecap="round"/>
                                </svg>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="official-signature-line">
                    {{ $settings['foundation_leader'] ?? 'Drs. H. M. Nurhadi, M.Pd.' }}
                </div>
                <div style="font-size: 7.5pt; color: #475569; margin-top: 1px;">
                    {{ $settings['committee_nipy'] ?? 'NIPY. 19780512 200401 1 002' }}
                </div>
            </td>
        </tr>
    </table>

    <!-- 3. CATATAN & PERNYATAAN HUKUM (LEGAL DISCLAIMER) -->
    <div class="legal-footer">
        <strong>PERNYATAAN KEABSAHAN HUKUM DOKUMEN ELEKTRONIK:</strong><br>
        1. Tanda bukti pendaftaran resmi ini diterbitkan secara otomatis oleh Sistem Informasi Akademik Yayasan Pendidikan Padindi dan memiliki kekuatan hukum pembuktian administratif yang sah sesuai ketentuan Pasal 5 Ayat (1) Undang-Undang RI Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE).<br>
        2. Segala bentuk pemalsuan atau manipulasi terhadap data pada tanda bukti ini merupakan pelanggaran hukum dan dapat dituntut sesuai peraturan perundang-undangan yang berlaku.<br>
        3. Dokumen ini wajib dicetak dan dibawa oleh calon siswa/orang tua atau pelamar saat menghadiri verifikasi fisik di kampus Yayasan Padindi.
        <div class="security-meta">
            Dicetak pada: {{ $printedAt }} &bull; Hash Keamanan: SHA256:{{ $securityHash }} &bull; Verifikasi daring: {{ url('/cek-dokumen/' . $securityHash) }}
        </div>
    </div>

</body>
</html>
