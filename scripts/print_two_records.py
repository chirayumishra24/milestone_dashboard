import json

with open('multi_exam_students.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(json.dumps(data[0], indent=2))
print("\n" + "="*50 + "\n")
print(json.dumps(data[1], indent=2))
