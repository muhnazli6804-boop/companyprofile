import os
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5173")
API_URL = os.environ.get("API_URL", "http://127.0.0.1:8000/api/v1")

def pytest_addoption(parser):
    parser.addoption(
        "--headed",
        action="store_true",
        default=False,
        help="Jalankan browser dalam mode GUI (bukan headless)"
    )
    parser.addoption(
        "--base-url",
        action="store",
        default=BASE_URL,
        help=f"Base URL frontend (default: {BASE_URL})"
    )

@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url")

def create_chrome_driver(headed: bool = False):
    options = ChromeOptions()
    if not headed:
        options.add_argument("--headless=new")
    
    options.add_argument("--window-size=1366,768")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    
    browser = webdriver.Chrome(options=options)
    browser.implicitly_wait(8)
    return browser

@pytest.fixture(scope="class")
def driver(request):
    headed = request.config.getoption("--headed")
    browser = create_chrome_driver(headed)
    
    yield browser
    
    try:
        browser.quit()
    except Exception:
        pass

@pytest.fixture(scope="class")
def admin_driver(driver, base_url):
    """Browser instance yang sudah login sebagai Super Admin"""
    driver.get(f"{base_url}/masuk")
    time.sleep(1)
    
    email_input = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='email'], input#email"))
    )
    email_input.clear()
    email_input.send_keys("admin@padindi.id")

    pass_input = driver.find_element(By.CSS_SELECTOR, "input[name='password'], input#password")
    pass_input.clear()
    pass_input.send_keys("password123")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    WebDriverWait(driver, 15).until(
        lambda d: "/admin/dashboard" in d.current_url or "/admin" in d.current_url
    )
    return driver

@pytest.fixture(scope="class")
def staff_driver(driver, base_url):
    """Browser instance yang sudah login sebagai Staff"""
    driver.get(f"{base_url}/masuk")
    time.sleep(1)
    
    email_input = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='email'], input#email"))
    )
    email_input.clear()
    email_input.send_keys("staff@padindi.id")

    pass_input = driver.find_element(By.CSS_SELECTOR, "input[name='password'], input#password")
    pass_input.clear()
    pass_input.send_keys("password123")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    WebDriverWait(driver, 15).until(
        lambda d: "/staff/dashboard" in d.current_url or "/staff" in d.current_url
    )
    return driver
