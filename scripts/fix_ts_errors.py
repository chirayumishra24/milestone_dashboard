"""
Fix TS errors in BandTables.tsx and page.tsx
"""

with open('e:/skilizee/CCWS-Website/src/app/class-9-performance/page.tsx', 'r', encoding='utf-8') as f:
    page_txt = f.read()

page_txt = page_txt.replace(
    '<VsClass subjectShare={ninetyShare(cls.counts)} schoolShare={classShare} />',
    '<VsClass subjectShare={ninetyShare(cls.counts)} classShare={classShare} />'
)

with open('e:/skilizee/CCWS-Website/src/app/class-9-performance/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_txt)
print('[OK] Fixed page.tsx')

with open('e:/skilizee/CCWS-Website/src/components/bands/BandTables.tsx', 'r', encoding='utf-8') as f:
    tables_txt = f.read()

tables_txt = tables_txt.replace(
    "const cmp = typeof va === 'string' ? (va as string).localeCompare(vb as string) : (va as number) - (vb as number);",
    "const cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb) : Number(va) - Number(vb);"
)

with open('e:/skilizee/CCWS-Website/src/components/bands/BandTables.tsx', 'w', encoding='utf-8') as f:
    f.write(tables_txt)
print('[OK] Fixed BandTables.tsx')
