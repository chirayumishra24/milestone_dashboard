import json
import re

with open('initialClass9Data.ts', 'r', encoding='utf-8') as f:
    raw_content = f.read()

# Replace import from './academicNormalizer' with '@/types/academic'
updated_content = raw_content.replace("from './academicNormalizer';", "from '@/types/academic';\nimport { calculateStudentStatus } from '@/utils/statusEngine';")

with open('src/data/initialClass9Data.ts', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Written src/data/initialClass9Data.ts successfully. Length:", len(updated_content))
