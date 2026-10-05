import re

# 1. DashboardFrame.tsx
df_path = r"e:\skilizee\CCWS-Website\src\components\bands\DashboardFrame.tsx"
with open(df_path, "r", encoding="utf-8") as f:
    df = f.read()

df = df.replace("csv, examSwitcher,", "examSwitcher,")
with open(df_path, "w", encoding="utf-8") as f:
    f.write(df)

# 2. page.tsx
pg_path = r"e:\skilizee\CCWS-Website\src\app\class-9-performance\page.tsx"
with open(pg_path, "r", encoding="utf-8") as f:
    pg = f.read()

pg = pg.replace("      csv={csv}\n", "")
with open(pg_path, "w", encoding="utf-8") as f:
    f.write(pg)

print("Fixed csv prop in DashboardFrame and page.tsx")
