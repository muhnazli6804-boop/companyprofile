import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAuthentication:
    """
    Automated test cases untuk modul autentikasi berdasarkan Test-Case-Padindi.xlsx
    Sheets: Registrasi Akun, Login Pendaftar, Login Admin, Logout, Lupa Password, Reset Password, Verifikasi Email
    """

    def test_tc_reg_001_register_page_render(self, driver, base_url):
        """TC-REG-001: Halaman Registrasi Akun Pendaftar (/daftar-akun)"""
        driver.get(f"{base_url}/daftar-akun")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Daftar') or contains(text(), 'Registrasi')]"))
        )
        assert driver.find_element(By.CSS_SELECTOR, "input[name='name'], input#name") is not None
        assert driver.find_element(By.CSS_SELECTOR, "input[name='email'], input#email") is not None
        assert driver.find_element(By.CSS_SELECTOR, "input[name='password'], input#password") is not None

    def test_tc_reg_002_register_validation_empty(self, driver, base_url):
        """TC-REG-002: Validasi formulir pendaftaran saat dikirim kosong"""
        driver.get(f"{base_url}/daftar-akun")
        submit_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
        )
        submit_btn.click()
        time.sleep(1)
        assert "/daftar-akun" in driver.current_url

    def test_tc_lgn_001_login_page_render(self, driver, base_url):
        """TC-LGN-001: Halaman Masuk Akun (/masuk)"""
        driver.get(f"{base_url}/masuk")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Masuk')]"))
        )
        assert driver.find_element(By.CSS_SELECTOR, "input[name='email'], input#email") is not None
        assert driver.find_element(By.CSS_SELECTOR, "input[name='password'], input#password") is not None

    def test_tc_lgn_002_login_invalid_credentials(self, driver, base_url):
        """TC-LGN-002: Login dengan kredensial salah"""
        driver.get(f"{base_url}/masuk")
        email_input = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='email'], input#email"))
        )
        email_input.clear()
        email_input.send_keys("user_salah@padindi.id")

        pass_input = driver.find_element(By.CSS_SELECTOR, "input[name='password'], input#password")
        pass_input.clear()
        pass_input.send_keys("passwordsalah123")

        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'salah') or contains(text(), 'tidak cocok') or contains(text(), 'Gagal') or contains(@role, 'alert')]"))
        )
        assert "/masuk" in driver.current_url

    def test_tc_lga_001_login_admin_success(self, driver, base_url):
        """TC-LGA-001: Super Admin login berhasil dan diarahkan ke /admin/dashboard"""
        driver.get(f"{base_url}/masuk")
        email_input = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='email'], input#email"))
        )
        email_input.clear()
        email_input.send_keys("admin@padindi.id")

        pass_input = driver.find_element(By.CSS_SELECTOR, "input[name='password'], input#password")
        pass_input.clear()
        pass_input.send_keys("password123")

        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()

        WebDriverWait(driver, 15).until(
            lambda d: "/admin/dashboard" in d.current_url or "/admin" in d.current_url
        )
        assert "/admin" in driver.current_url

    def test_tc_lpw_001_forgot_password_page(self, driver, base_url):
        """TC-LPW-001: Halaman Lupa Kata Sandi (/lupa-kata-sandi)"""
        driver.get(f"{base_url}/lupa-kata-sandi")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Lupa') or contains(text(), 'Kata Sandi')]"))
        )
        assert driver.find_element(By.CSS_SELECTOR, "input[name='email'], input#email") is not None

    def test_tc_ver_001_email_verification_feedback(self, driver, base_url):
        """TC-VER-001: Halaman Verifikasi Email dengan status sukses (/verifikasi-email?verified=1)"""
        driver.get(f"{base_url}/verifikasi-email?verified=1")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Berhasil') or contains(text(), 'Terverifikasi')]"))
        )
        body = driver.find_element(By.TAG_NAME, "body").text
        assert "Berhasil" in body or "Terverifikasi" in body
