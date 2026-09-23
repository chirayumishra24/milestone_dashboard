import fitz
import json
import re

# Load existing 97 students
with open('scripts/students.json', 'r', encoding='utf-8') as f:
    db_students = json.load(f)

def normalize_name(name):
    # Strip non-alphanumeric, uppercase
    clean = re.sub(r'[^A-Z0-9]', '', name.upper().replace('HINDI', ''))
    return clean

db_lookup = {}
for s in db_students:
    norm = normalize_name(s['name'])
    db_lookup[norm] = s

# Specific known alias fixes
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
}

doc = fitz.open('Mid term.xlsx.pdf')
sections = ['IX-AURA', 'IX-ZEN', 'IX-NEO']

stats = {
    'total_rows': 0,
    'matched_to_db': 0,
    'new_students': [],
    'absent_records': 0,
    'subject_stats': {
        'English': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'Hindi': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'Sanskrit': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'French': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'Maths': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'Science': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'Social Science': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
        'IT': {'count': 0, 'max': 0, 'min': 999, 'total': 0},
    }
}

parsed_students = []

for page_idx, page in enumerate(doc):
    sec = sections[page_idx]
    tables = page.find_tables()
    for t in tables:
        rows = t.extract()
        # Row 0: Title, Row 1: Header, Row 2+: Data
        for r in rows[2:]:
            name_raw = r[0].strip() if r and r[0] else ''
            if not name_raw:
                continue

            stats['total_rows'] += 1
            norm = normalize_name(name_raw)
            if norm in aliases:
                norm = aliases[norm]

            matched_db = db_lookup.get(norm)
            if not matched_db:
                # Fuzzy prefix match
                for k, v in db_lookup.items():
                    if norm.startswith(k) or k.startswith(norm):
                        matched_db = v
                        break

            if matched_db:
                stats['matched_to_db'] += 1
            else:
                stats['new_students'].append((sec, name_raw))

            # Parse subject marks
            # Cols: Name, English, Hindi, sanskrit, french, Maths, science, social science, IT
            subj_map = {
                'English': r[1] if len(r) > 1 else '',
                'Hindi': r[2] if len(r) > 2 else '',
                'Sanskrit': r[3] if len(r) > 3 else '',
                'French': r[4] if len(r) > 4 else '',
                'Maths': r[5] if len(r) > 5 else '',
                'Science': r[6] if len(r) > 6 else '',
                'Social Science': r[7] if len(r) > 7 else '',
                'IT': r[8] if len(r) > 8 else ''
            }

            parsed_subjs = {}
            for subj_name, val_raw in subj_map.items():
                v = (val_raw or '').strip().lower()
                parsed = {
                    'raw': val_raw,
                    'status': 'normal',
                    'marks': None,
                    'maxMarks': 20
                }
                if not v or v in ['-', '--']:
                    parsed['status'] = 'exempt'
                elif v == 'ab':
                    parsed['status'] = 'absent'
                    stats['absent_records'] += 1
                elif v == 'new':
                    parsed['status'] = 'new_student'
                else:
                    try:
                        m = float(v)
                        parsed['marks'] = m
                        s_stat = stats['subject_stats'][subj_name]
                        s_stat['count'] += 1
                        s_stat['total'] += m
                        if m > s_stat['max']: s_stat['max'] = m
                        if m < s_stat['min']: s_stat['min'] = m
                    except ValueError:
                        parsed['status'] = 'unparsed'

                parsed_subjs[subj_name] = parsed

            parsed_students.append({
                'name': name_raw,
                'section': sec,
                'dbMatch': f"CCIS-IX-{matched_db['group']}-{int(matched_db['sNo']):02d}" if matched_db else None,
                'dbStudentId': f"ccis-ix-{matched_db['group'].lower()}-{matched_db['name'].lower().replace(' ', '-')}" if matched_db else None,
                'subjects': parsed_subjs
            })

print(f"Total Rows in PDF: {stats['total_rows']}")
print(f"Matched to Existing DB: {stats['matched_to_db']}")
print(f"New / Unmatched Students ({len(stats['new_students'])}): {stats['new_students']}")
print("\n--- Subject Marks Out of 20 ---")
for subj, s in stats['subject_stats'].items():
    avg = round(s['total'] / s['count'], 2) if s['count'] > 0 else 0
    print(f"{subj:15s}: Tested={s['count']:2d} students | Max={s['max']:4.1f}/20 | Min={s['min']:4.1f}/20 | Avg={avg:4.1f}/20 ({round(avg/20*100, 1)}%)")

# Sample student print
print("\n--- Sample Student Record (AARADHYA GOYAL) ---")
for p in parsed_students:
    if 'AARADHYA GOYAL' in p['name']:
        print(json.dumps(p, indent=2))
        break
