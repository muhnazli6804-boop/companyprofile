#!/usr/bin/env python3
"""
Selenium Automated Test Runner — Yayasan Padindi
Berdasarkan dokumen Test-Case-Padindi.xlsx

Penggunaan:
    python run_tests.py                   # Menjalankan seluruh tes dalam mode headless
    python run_tests.py --headed          # Menjalankan tes dengan membuka jendela browser Chrome
    python run_tests.py -k test_01        # Menjalankan hanya suite halaman publik
    python run_tests.py -k test_02        # Menjalankan hanya suite autentikasi
    python run_tests.py -k test_04        # Menjalankan hanya suite portal admin
    python run_tests.py -k test_05        # Menjalankan hanya suite portal staff
"""

import sys
import os
import argparse
import pytest

def main():
    parser = argparse.ArgumentParser(description="Automated Selenium Testing untuk Website Yayasan Padindi")
    parser.add_argument("--headed", action="store_true", help="Buka jendela browser nyata (non-headless)")
    parser.add_argument("--base-url", default="http://127.0.0.1:5173", help="Base URL aplikasi frontend")
    parser.add_argument("-k", "--filter", help="Filter nama tes / file tertentu (misal: test_01, test_02)")
    parser.add_argument("-v", "--verbose", action="store_true", default=True, help="Tampilkan output verbose")
    
    args, unknown = parser.parse_known_args()

    test_dir = os.path.dirname(os.path.abspath(__file__))
    
    pytest_args = [
        test_dir,
        f"--base-url={args.base_url}",
    ]
    
    if args.headed:
        pytest_args.append("--headed")
        
    if args.verbose:
        pytest_args.append("-v")
        
    if args.filter:
        pytest_args.extend(["-k", args.filter])
        
    pytest_args.extend(unknown)
    
    print("\n" + "="*70)
    print("  MEMULAI AUTOMATED TESTING SELENIUM — YAYASAN PADINDI")
    print(f"  Target URL: {args.base_url}")
    print(f"  Mode      : {'Headed (GUI)' if args.headed else 'Headless'}")
    print("="*70 + "\n")
    
    exit_code = pytest.main(pytest_args)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
