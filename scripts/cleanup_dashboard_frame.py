import re

path = r"e:\skilizee\CCWS-Website\src\components\bands\DashboardFrame.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

code = re.sub(
    r"import \{ Download, GraduationCap, Maximize2, Minimize2, Moon, Printer, Sun, Sparkles \} from 'lucide-react';",
    "import { GraduationCap } from 'lucide-react';",
    code
)
code = re.sub(r"import \{ AnimatePresence, motion \} from 'motion/react';\n", "", code)
code = re.sub(r"import \{ downloadCsv, type CsvCell \} from '@/utils/csv';\n", "", code)
code = re.sub(r"import \{ tagClass \} from './styles';\n", "", code)
code = re.sub(r"csv\?: \{ filename: string; headers: string\[\]; rows: CsvCell\[\]\[\] \};\n", "", code)

# Clean up unused pillButton, pillGhost, pillSolid if unused
code = re.sub(r"const pillButton =[\s\S]*?const pillSolid = .*?;\n", "", code)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)
print("DashboardFrame.tsx imports and types cleaned up successfully")
