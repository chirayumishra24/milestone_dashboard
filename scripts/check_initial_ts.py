with open('initialClass9Data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

print("initialClass9Data.ts size:", len(text))
print("Contains 'exam-1':", 'exam-1' in text)
print("Contains 'exam-2':", 'exam-2' in text)
print("Contains 'schoolTarget':", 'schoolTarget' in text)

import re
matches = re.findall(r'"studentId":\s*"([^"]+)"', text)
print(f"Total student records in initialClass9Data.ts: {len(matches)}")
