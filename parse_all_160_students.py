import openpyxl
import re

wb = openpyxl.load_workbook("New Class IX FMS CCWS 26-27.xlsx", data_only=True)
ws = wb['STEP 1 TARGET SHEET']

headers = [ws.cell(row=2, column=c).value for c in range(1, 15)]

def parse_grade_cell(cell_str):
    if cell_str is None:
        return None, None
    s = str(cell_str).strip()
    # Matches "A1 (98 )" or "E2 (0 )" or "98"
    m = re.match(r'([A-E][1-2]?)\s*\(\s*(\d+(?:\.\d+)?)\s*\)', s)
    if m:
        return m.group(1), float(m.group(2))
    num_m = re.match(r'^(\d+(?:\.\d+)?)$', s)
    if num_m:
        return None, float(num_m.group(1))
    return s, None

print("Parsing first 10 students:")
parsed_students = []
for r in range(3, ws.max_row + 1):
    sr = ws.cell(row=r, column=1).value
    enr = ws.cell(row=r, column=2).value
    name = ws.cell(row=r, column=3).value
    gender = ws.cell(row=r, column=4).value
    pct = ws.cell(row=r, column=13).value
    remarks = ws.cell(row=r, column=14).value
    
    if name and str(name).strip():
        # subjects
        eng_grade, eng_marks = parse_grade_cell(ws.cell(row=r, column=5).value)
        hin_grade, hin_marks = parse_grade_cell(ws.cell(row=r, column=6).value)
        sans_grade, sans_marks = parse_grade_cell(ws.cell(row=r, column=7).value)
        fr_grade, fr_marks = parse_grade_cell(ws.cell(row=r, column=8).value)
        math_grade, math_marks = parse_grade_cell(ws.cell(row=r, column=9).value)
        sci_grade, sci_marks = parse_grade_cell(ws.cell(row=r, column=10).value)
        sst_grade, sst_marks = parse_grade_cell(ws.cell(row=r, column=11).value)
        comp_grade, comp_marks = parse_grade_cell(ws.cell(row=r, column=12).value)
        
        # Second language detection (Hindi vs Sanskrit vs French)
        lang2_name = "Hindi"
        lang2_marks = hin_marks
        if sans_marks is not None and sans_marks > 0:
            lang2_name = "Sanskrit"
            lang2_marks = sans_marks
        elif fr_marks is not None and fr_marks > 0:
            lang2_name = "French"
            lang2_marks = fr_marks
            
        student_obj = {
            "sr": int(sr) if sr else r - 2,
            "enrollmentNo": str(enr).strip() if enr else f"CCWS-IX-{r-2:03d}",
            "name": str(name).strip().upper(),
            "gender": str(gender).strip() if gender else "",
            "english": eng_marks,
            "hindi": hin_marks,
            "sanskrit": sans_marks,
            "french": fr_marks,
            "secondLanguageName": lang2_name,
            "secondLanguageMarks": lang2_marks,
            "maths": math_marks,
            "science": sci_marks,
            "socialScience": sst_marks,
            "computer": comp_marks,
            "pctMarks": round(float(pct) * 100, 2) if (pct is not None and float(pct) <= 1.0) else (float(pct) if pct else 0),
            "remarks": str(remarks).strip() if remarks else ""
        }
        parsed_students.append(student_obj)
        if len(parsed_students) <= 5:
            print(student_obj)

print(f"\nTotal students parsed: {len(parsed_students)}")

# Check percentage distribution of the 160 students
bands = {
    '95%+': 0,
    '90-94%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '60-69%': 0,
    '<60%': 0
}
for s in parsed_students:
    p = s['pctMarks']
    if p >= 95: bands['95%+'] += 1
    elif p >= 90: bands['90-94%'] += 1
    elif p >= 80: bands['80-89%'] += 1
    elif p >= 70: bands['70-79%'] += 1
    elif p >= 60: bands['60-69%'] += 1
    else: bands['<60%'] += 1

print("\nActual Band Distribution from sheet:")
for b, c in bands.items():
    print(f"  {b}: {c}")
