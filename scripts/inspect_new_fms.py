import openpyxl

file_path = "New Class IX FMS CCWS 26-27.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=True)

print("Sheet names:", wb.sheetnames)

for name in wb.sheetnames:
    ws = wb[name]
    print(f"\n{'='*20} Sheet: {name} (Max row: {ws.max_row}, Max col: {ws.max_column}) {'='*20}")
    # Print first 15 rows, first 25 columns
    for r in range(1, min(16, ws.max_row + 1)):
        row_vals = [ws.cell(row=r, column=c).value for c in range(1, min(25, ws.max_column + 1))]
        if any(v is not None and str(v).strip() != '' for v in row_vals):
            print(f"Row {r:2d}: {row_vals[:12]}")
