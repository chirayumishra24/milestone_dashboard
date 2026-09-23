import json

with open('multi_exam_students.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total students in multi_exam_students.json: {len(data)}")
s1 = data[0]
print("\nFirst student keys:")
print(list(s1.keys()))
print("\nFirst student details:")
print("Name:", s1.get('name'))
print("Enrollment:", s1.get('enrollmentNumber'))
print("Class/Group:", s1.get('class'), s1.get('group'))
print("Second Language:", s1.get('secondLanguage'))
print("Current Performance:", json.dumps(s1.get('currentPerformance'), indent=2)[:500])
print("School Target:", json.dumps(s1.get('schoolTarget'), indent=2))
print("Exams available:", list(s1.get('exams', {}).keys()))
for ek, ev in s1.get('exams', {}).items():
    print(f"  {ek}: label='{ev.get('label')}', overall={ev.get('overall')}, subjects count={len(ev.get('subjects', {}))}")
