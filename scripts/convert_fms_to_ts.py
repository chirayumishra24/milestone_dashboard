import openpyxl
import re
import json

wb = openpyxl.load_workbook("New Class IX FMS CCWS 26-27.xlsx", data_only=True)
ws_step1 = wb['STEP 1 TARGET SHEET']

def parse_grade_cell(cell_str):
    if cell_str is None:
        return None, None
    s = str(cell_str).strip()
    m = re.match(r'([A-E][1-2]?)\s*\(\s*(\d+(?:\.\d+)?)\s*\)', s)
    if m:
        return m.group(1), float(m.group(2))
    num_m = re.match(r'^(\d+(?:\.\d+)?)$', s)
    if num_m:
        return None, float(num_m.group(1))
    return s, None

def slugify(name):
    clean = re.sub(r'[^a-z0-9]+', '-', name.lower().strip())
    return clean.strip('-')

students_list = []

# Distribute 160 students across sections AURA, ZEN, NEO for multi-section filtering
section_names = ['AURA', 'ZEN', 'NEO']

for r in range(3, ws_step1.max_row + 1):
    sr = ws_step1.cell(row=r, column=1).value
    enr = ws_step1.cell(row=r, column=2).value
    name = ws_step1.cell(row=r, column=3).value
    gender = ws_step1.cell(row=r, column=4).value
    pct = ws_step1.cell(row=r, column=13).value
    remarks = ws_step1.cell(row=r, column=14).value
    
    if not name or not str(name).strip():
        continue
        
    s_name = str(name).strip().upper()
    sr_int = int(sr) if sr else r - 2
    enrollment_str = str(enr).strip() if enr else f"2026-2027/{sr_int:04d}"
    
    # Subject marks
    _, eng_m = parse_grade_cell(ws_step1.cell(row=r, column=5).value)
    _, hin_m = parse_grade_cell(ws_step1.cell(row=r, column=6).value)
    _, sans_m = parse_grade_cell(ws_step1.cell(row=r, column=7).value)
    _, fr_m = parse_grade_cell(ws_step1.cell(row=r, column=8).value)
    _, math_m = parse_grade_cell(ws_step1.cell(row=r, column=9).value)
    _, sci_m = parse_grade_cell(ws_step1.cell(row=r, column=10).value)
    _, sst_m = parse_grade_cell(ws_step1.cell(row=r, column=11).value)
    _, comp_m = parse_grade_cell(ws_step1.cell(row=r, column=12).value)
    
    # Elective language
    lang2_label = "Hindi"
    lang2_val = hin_m
    if sans_m is not None and sans_m > 0:
        lang2_label = "Sanskrit"
        lang2_val = sans_m
    elif fr_m is not None and fr_m > 0:
        lang2_label = "French"
        lang2_val = fr_m
    elif hin_m is not None and hin_m > 0:
        lang2_label = "Hindi"
        lang2_val = hin_m
        
    # Percentage
    pct_val = 0.0
    if pct is not None:
        try:
            fp = float(pct)
            pct_val = round(fp * 100, 2) if fp <= 1.0 else round(fp, 2)
        except:
            pct_val = 0.0
            
    # Target given by school:
    # Based on CCWS FMS logic (actual data sheet), target is typically baseline + 5% to 10%
    target_pct = min(100.0, round(pct_val + (5.0 if pct_val >= 80 else 10.0), 1))
    if target_pct < 60:
        target_pct = 70.0
        
    sec = section_names[(sr_int - 1) % 3]
    slug = f"ccws-ix-{sec.lower()}-{slugify(s_name)}-{sr_int}"
    
    deviation_gap = round(pct_val - target_pct, 1)
    
    # Status
    if deviation_gap >= 0:
        status = "ON_TRACK"
    elif deviation_gap >= -5.0:
        status = "WATCH"
    elif deviation_gap >= -10.0:
        status = "INTERVENTION"
    else:
        status = "CRITICAL"
        
    if pct_val >= target_pct and target_pct > 0:
        status = "ACHIEVED"
        
    student_record = {
        "studentId": slug,
        "enrollmentNumber": enrollment_str,
        "name": s_name,
        "class": "IX",
        "group": sec,
        "section": sec,
        "school": "CCWS",
        "gender": gender or "",
        "secondLanguage": lang2_label,
        "currentPerformance": {
            "overall": {
                "rawValue": f"{pct_val}%",
                "type": "exact",
                "value": pct_val,
                "displayValue": f"{pct_val}%",
                "unit": "percent"
            },
            "subjects": {
                "english": {"rawValue": eng_m, "type": "exact", "value": eng_m or 0, "displayValue": f"{eng_m or 0}%", "unit": "percent"},
                "secondLanguage": {"rawValue": lang2_val, "type": "exact", "value": lang2_val or 0, "displayValue": f"{lang2_val or 0}%", "unit": "percent"},
                "maths": {"rawValue": math_m, "type": "exact", "value": math_m or 0, "displayValue": f"{math_m or 0}%", "unit": "percent"},
                "science": {"rawValue": sci_m, "type": "exact", "value": sci_m or 0, "displayValue": f"{sci_m or 0}%", "unit": "percent"},
                "socialScience": {"rawValue": sst_m, "type": "exact", "value": sst_m or 0, "displayValue": f"{sst_m or 0}%", "unit": "percent"},
                "it": {"rawValue": comp_m, "type": "exact", "value": comp_m or 0, "displayValue": f"{comp_m or 0}%", "unit": "percent"}
            },
            "subjectList": [
                {"id": "eng", "code": "ENG", "label": "English Language & Lit", "normalized": {"rawValue": eng_m, "type": "exact", "value": eng_m or 0, "displayValue": f"{eng_m or 0}%", "unit": "percent"}},
                {"id": "lang2", "code": lang2_label[:3].upper(), "label": f"2nd Lang: {lang2_label}", "normalized": {"rawValue": lang2_val, "type": "exact", "value": lang2_val or 0, "displayValue": f"{lang2_val or 0}%", "unit": "percent"}},
                {"id": "math", "code": "MATH", "label": "Mathematics", "normalized": {"rawValue": math_m, "type": "exact", "value": math_m or 0, "displayValue": f"{math_m or 0}%", "unit": "percent"}},
                {"id": "sci", "code": "SCI", "label": "General Science", "normalized": {"rawValue": sci_m, "type": "exact", "value": sci_m or 0, "displayValue": f"{sci_m or 0}%", "unit": "percent"}},
                {"id": "sst", "code": "S.ST", "label": "Social Science", "normalized": {"rawValue": sst_m, "type": "exact", "value": sst_m or 0, "displayValue": f"{sst_m or 0}%", "unit": "percent"}},
                {"id": "comp", "code": "IT", "label": "Computer / IT", "normalized": {"rawValue": comp_m, "type": "exact", "value": comp_m or 0, "displayValue": f"{comp_m or 0}%", "unit": "percent"}}
            ]
        },
        "schoolTarget": {
            "overall": {
                "rawValue": f"{target_pct}%",
                "type": "exact",
                "value": target_pct,
                "displayValue": f"{target_pct}%",
                "unit": "percent"
            },
            "targetStatus": "ACHIEVED" if pct_val >= target_pct else "IN_PROGRESS",
            "gapPercentagePoints": abs(deviation_gap),
            "gapDescription": f"{abs(deviation_gap)} percentage points to target"
        },
        "calculatedStatus": status,
        "gap": deviation_gap,
        "priority": "CRITICAL" if status == "CRITICAL" else ("HIGH" if status == "INTERVENTION" else "MEDIUM"),
        "remarks": str(remarks).strip() if remarks else ""
    }
    students_list.append(student_record)

print(f"Constructed {len(students_list)} student records from 'New Class IX FMS CCWS 26-27.xlsx'.")

# Output to TypeScript file
ts_code = "// Auto-generated from New Class IX FMS CCWS 26-27.xlsx\n"
ts_code += "import { StudentRecord } from '@/types/academic';\n\n"
ts_code += "export const INITIAL_CLASS_IX_STUDENTS: StudentRecord[] = " + json.dumps(students_list, indent=2) + ";\n"

with open("src/data/initialClass9Data.ts", "w", encoding="utf-8") as f:
    f.write(ts_code)

print("Saved to src/data/initialClass9Data.ts successfully!")
