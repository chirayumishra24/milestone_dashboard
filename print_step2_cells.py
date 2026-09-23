import openpyxl

wb = openpyxl.load_workbook("New Class IX FMS CCWS 26-27.xlsx", data_only=True)
ws_step2 = wb['STEP 2']

print("STEP 2 ALL NON-EMPTY CELLS (Rows 1 to 30):")
for r in range(1, 30):
    row_vals = [ws_step2.cell(row=r, column=c).value for c in range(1, 20)]
    # filter out None
    items = [(c, row_vals[c-1]) for c in range(1, 20) if row_vals[c-1] is not None]
    if items:
        line = " | ".join([f"C{c}:{v}" for c, v in items])
        print(f"R{r:2d}: {line}")
