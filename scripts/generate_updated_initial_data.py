import json
import re

# Load multi_exam_students.json
with open('scripts/multi_exam_students.json', 'r', encoding='utf-8') as f:
    multi_students = json.load(f)

print(f"Loaded {len(multi_students)} multi-exam students.")

def normalize_val(raw_val, max_marks=100, is_marks=False):
    if raw_val is None:
        return {
            'rawValue': None,
            'type': 'empty',
            'displayValue': 'Pending',
            'unit': 'marks' if is_marks else 'percent'
        }
    
    val_str = str(raw_val).strip()
    if not val_str or val_str in ['-', '--']:
        return {
            'rawValue': raw_val,
            'type': 'exempt',
            'displayValue': 'Exempt (-)',
            'unit': 'marks' if is_marks else 'percent'
        }
    
    if val_str.lower() == 'ab':
        return {
            'rawValue': 'ab',
            'type': 'invalid',
            'displayValue': 'Absent (AB)',
            'unit': 'marks' if is_marks else 'percent',
            'statusNote': 'Absent'
        }
        
    if val_str.lower() == 'new':
        return {
            'rawValue': 'new',
            'type': 'invalid',
            'displayValue': 'New Admission',
            'unit': 'marks' if is_marks else 'percent',
            'statusNote': 'New Admission'
        }
        
    # Range check e.g. "65-70", "50-53", "85-90%"
    range_match = re.search(r'(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)', val_str)
    if range_match:
        mn = float(range_match.group(1))
        mx = float(range_match.group(2))
        return {
            'rawValue': raw_val,
            'type': 'range',
            'min': mn,
            'max': mx,
            'displayValue': f"{int(mn) if mn.is_integer() else mn}–{int(mx) if mx.is_integer() else mx}%",
            'unit': 'percent'
        }
        
    # Numeric check
    clean_num = val_str.replace('%', '').strip()
    try:
        num = float(clean_num)
        # Check if decimal proportion (e.g. 0.85 -> 85%)
        if not is_marks and 0 < num <= 1.0 and '.' in clean_num:
            num = round(num * 100, 2)
            
        return {
            'rawValue': raw_val,
            'type': 'exact',
            'value': num,
            'displayValue': f"{int(num) if num.is_integer() else num}{' / 20' if is_marks and max_marks == 20 else '%'}",
            'unit': 'marks' if is_marks else 'percent'
        }
    except ValueError:
        return {
            'rawValue': raw_val,
            'type': 'invalid',
            'displayValue': val_str,
            'unit': 'marks' if is_marks else 'percent'
        }

student_records = []

for s in multi_students:
    s_no = s['sNo']
    sec = s['section']
    name = s['name']
    enr_no = s['enrollmentNumber']
    student_id = s['studentId']
    second_lang = s['secondLanguage']
    
    # ─── Exam-1 Normalized ───
    e1_sub = s['exam1']['subjects']
    e1_eng = normalize_val(e1_sub['english'])
    e1_lang = normalize_val(e1_sub[second_lang.lower()])
    e1_math = normalize_val(e1_sub['maths'])
    e1_sci = normalize_val(e1_sub['science'])
    e1_sst = normalize_val(e1_sub['socialScience'])
    e1_it = normalize_val(e1_sub['it'])
    e1_overall = normalize_val(s['exam1']['overall'])
    
    e1_subject_list = [
        {'id': 'eng', 'code': 'ENG', 'label': 'English Language & Lit', 'normalized': e1_eng},
        {'id': 'lang2', 'code': second_lang[:3].upper(), 'label': f'2nd Lang: {second_lang}', 'normalized': e1_lang},
        {'id': 'math', 'code': 'MATH', 'label': 'Mathematics', 'normalized': e1_math},
        {'id': 'sci', 'code': 'SCI', 'label': 'General Science', 'normalized': e1_sci},
        {'id': 'sst', 'code': 'S.ST', 'label': 'Social Science', 'normalized': e1_sst},
        {'id': 'it', 'code': 'IT', 'label': 'Information Technology', 'normalized': e1_it},
    ]
    
    # ─── Exam-2 Normalized (Mid Term out of 20) ───
    e2_sub = s['exam2']['subjects']
    e2_eng = normalize_val(e2_sub['english'], max_marks=20, is_marks=True)
    e2_lang = normalize_val(e2_sub[second_lang.lower()], max_marks=20, is_marks=True)
    e2_math = normalize_val(e2_sub['maths'], max_marks=20, is_marks=True)
    e2_sci = normalize_val(e2_sub['science'], max_marks=20, is_marks=True)
    e2_sst = normalize_val(e2_sub['socialScience'], max_marks=20, is_marks=True)
    e2_it = normalize_val(e2_sub['it'], max_marks=20, is_marks=True)
    e2_overall = normalize_val(s['exam2']['overall'])
    
    e2_subject_list = [
        {'id': 'eng', 'code': 'ENG', 'label': 'English Language & Lit', 'normalized': e2_eng},
        {'id': 'lang2', 'code': second_lang[:3].upper(), 'label': f'2nd Lang: {second_lang}', 'normalized': e2_lang},
        {'id': 'math', 'code': 'MATH', 'label': 'Mathematics', 'normalized': e2_math},
        {'id': 'sci', 'code': 'SCI', 'label': 'General Science', 'normalized': e2_sci},
        {'id': 'sst', 'code': 'S.ST', 'label': 'Social Science', 'normalized': e2_sst},
        {'id': 'it', 'code': 'IT', 'label': 'Information Technology', 'normalized': e2_it},
    ]

    target_overall = normalize_val(s['target']['overall'])
    if target_overall['type'] == 'empty' or target_overall['displayValue'] in ['Not Assigned', 'Pending']:
        target_status = 'NOT_ASSIGNED'
    else:
        target_status = 'IN_PROGRESS'

    rec = {
        'studentId': student_id,
        'enrollmentNumber': enr_no,
        'name': name,
        'class': 'IX',
        'group': sec,
        'school': 'CCIS',
        'secondLanguage': second_lang,
        'currentPerformance': {
            'overall': e1_overall,
            'subjects': {
                'english': e1_eng,
                'secondLanguage': e1_lang,
                'maths': e1_math,
                'science': e1_sci,
                'socialScience': e1_sst,
                'it': e1_it,
            },
            'subjectList': e1_subject_list,
        },
        'schoolTarget': {
            'overall': target_overall,
            'targetStatus': target_status,
        },
        'exams': {
            'exam-1': {
                'id': 'exam-1',
                'label': 'Exam-1 (Baseline)',
                'maxMarksPerSubject': 100,
                'overall': e1_overall,
                'secondLanguageTaken': second_lang,
                'subjects': {
                    'english': e1_eng,
                    'secondLanguage': e1_lang,
                    'maths': e1_math,
                    'science': e1_sci,
                    'socialScience': e1_sst,
                    'it': e1_it,
                },
                'subjectList': e1_subject_list,
            },
            'exam-2': {
                'id': 'exam-2',
                'label': 'Exam-2 (Mid Term)',
                'maxMarksPerSubject': 20,
                'overall': e2_overall,
                'secondLanguageTaken': second_lang,
                'subjects': {
                    'english': e2_eng,
                    'secondLanguage': e2_lang,
                    'maths': e2_math,
                    'science': e2_sci,
                    'socialScience': e2_sst,
                    'it': e2_it,
                },
                'subjectList': e2_subject_list,
            }
        },
        'examOrder': ['exam-1', 'exam-2'],
        'source': {
            'sheetName': f'IX-{sec}',
            'sourceRow': s_no + 1,
            'serialNo': s_no,
            'lastSyncedAt': '2026-09-21T10:00:00.000Z'
        },
        'updatedAt': '2026-09-21T10:00:00.000Z'
    }
    student_records.append(rec)

# Write to src/lib/initialClass9Data.ts
ts_content = f"""import {{ StudentRecord }} from './academicNormalizer';

export const INITIAL_CLASS_IX_STUDENTS: StudentRecord[] = {json.dumps(student_records, indent=2)};
"""

with open('src/lib/initialClass9Data.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

with open('scripts/full_records.json', 'w', encoding='utf-8') as f:
    json.dump(student_records, f, indent=2)

print(f"Successfully generated src/lib/initialClass9Data.ts and full_records.json with {len(student_records)} multi-exam records!")
