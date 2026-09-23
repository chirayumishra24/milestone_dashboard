import fitz
import openpyxl
import json
import re

# 1. Load existing 97 students from students.json
with open('scripts/students.json', 'r', encoding='utf-8') as f:
    db_students = json.load(f)

print(f"Loaded {len(db_students)} base students.")

# Helper to normalize names
def norm_name(n):
    return re.sub(r'[^A-Z0-9]', '', n.upper().replace('HINDI', ''))

# 2. Extract Mid Term marks from PDF
doc = fitz.open('Mid term.xlsx.pdf')
sections = ['AURA', 'ZEN', 'NEO']

aliases = {
    'NAGEND4AYADAV': 'NAGENDRAYADAV',
    'AYAANAAGARWAL': 'AYANAAGARWAL',
    'GAVYACHOUDHARY': 'GAVYACHAUDHARY',
    'ROUNAKJEPHHINDI': 'ROUNAKJEPH',
    'ROUNAKJEPH': 'ROUNAKJEPH',
    'PANKHURI': 'PANKHURIBHARDWAJ',
    'HIMANSHU': 'HIMANSHUGURJAR',
    'AADHYAKHANDELWAL': 'AADYAKHANDELWAL',
    'AKSHOBHYA': 'AKSHOBHYATIWARI',
    'ARAVCHITRANSH': 'ARAVCHITRANSH',
    'AARAVCHITRANSH': 'ARAVCHITRANSH',
    'DIVYANNMITTAL': 'DIVYANMITTAL',
    'SURYAPRATAPSINGH': 'SURYAPRATAPSINGHNATHAWAT',
    'KRISHNAJANGIR': 'KRISHANAJANGIR',
}

mid_term_by_name = {}

for p_no, page in enumerate(doc):
    sec = sections[p_no]
    tables = page.find_tables()
    for t in tables:
        rows = t.extract()
        for r in rows[2:]:
            name_raw = r[0].strip() if r and r[0] else ''
            if not name_raw:
                continue
            key = norm_name(name_raw)
            if key in aliases:
                key = aliases[key]
            
            # r cols: Name, English, Hindi, sanskrit, french, Maths, science, social science, IT
            mid_term_by_name[key] = {
                'rawName': name_raw,
                'section': sec,
                'english': r[1] if len(r) > 1 else '',
                'hindi': r[2] if len(r) > 2 else '',
                'sanskrit': r[3] if len(r) > 3 else '',
                'french': r[4] if len(r) > 4 else '',
                'maths': r[5] if len(r) > 5 else '',
                'science': r[6] if len(r) > 6 else '',
                'socialScience': r[7] if len(r) > 7 else '',
                'it': r[8] if len(r) > 8 else '',
            }

print(f"Extracted {len(mid_term_by_name)} mid-term records from PDF.")

# 3. Build merged master student records
merged_students = []

for s in db_students:
    s_no = int(s['sNo'])
    sec = s['group']
    name = s['name']
    enr_no = f"CCIS-IX-{sec}-{s_no:02d}"
    student_id = f"ccis-ix-{sec.lower()}-{s['name'].lower().replace(' ', '-')}"
    
    n_key = norm_name(name)
    if n_key in aliases:
        n_key = aliases[n_key]
        
    mt = mid_term_by_name.get(n_key)
    if not mt:
        for k, v in mid_term_by_name.items():
            if n_key.startswith(k) or k.startswith(n_key):
                mt = v
                break
                
    # Detect 2nd language taken from mid-term
    # Check which of hindi, sanskrit, french is non-empty and not '-'
    chosen_lang = "Hindi" # fallback
    if mt:
        h_val = (mt['hindi'] or '').strip()
        s_val = (mt['sanskrit'] or '').strip()
        f_val = (mt['french'] or '').strip()
        
        if f_val and f_val not in ['-', '--']:
            chosen_lang = "French"
        elif s_val and s_val not in ['-', '--']:
            chosen_lang = "Sanskrit"
        elif h_val and h_val not in ['-', '--']:
            chosen_lang = "Hindi"
    
    # ─── Exam-1 (Baseline) ───
    e1_raw_hsf = s['hsf']
    e1_subjs = {
        'english': s['english'],
        'hindi': e1_raw_hsf if chosen_lang == 'Hindi' else None,
        'sanskrit': e1_raw_hsf if chosen_lang == 'Sanskrit' else None,
        'french': e1_raw_hsf if chosen_lang == 'French' else None,
        'maths': s['maths'],
        'science': s['science'],
        'socialScience': s['sSt'],
        'it': s['it'],
    }
    
    # Overall % for Exam-1: 6 subjects
    # If student had overall in s['overall'], use normalized, else compute
    e1_overall = s['overall']
    if e1_overall is not None:
        try:
            val_f = float(e1_overall)
            if val_f <= 1.0 and val_f > 0:
                e1_overall_display = f"{round(val_f * 100, 2)}%"
            else:
                e1_overall_display = f"{round(val_f, 2)}%"
        except:
            e1_overall_display = str(e1_overall)
    else:
        e1_overall_display = "Pending"

    # ─── Exam-2 (Mid Term out of 20) ───
    if mt:
        e2_subjs = {
            'english': mt['english'],
            'hindi': mt['hindi'] if chosen_lang == 'Hindi' else None,
            'sanskrit': mt['sanskrit'] if chosen_lang == 'Sanskrit' else None,
            'french': mt['french'] if chosen_lang == 'French' else None,
            'maths': mt['maths'],
            'science': mt['science'],
            'socialScience': mt['socialScience'],
            'it': mt['it'],
        }
        # Calculate 6-subject overall for Exam-2
        # Sum of 6 taken subjects: english, chosen_lang, maths, science, socialScience, it
        active_marks = []
        for s_code in ['english', chosen_lang.lower(), 'maths', 'science', 'socialScience', 'it']:
            val_str = (mt.get(s_code) or '').strip()
            try:
                m = float(val_str)
                active_marks.append(m)
            except:
                pass
                
        if active_marks:
            e2_sum = sum(active_marks)
            e2_max = len(active_marks) * 20.0
            e2_pct = round((e2_sum / e2_max) * 100, 2)
            e2_overall_display = f"{e2_pct}%"
            e2_total_marks = f"{e2_sum} / {int(e2_max)}"
        else:
            e2_overall_display = "Pending"
            e2_total_marks = None
    else:
        e2_subjs = {
            'english': None, 'hindi': None, 'sanskrit': None, 'french': None,
            'maths': None, 'science': None, 'socialScience': None, 'it': None
        }
        e2_overall_display = "Pending"
        e2_total_marks = None

    merged_record = {
        'sNo': s_no,
        'enrollmentNumber': enr_no,
        'name': name,
        'section': sec,
        'studentId': student_id,
        'secondLanguage': chosen_lang,
        'exam1': {
            'label': 'Exam-1 (Baseline)',
            'subjects': e1_subjs,
            'overall': e1_overall_display,
            'maxMarks': 100,
        },
        'exam2': {
            'label': 'Exam-2 (Mid Term)',
            'subjects': e2_subjs,
            'overall': e2_overall_display,
            'totalMarks': e2_total_marks,
            'maxMarks': 20,
        },
        'target': {
            'label': 'School Target',
            'overall': s['target'] or 'Not Assigned',
        }
    }
    merged_students.append(merged_record)

print(f"Successfully merged {len(merged_students)} students.")

# Save master JSON
with open('scripts/multi_exam_students.json', 'w', encoding='utf-8') as f:
    json.dump(merged_students, f, indent=2)

print("Saved scripts/multi_exam_students.json")

# 4. Generate Master Excel matching the 57-column Google Sheet layout
wb_out = openpyxl.Workbook()
ws = wb_out.active
ws.title = "Sheet1"

# Row 1 headers
r1 = [None] * 57
r1[0] = "Sr. No."
r1[1] = "Enrollment Number"
r1[2] = "Name"
r1[3] = "Exam-1"
r1[12] = "Exam-2"
r1[21] = "Exam-3"
r1[30] = "Exam-4"
r1[39] = "Exam-5"
r1[48] = "Target"
ws.append(r1)

# Row 2 subheaders
sub_h = ["English", "Hindi", "sanskrit", "french", "Maths", "science", "social science", "IT", "Overall %"]
r2 = [None, None, None]
for i in range(5):
    r2.extend(sub_h)
# Target has Overall at the end
r2.extend(["English", "Hindi", "sanskrit", "french", "Maths", "science", "social science", "IT", "Overall"])
ws.append(r2)

# Populate student rows
for s in merged_students:
    row = [s['sNo'], s['enrollmentNumber'], s['name']]
    
    # Exam-1 (cols 4-12)
    e1 = s['exam1']['subjects']
    row.extend([
        e1['english'], e1['hindi'], e1['sanskrit'], e1['french'],
        e1['maths'], e1['science'], e1['socialScience'], e1['it'],
        s['exam1']['overall']
    ])
    
    # Exam-2 (cols 13-21)
    e2 = s['exam2']['subjects']
    row.extend([
        e2['english'], e2['hindi'], e2['sanskrit'], e2['french'],
        e2['maths'], e2['science'], e2['socialScience'], e2['it'],
        s['exam2']['overall']
    ])
    
    # Exam-3 (cols 22-30) - empty
    row.extend([None]*9)
    # Exam-4 (cols 31-39) - empty
    row.extend([None]*9)
    # Exam-5 (cols 40-48) - empty
    row.extend([None]*9)
    
    # Target (cols 49-57)
    row.extend([None, None, None, None, None, None, None, None, s['target']['overall']])
    
    ws.append(row)

wb_out.save('MASTER_CLASS_IX_MULTI_EXAM.xlsx')
print("Successfully generated MASTER_CLASS_IX_MULTI_EXAM.xlsx with all 97 students.")
