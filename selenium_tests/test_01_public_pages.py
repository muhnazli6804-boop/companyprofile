import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestPublicPages:
    """
    Automated test cases untuk halaman publik berdasarkan Test-Case-Padindi.xlsx
    Sheets: Beranda, Profil Yayasan, Unit Pendidikan, Berita, Galeri, Info Pendaftaran, Lowongan Guru, Kebijakan Privasi, Kontak
    """

    def test_tc_brd_001_home_hero_and_about(self, driver, base_url):
        """TC-BRD-001: Hero dan bagian Tentang Yayasan tampil tanpa login"""
        driver.get(f"{base_url}/")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Yayasan Padindi')]"))
        )
        assert "Yayasan Padindi" in driver.page_source

    def test_tc_brd_002_home_visi_misi(self, driver, base_url):
        """TC-BRD-002: Bagian Visi & Misi tampil di Beranda"""
        driver.get(f"{base_url}/")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Visi') or contains(text(), 'Misi')]"))
        )
        body_text = driver.find_element(By.TAG_NAME, "body").text
        assert "Visi" in body_text or "Misi" in body_text

    def test_tc_pry_001_about_page(self, driver, base_url):
        """TC-PRY-001: Halaman Profil / Tentang Yayasan (/tentang)"""
        driver.get(f"{base_url}/tentang")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Tentang') or contains(text(), 'Profil') or contains(text(), 'Yayasan Padindi')]"))
        )
        assert "/tentang" in driver.current_url

    def test_tc_unp_001_education_units_page(self, driver, base_url):
        """TC-UNP-001: Halaman Unit Pendidikan (/unit)"""
        driver.get(f"{base_url}/unit")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Unit') or contains(text(), 'Pendidikan') or contains(text(), 'TK') or contains(text(), 'SD')]"))
        )
        assert "/unit" in driver.current_url

    def test_tc_brt_001_news_page(self, driver, base_url):
        """TC-BRT-001: Halaman Berita & Artikel (/berita)"""
        driver.get(f"{base_url}/berita")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Berita') or contains(text(), 'Artikel')]"))
        )
        assert "/berita" in driver.current_url

    def test_tc_glr_001_gallery_page(self, driver, base_url):
        """TC-GLR-001: Halaman Galeri Kegiatan (/galeri)"""
        driver.get(f"{base_url}/galeri")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Galeri') or contains(text(), 'Dokumentasi')]"))
        )
        assert "/galeri" in driver.current_url

    def test_tc_inf_001_registration_info_page(self, driver, base_url):
        """TC-INF-001: Halaman Informasi Pendaftaran (/informasi-pendaftaran)"""
        driver.get(f"{base_url}/informasi-pendaftaran")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Informasi Pendaftaran') or contains(text(), 'PPDB')]"))
        )
        assert "/informasi-pendaftaran" in driver.current_url

    def test_tc_lwg_001_vacancy_list_page(self, driver, base_url):
        """TC-LWG-001: Halaman Lowongan Guru & Tenaga Pendidik (/lowongan-guru)"""
        driver.get(f"{base_url}/lowongan-guru")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Lowongan') or contains(text(), 'Karir') or contains(text(), 'Guru')]"))
        )
        assert "/lowongan-guru" in driver.current_url

    def test_tc_kbp_001_privacy_policy_page(self, driver, base_url):
        """TC-KBP-001: Halaman Kebijakan Privasi (/kebijakan-privasi)"""
        driver.get(f"{base_url}/kebijakan-privasi")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Kebijakan Privasi')]"))
        )
        assert "/kebijakan-privasi" in driver.current_url

    def test_tc_ktk_001_contact_form(self, driver, base_url):
        """TC-KTK-001: Formulir Kontak & Pengaduan (/kontak)"""
        driver.get(f"{base_url}/kontak")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "form"))
        )
        inputs = driver.find_elements(By.CSS_SELECTOR, "form input")
        textareas = driver.find_elements(By.CSS_SELECTOR, "form textarea")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "form button[type='submit']")

        assert len(inputs) >= 2
        assert len(textareas) >= 1
        assert submit_btn is not None
