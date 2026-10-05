import os
import re

# 1. Update tailwind.config.ts
tw_path = r"e:\skilizee\CCWS-Website\tailwind.config.ts"
with open(tw_path, "r", encoding="utf-8") as f:
    tw = f.read()

tw = re.sub(r'canvas:\s*\{\s*soft:\s*".*?"\s*\}', 'canvas: { soft: "#FAF6F0" }', tw)
tw = re.sub(r'hairline:\s*".*?"', 'hairline: "#E8DDD0"', tw)
with open(tw_path, "w", encoding="utf-8") as f:
    f.write(tw)
print("Updated tailwind.config.ts")

# 2. Update DashboardFrame.tsx
df_path = r"e:\skilizee\CCWS-Website\src\components\bands\DashboardFrame.tsx"
with open(df_path, "r", encoding="utf-8") as f:
    df_code = f.read()

# Update PAGE_BG
df_code = re.sub(
    r"const PAGE_BG = \{ light: .*?, dark: .*? \};",
    'const PAGE_BG = { light: "#FAF6F0", dark: "#14100E" };',
    df_code
)

# Update GradientWash to authentic CCWS Beige (#F1E8D8) & Maroon (#960330)
new_wash = """function GradientWash() {
  return (
    <div
      aria-hidden="true"
      className="print-hide pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(50%_65%_at_15%_10%,#F1E8D8_0%,transparent_70%),radial-gradient(45%_55%_at_85%_12%,rgba(150,3,48,0.07)_0%,transparent_70%),radial-gradient(35%_45%_at_50%_0%,#F5EDE0_0%,transparent_70%),radial-gradient(30%_40%_at_90%_45%,rgba(181,84,42,0.05)_0%,transparent_70%)] dark:hidden" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(40%_60%_at_12%_15%,rgba(150,3,48,0.22)_0%,transparent_70%),radial-gradient(38%_60%_at_80%_10%,rgba(181,84,42,0.16)_0%,transparent_70%),radial-gradient(30%_45%_at_50%_40%,rgba(75,20,29,0.25)_0%,transparent_70%)] dark:block" />
    </div>
  );
}"""
df_code = re.sub(r"function GradientWash\(\) \{[\s\S]*?\n\}", new_wash, df_code)

# Replace the top right actions (CSV, Print, Theme toggle, Present) to only keep examSwitcher and updatedLabel
pattern_actions = r'<div className="print-hide flex flex-shrink-0 items-center gap-1\.5 sm:gap-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>'
replacement_actions = """<div className="print-hide flex flex-shrink-0 items-center gap-2 sm:gap-3">
              {examSwitcher}
              <span className="hidden text-xs text-ink-mute sm:inline dark:text-stone-400">Updated {updatedLabel}</span>
            </div>
          </div>
        </div>"""

df_code = re.sub(pattern_actions, replacement_actions, df_code)

# Change header icon to maroon
df_code = df_code.replace(
    'bg-ink text-white dark:bg-white/10 dark:text-blue-100',
    'bg-maroon text-white dark:bg-maroon/80'
)

# Header background border
df_code = df_code.replace(
    'sticky top-0 z-20 bg-canvas-soft/60 backdrop-blur-xl dark:bg-night/60',
    'sticky top-0 z-20 bg-[#FAF6F0]/80 backdrop-blur-xl border-b border-hairline dark:bg-night/80 dark:border-white/10'
)

with open(df_path, "w", encoding="utf-8") as f:
    f.write(df_code)
print("Updated DashboardFrame.tsx with buttons removed and CCWS beige/maroon wash")
