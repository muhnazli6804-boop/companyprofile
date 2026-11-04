import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(__dirname, '../../../docs/design/screenshots');
const axeScriptPath = path.resolve(__dirname, '../../node_modules/axe-core/axe.min.js');

interface AxeViolation {
  impact?: string;
  id: string;
  description: string;
}

interface AxeResults {
  violations: AxeViolation[];
}

async function runAxe(page: Page) {
  await page.addScriptTag({ path: axeScriptPath });
  const results = await page.evaluate(async () => {
    const axeGlobal = (window as unknown as { axe: { run: (options: unknown) => Promise<AxeResults> } }).axe;
    return await axeGlobal.run({
      rules: {
        region: { enabled: false },
      },
    });
  });
  const seriousOrCritical = results.violations.filter(
    (v: AxeViolation) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(seriousOrCritical).toEqual([]);
}

test.describe('Pendaftaran Murid & Guru — Yayasan Padindi (E2E, Aksesibilitas, & Visual)', () => {
  // Timestamp unik untuk akun
  const ts = Date.now();
  const parentEmail = `ortu_${ts}@padindi-test.com`;
  const teacherEmail = `guru_${ts}@padindi-test.com`;
  const attackerEmail = `peretas_${ts}@padindi-test.com`;
  const password = 'Password123!';

  test('US-R1, US-R7, US-R13: Hub Pendaftaran & Responsivitas Visual', async ({ page }) => {
    // 1. Desktop 1280px
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/pendaftaran');
    await expect(page.getByRole('heading', { name: /Pendaftaran Yayasan Padindi/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mulai Pendaftaran Murid/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Mulai Pendaftaran Guru/i })).toBeVisible();

    await runAxe(page);
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-hub-1280.png'),
      fullPage: true,
    });

    // 2. Tablet 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-hub-768.png'),
      fullPage: true,
    });

    // 3. Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-hub-375.png'),
      fullPage: true,
    });

    // 4. Verifikasi Guest Guard (US-R1: jika belum login, diarahkan ke /masuk?returnTo=...)
    await page.getByRole('link', { name: /Mulai Pendaftaran Murid/i }).click();
    await expect(page).toHaveURL(/\/masuk\?returnTo=%2Fpendaftaran%2Fmurid/);
  });

  test('US-R1 s.d. US-R6: Alur Lengkap Pendaftaran Murid Baru (PPDB)', async ({ page }) => {
    // 1. Buat akun Orang Tua / Wali
    await page.goto('/daftar-akun?returnTo=%2Fpendaftaran%2Fmurid');
    await page.fill('#name', 'Bapak Hendra Pratama');
    await page.fill('#email', parentEmail);
    await page.fill('#phone', '081234567890');
    await page.fill('#password', password);
    await page.fill('#password_confirmation', password);
    await page.click('button[type="submit"]');

    // Menuju formulir murid
    await expect(page).toHaveURL(/\/pendaftaran\/murid/);
    await expect(page.getByRole('heading', { name: /Sesi 1: Data Calon Murid/i })).toBeVisible();

    // Visual screenshot formulir murid
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-student-form-1280.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-student-form-768.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-student-form-375.png'),
      fullPage: true,
    });

    // Kembalikan ke Desktop untuk pengisian
    await page.setViewportSize({ width: 1280, height: 800 });
    await runAxe(page);

    // 2. Isi Formulir Sesi 1
    // Pilih jenjang SD
    await page.waitForSelector('input[name="education_unit_id"]');
    await page.locator('input[name="education_unit_id"]').first().check();

    // Data Murid
    await page.fill('input[name="full_name"]', 'Ananda Rizky Pratama');
    await page.locator('input[name="gender"][value="L"]').check();
    await page.fill('input[name="birth_place"]', 'Jakarta');
    await page.fill('input[name="birth_date"]', '2018-04-12');
    await page.fill('input[name="nik"]', '3171011204180001');
    await page.fill('input[name="address"]', 'Jl. Flamboyan No. 24, RT 03/RW 05, Cengkareng');

    // Data Wali
    await page.locator('input[name="guardian_relationship"][value="father"]').check();
    await page.fill('input[name="guardian_name"]', 'Bapak Hendra Pratama');
    await page.fill('input[name="guardian_phone"]', '081234567890');

    // Checkbox pernyataan & consent
    await page.locator('input[name="declaration_accepted"]').check();
    await page.locator('input[name="consent_accepted"]').check();

    // Simpan formulir Sesi 1
    await page.getByRole('button', { name: /Simpan formulir & lanjut unggah berkas/i }).click();

    // 3. Masuk ke Sesi 2: Unggah Persyaratan
    await expect(page).toHaveURL(/\/pendaftaran\/murid\/\d+\/persyaratan/);
    await expect(page.getByRole('heading', { name: /Sesi 2: Unggah Dokumen Persyaratan/i })).toBeVisible();

    // Tombol Lanjut ke Konfirmasi harus dinonaktifkan sebelum semua dokumen wajib diunggah
    await expect(page.getByRole('button', { name: /Lanjut ke Konfirmasi/i })).toBeDisabled();

    // Unggah KK (family_card)
    const dummyPdf = Buffer.from('%PDF-1.4 dummy content for padindi registration testing');
    const dummyImg = Buffer.from('dummy image content');

    await page.getByTestId('file-input-family_card').setInputFiles({
      name: 'kartu_keluarga.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdf,
    });
    await expect(page.locator('[data-document-type="family_card"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Unggah Ijazah / SKL (diploma)
    await page.getByTestId('file-input-diploma').setInputFiles({
      name: 'ijazah_tk.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdf,
    });
    await expect(page.locator('[data-document-type="diploma"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Unggah Pas Foto (photo)
    await page.getByTestId('file-input-photo').setInputFiles({
      name: 'pas_foto_rizky.png',
      mimeType: 'image/png',
      buffer: dummyImg,
    });
    await expect(page.locator('[data-document-type="photo"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Tombol Lanjut ke Konfirmasi sekarang aktif
    await expect(page.getByRole('button', { name: /Lanjut ke Konfirmasi/i })).toBeEnabled();
    await page.getByRole('button', { name: /Lanjut ke Konfirmasi/i }).click();

    // 4. Masuk ke Sesi 3: Konfirmasi & Kirim Pendaftaran
    await expect(page).toHaveURL(/\/pendaftaran\/murid\/\d+\/konfirmasi/);
    await expect(page.getByRole('heading', { name: /Sesi 3: Konfirmasi & Kirim Pendaftaran/i })).toBeVisible();

    // Verifikasi ringkasan data calon murid
    await expect(page.getByText('Ananda Rizky Pratama')).toBeVisible();
    await expect(page.getByText('Bapak Hendra Pratama')).toBeVisible();

    // Setujui pernyataan akhir
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Kirim Pendaftaran/i }).click();

    // 5. Masuk ke Halaman Sukses (US-R5)
    await expect(page).toHaveURL(/\/pendaftaran\/murid\/\d+\/selesai/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Pendaftaran Berhasil Dikirim/i })).toBeVisible();

    // Verifikasi nomor pendaftaran format PPDB-{tahun}-{00000}
    const regNumberEl = page.locator('.font-mono');
    await expect(regNumberEl).toBeVisible();
    const regNumberText = await regNumberEl.textContent();
    expect(regNumberText).toMatch(/^PPDB-\d{4}-\d{5}$/);

    // Verifikasi US-R5: Panel langkah berikutnya ikuti tes offline
    await expect(
      page.getByRole('heading', { name: /Langkah Berikutnya: Ikuti Tes Secara Offline/i })
    ).toBeVisible();
    await expect(
      page.getByText(/observasi \/ tes pemetaan kemampuan secara offline langsung di lokasi sekolah/i)
    ).toBeVisible();

    // 6. Masuk ke Halaman Status Pendaftaran (US-R11)
    await page.getByRole('link', { name: /Lihat Status Pendaftaran/i }).click();
    await expect(page).toHaveURL(/\/akun\/pendaftaran\/murid\/\d+/);
    await expect(page.getByText(/Terkirim/i).first()).toBeVisible();
    await expect(page.getByText('Riwayat Aktivitas & Perubahan Status')).toBeVisible();

    // Visual screenshot halaman status
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-status-1280.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-status-768.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-status-375.png'),
      fullPage: true,
    });
  });

  test('US-R7 s.d. US-R10: Alur Lengkap Pendaftaran Guru & Masked Phone', async ({ page }) => {
    // 1. Buat akun Guru Pelamar
    await page.goto('/daftar-akun?returnTo=%2Fpendaftaran%2Fguru');
    await page.fill('#name', 'Ibu Rahmawati, S.Pd.');
    await page.fill('#email', teacherEmail);
    await page.fill('#phone', '081298765432');
    await page.fill('#password', password);
    await page.fill('#password_confirmation', password);
    await page.click('button[type="submit"]');

    // Menuju formulir guru
    await expect(page).toHaveURL(/\/pendaftaran\/guru/);
    await expect(page.getByRole('heading', { name: /Sesi 1: Formulir Lamaran Pendidik/i })).toBeVisible();

    // Visual screenshot formulir guru
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-teacher-form-1280.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-teacher-form-768.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshotsDir, 'registration-teacher-form-375.png'),
      fullPage: true,
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await runAxe(page);

    // 2. Isi Formulir Lamaran Guru
    await page.fill('#applied_position', 'Guru Bahasa Indonesia SMP');
    await page.fill('#teaching_subjects_text', 'Bahasa Indonesia, Literasi Kreatif');
    await page.fill('#full_name', 'Ibu Rahmawati, S.Pd.');
    await page.locator('input[value="P"]').first().check();
    await page.fill('#nik', '3171011508920002');
    await page.fill('#birth_place', 'Semarang');
    await page.fill('#birth_date', '1992-08-15');
    await page.fill('#phone', '081298765432');
    await page.fill('#email', teacherEmail);
    await page.fill('#address', 'Jl. Meruya Ilir No. 15, Kembangan, Jakarta Barat');

    // Pendidikan Formal (default row sudah ada jenjang S1)
    await page.fill('input[placeholder*="Universitas Negeri Jakarta"]', 'Universitas Negeri Semarang');
    await page.fill('input[placeholder*="Pendidikan Matematika"]', 'Pendidikan Bahasa dan Sastra Indonesia');

    // Checkbox pernyataan & consent
    await page.locator('input[name="declaration_accepted"]').check();
    await page.locator('input[name="consent_accepted"]').check();

    // Simpan formulir Sesi 1
    await page.getByRole('button', { name: /Simpan Formulir & Lanjut ke Persyaratan/i }).click();

    // 3. Masuk ke Sesi 2: Unggah Persyaratan Guru
    await expect(page).toHaveURL(/\/pendaftaran\/guru\/\d+\/persyaratan/);
    await expect(page.getByRole('heading', { name: /Sesi 2: Unggah Berkas & Portofolio/i })).toBeVisible();

    const dummyPdf = Buffer.from('%PDF-1.4 dummy cv/ijazah for teacher application');
    const dummyImg = Buffer.from('dummy photo content');

    // Unggah CV
    await page.getByTestId('file-input-cv_portfolio').setInputFiles({
      name: 'cv_rahmawati.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdf,
    });
    await expect(page.locator('[data-document-type="cv_portfolio"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Unggah KK
    await page.getByTestId('file-input-family_card').setInputFiles({
      name: 'kk_rahmawati.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdf,
    });
    await expect(page.locator('[data-document-type="family_card"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Unggah Ijazah
    await page.getByTestId('file-input-diploma').setInputFiles({
      name: 'ijazah_s1.pdf',
      mimeType: 'application/pdf',
      buffer: dummyPdf,
    });
    await expect(page.locator('[data-document-type="diploma"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Unggah Pas Foto
    await page.getByTestId('file-input-photo').setInputFiles({
      name: 'foto_formal.png',
      mimeType: 'image/png',
      buffer: dummyImg,
    });
    await expect(page.locator('[data-document-type="photo"]').getByText(/Terunggah/i)).toBeVisible({ timeout: 10000 });

    // Lanjut ke Konfirmasi
    await page.getByRole('button', { name: /Lanjut ke Konfirmasi/i }).click();

    // 4. Masuk ke Sesi 3: Konfirmasi Lamaran (US-R10)
    await expect(page).toHaveURL(/\/pendaftaran\/guru\/\d+\/konfirmasi/);

    // Verifikasi US-R10: nomor telepon tersamar ditampilkan pada panel verifikasi
    await expect(page.getByText('Verifikasi Kontak untuk Interview Online')).toBeVisible();
    await expect(page.getByText('0812****5432')).toBeVisible();

    // Setujui pernyataan & kirim
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Kirim Lamaran/i }).click();

    // 5. Masuk ke Halaman Sukses Guru (US-R10)
    await expect(page).toHaveURL(/\/pendaftaran\/guru\/\d+\/selesai/);
    await expect(page.getByRole('heading', { name: /Lamaran Berhasil Dikirim/i })).toBeVisible();

    // Verifikasi nomor registrasi guru format TCH-{tahun}-{00000}
    const regNumberEl = page.locator('.font-mono').first();
    await expect(regNumberEl).toBeVisible();
    const regNumberText = await regNumberEl.textContent();
    expect(regNumberText).toMatch(/^TCH-\d{4}-\d{5}$/);

    // Verifikasi US-R10: Panel Langkah berikutnya interview online & nomor telepon
    await expect(
      page.getByRole('heading', { name: /Langkah Berikutnya: Interview Online/i })
    ).toBeVisible();
    await expect(page.getByText('0812****5432')).toBeVisible();
  });

  test('US-R12: Keamanan Data & Pencegahan Akses Ilegal (Anti-IDOR)', async ({ page }) => {
    // 1. Buat pendaftaran murid oleh user sah
    await page.goto('/daftar-akun');
    await page.fill('#name', 'Pemilik Sah');
    await page.fill('#email', `pemilik_${ts}@padindi-test.com`);
    await page.fill('#phone', '081111111111');
    await page.fill('#password', password);
    await page.fill('#password_confirmation', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/pendaftaran/);

    await page.goto('/pendaftaran/murid');
    await page.waitForSelector('input[name="education_unit_id"]');
    await page.locator('input[name="education_unit_id"]').first().check();
    await page.fill('input[name="full_name"]', 'Anak Pemilik Sah');
    await page.locator('input[name="gender"][value="L"]').check();
    await page.fill('input[name="birth_place"]', 'Jakarta');
    await page.fill('input[name="birth_date"]', '2017-01-01');
    await page.fill('input[name="nik"]', '3171010101170001');
    await page.fill('input[name="address"]', 'Alamat Rahasia Keluarga');
    await page.locator('input[name="guardian_relationship"][value="father"]').check();
    await page.fill('input[name="guardian_name"]', 'Pemilik Sah');
    await page.fill('input[name="guardian_phone"]', '081111111111');
    await page.locator('input[name="declaration_accepted"]').check();
    await page.locator('input[name="consent_accepted"]').check();
    await page.getByRole('button', { name: /Simpan formulir & lanjut unggah berkas/i }).click();

    // Dapatkan ID pendaftaran dari URL
    await page.waitForURL(/\/pendaftaran\/murid\/(\d+)\/persyaratan/);
    const match = page.url().match(/\/pendaftaran\/murid\/(\d+)\/persyaratan/);
    const victimAppId = match?.[1];
    expect(victimAppId).toBeTruthy();

    // Logout
    await page.evaluate(() => localStorage.removeItem('auth_token'));

    // 2. Login sebagai pengguna lain (attacker)
    await page.goto('/daftar-akun');
    await page.fill('#name', 'Pengguna Asing');
    await page.fill('#email', attackerEmail);
    await page.fill('#phone', '089999999999');
    await page.fill('#password', password);
    await page.fill('#password_confirmation', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/pendaftaran/, { timeout: 10000 });

    // Attacker mencoba mengakses URL data murid milik user sah
    await page.goto(`/akun/pendaftaran/murid/${victimAppId}`);

    // Verifikasi proteksi IDOR: Tampil "Pendaftaran Tidak Ditemukan" (HTTP 404), bukan data korban
    await expect(
      page.getByRole('heading', { name: /Pendaftaran Tidak Ditemukan/i })
    ).toBeVisible();
    await expect(page.getByText('Anak Pemilik Sah')).not.toBeVisible();
    await expect(page.getByText('Alamat Rahasia Keluarga')).not.toBeVisible();
  });
});
