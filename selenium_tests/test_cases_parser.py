import os
import openpyxl

EXCEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'Test-Case-Padindi.xlsx')

def get_test_cases_by_sheet(sheet_name: str, excel_path: str = EXCEL_PATH):
    """
    Membaca seluruh test case pada sheet tertentu dari file Test-Case-Padindi.xlsx
    """
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"File Test Case tidak ditemukan di: {excel_path}")
    
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    if sheet_name not in wb.sheetnames:
        raise ValueError(f"Sheet '{sheet_name}' tidak ditemukan. Sheet yang tersedia: {wb.sheetnames}")
    
    sheet = wb[sheet_name]
    cases = []
    current_case = None

    for r in range(9, sheet.max_row + 1):
        sc_id = sheet.cell(r, 1).value
        tc_id = sheet.cell(r, 2).value
        scenario = sheet.cell(r, 3).value
        tc_type = sheet.cell(r, 4).value
        tc_name = sheet.cell(r, 5).value
        precond = sheet.cell(r, 6).value
        step_num = sheet.cell(r, 7).value
        step_desc = sheet.cell(r, 8).value
        expected = sheet.cell(r, 9).value
        status = sheet.cell(r, 10).value

        if tc_id and str(tc_id).strip():
            if current_case:
                cases.append(current_case)
            current_case = {
                'sheet': sheet_name,
                'scenario_id': sc_id,
                'case_id': tc_id,
                'scenario': scenario,
                'type': tc_type,
                'name': tc_name,
                'precondition': precond,
                'steps': [f"{step_num}. {step_desc}" if step_num else str(step_desc)],
                'expected': expected,
                'status': status
            }
        elif current_case and step_desc:
            current_case['steps'].append(f"{step_num}. {step_desc}" if step_num else str(step_desc))

    if current_case:
        cases.append(current_case)

    return cases

def get_all_test_sheets(excel_path: str = EXCEL_PATH):
    """
    Mengambil semua nama sheet pengujian kecuali sheet Ringkasan, Perubahan, dan Akun & Role.
    """
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    return [s for s in wb.sheetnames if s not in ['Ringkasan', 'Perubahan', 'Akun & Role']]
