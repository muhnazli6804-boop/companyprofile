import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAdminPortal:
    """
    Automated test cases untuk Portal Administrator berdasarkan Test-Case-Padindi.xlsx
    Sheets: Dashboard Admin, Daftar & Detail Pendaftar, Kelola Pengguna, Pesan Kontak, Pengaturan Situs, CMS
    """

    def test_tc_dab_001_admin_dashboard_navigation(self, admin_driver, base_url):
        """TC-DAB-001: Dashboard Admin menampilkan kartu metrik dan menu sidebar"""
        admin_driver.get(f"{base_url}/admin/dashboard")
        WebDriverWait(admin_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Dashboard') or contains(text(), 'Statistik') or contains(text(), 'Ringkasan')]"))
        )
        assert "/admin" in admin_driver.current_url

    def test_tc_ddp_001_student_applications_list(self, admin_driver, base_url):
        """TC-DDP-001: Panel verifikasi & data pendaftaran murid (/admin/pendaftaran-siswa)"""
        admin_driver.get(f"{base_url}/admin/pendaftaran-siswa")
        WebDriverWait(admin_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Pendaftaran') or contains(text(), 'Calon Murid') or contains(text(), 'Siswa')]"))
        )
        assert "/admin/pendaftaran-siswa" in admin_driver.current_url

    def test_tc_ddp_002_teacher_applications_list(self, admin_driver, base_url):
        """TC-DDP-002: Panel verifikasi & data lamaran guru (/admin/lamaran-guru)"""
        admin_driver.get(f"{base_url}/admin/lamaran-guru")
        WebDriverWait(admin_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Lamaran') or contains(text(), 'Guru') or contains(text(), 'Rekrutmen')]"))
        )
        assert "/admin/lamaran-guru" in admin_driver.current_url

    def test_tc_kpg_001_users_and_roles_management(self, admin_driver, base_url):
        """TC-KPG-001: Panel Pengelolaan Pengguna & Role (/admin/pengguna)"""
        admin_driver.get(f"{base_url}/admin/pengguna")
        WebDriverWait(admin_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Pengguna') or contains(text(), 'Role') or contains(text(), 'Hak Akses')]"))
        )
        assert "/admin/pengguna" in admin_driver.current_url

    def test_tc_psk_001_contact_messages_inbox(self, admin_driver, base_url):
        """TC-PSK-001: Kotak masuk pesan & pengaduan (/admin/pesan-kontak)"""
        admin_driver.get(f"{base_url}/admin/pesan-kontak")
        WebDriverWait(admin_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Pesan Masuk') or contains(text(), 'Pengaduan')]"))
        )
        assert "/admin/pesan-kontak" in admin_driver.current_url

    def test_tc_cms_001_cms_management_page(self, admin_driver, base_url):
        """TC-CMS-001: Pengelolaan Konten Landing Page & Berita (/admin/cms)"""
        admin_driver.get(f"{base_url}/admin/cms")
        WebDriverWait(admin_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'CMS') or contains(text(), 'Konten') or contains(text(), 'Berita')]"))
        )
        assert "/admin/cms" in admin_driver.current_url
