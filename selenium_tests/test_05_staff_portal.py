import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestStaffPortal:
    """
    Automated test cases untuk Portal Staff/Guru Yayasan berdasarkan Test-Case-Padindi.xlsx
    Sheets: Dashboard Staff, Berita Staff, Konten Website Staff, Galeri Staff, Prestasi Staff, FAQ Staff, Media Library Staff, Publikasi Staff
    """

    def test_tc_dst_001_staff_dashboard(self, staff_driver, base_url):
        """TC-DST-001: Halaman Dashboard Portal Staf & Guru (/staff/dashboard)"""
        staff_driver.get(f"{base_url}/staff/dashboard")
        WebDriverWait(staff_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Portal Staf') or contains(text(), 'Dashboard') or contains(text(), 'Statistik Konten')]"))
        )
        assert "/staff" in staff_driver.current_url

    def test_tc_bst_001_staff_news_list(self, staff_driver, base_url):
        """TC-BST-001: Halaman Pengelolaan Berita Staf (/staff/berita)"""
        staff_driver.get(f"{base_url}/staff/berita")
        WebDriverWait(staff_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Berita') or contains(text(), 'Artikel') or contains(text(), 'Draf')]"))
        )
        assert "/staff/berita" in staff_driver.current_url

    def test_tc_gst_001_staff_gallery(self, staff_driver, base_url):
        """TC-GST-001: Halaman Pengelolaan Galeri Kegiatan Staf (/staff/galeri)"""
        staff_driver.get(f"{base_url}/staff/galeri")
        WebDriverWait(staff_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Galeri') or contains(text(), 'Foto Kegiatan')]"))
        )
        assert "/staff/galeri" in staff_driver.current_url

    def test_tc_pbst_001_staff_publications(self, staff_driver, base_url):
        """TC-PBST-001: Halaman Alur Moderasi & Publikasi Konten (/staff/publikasi)"""
        staff_driver.get(f"{base_url}/staff/publikasi")
        WebDriverWait(staff_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Publikasi') or contains(text(), 'Moderasi') or contains(text(), 'Menunggu')]"))
        )
        assert "/staff/publikasi" in staff_driver.current_url

    def test_tc_fst_001_staff_faq(self, staff_driver, base_url):
        """TC-FST-001: Halaman Pengelolaan Tanya Jawab / FAQ (/staff/faq)"""
        staff_driver.get(f"{base_url}/staff/faq")
        WebDriverWait(staff_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'FAQ') or contains(text(), 'Tanya Jawab')]"))
        )
        assert "/staff/faq" in staff_driver.current_url

    def test_tc_mst_001_staff_media_library(self, staff_driver, base_url):
        """TC-MST-001: Halaman Pustaka Media (/staff/media)"""
        staff_driver.get(f"{base_url}/staff/media")
        WebDriverWait(staff_driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Media') or contains(text(), 'Pustaka')]"))
        )
        assert "/staff/media" in staff_driver.current_url
