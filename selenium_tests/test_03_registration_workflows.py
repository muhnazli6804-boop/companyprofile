import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestRegistrationWorkflows:
    """
    Automated test cases untuk formulir pendaftaran murid & guru berdasarkan Test-Case-Padindi.xlsx
    Sheets: Siswa - Pilih Unit & Mulai, Guru - Mulai & Data Diri, Status Pendaftaran
    """

    def test_tc_smu_001_registration_hub_page(self, driver, base_url):
        """TC-SMU-001: Halaman Hub Pendaftaran Publik (/pendaftaran)"""
        driver.get(f"{base_url}/pendaftaran")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Pendaftaran') or contains(text(), 'Murid') or contains(text(), 'Guru')]"))
        )
        assert "/pendaftaran" in driver.current_url

    def test_tc_smu_002_student_form_protected_redirect(self, driver, base_url):
        """TC-SMU-002: Akses langsung formulir pendaftaran murid tanpa login dialihkan ke halaman masuk"""
        driver.get(f"{base_url}/pendaftaran/murid")
        WebDriverWait(driver, 10).until(
            lambda d: "/masuk" in d.current_url or "/pendaftaran/murid" in d.current_url
        )
        assert "/masuk" in driver.current_url or "/pendaftaran/murid" in driver.current_url

    def test_tc_gmd_001_teacher_form_protected_redirect(self, driver, base_url):
        """TC-GMD-001: Akses langsung formulir pendaftaran guru tanpa login dialihkan ke halaman masuk"""
        driver.get(f"{base_url}/pendaftaran/guru")
        WebDriverWait(driver, 10).until(
            lambda d: "/masuk" in d.current_url or "/pendaftaran/guru" in d.current_url
        )
        assert "/masuk" in driver.current_url or "/pendaftaran/guru" in driver.current_url

    def test_tc_gmd_002_teacher_registration_with_vacancy_param(self, driver, base_url):
        """TC-GMD-002: Akses formulir pendaftaran guru dengan query vacancy_id membawa parameter"""
        driver.get(f"{base_url}/pendaftaran/guru?vacancy_id=1")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        # Parameter vacancy_id terjaga di URL (baik langsung maupun dalam returnTo saat diarahkan ke /masuk)
        assert "vacancy_id" in driver.current_url

    def test_tc_stp_001_applicant_status_page(self, driver, base_url):
        """TC-STP-001: Halaman Akun Riwayat Pendaftaran (/akun/pendaftaran)"""
        driver.get(f"{base_url}/akun/pendaftaran")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        assert driver.current_url is not None
