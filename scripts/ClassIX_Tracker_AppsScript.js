/**
 * ==============================================================================
 * CCIS CLASS IX STUDENT PERFORMANCE & TARGET TRACKER - GOOGLE APPS SCRIPT
 * ==============================================================================
 * 
 * INSTRUCTIONS:
 * 1. In your Google Sheet, click "Extensions" -> "Apps Script".
 * 2. Replace any existing code in Code.gs with this entire script.
 * 3. Update the SYNC_ENDPOINT_URL below to your school website domain:
 *    - Production: "https://ccis.skilizee.com/api/sync-students" (or your live domain / cloud function)
 *    - Or set it in Script Properties: File -> Project Properties -> Script Properties:
 *      Key: "SYNC_ENDPOINT", Value: "https://your-domain/api/sync-students"
 *      Key: "SYNC_SECRET", Value: "ccis-alumni-sync-2026"
 * 4. Click "Save" (Ctrl+S).
 * 5. Refresh your Google Sheet. You will see a new menu: "🎓 CCIS Portal Sync".
 * 6. To enable automatic live sync on edit:
 *    - Click "Triggers" (alarm clock icon on left sidebar).
 *    - Click "+ Add Trigger".
 *    - Choose function: "handleInstallableEdit".
 *    - Event source: "From spreadsheet".
 *    - Event type: "On edit".
 *    - Click Save.
 * ==============================================================================
 */

// Default Configuration (Can also be overridden via ScriptProperties)
const CONFIG = {
  // Update this to your Firebase Cloud Function live endpoint
  DEFAULT_ENDPOINT: "https://us-central1-skillizee-products.cloudfunctions.net/syncClass9Performance",
  DEFAULT_SECRET: "ccis-alumni-sync-2026",
  TARGET_TABS: ["IX-AURA", "IX-ZEN", "IX-NEO"],
};

/**
 * Creates custom menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🎓 CCIS Portal Sync")
    .addItem("⚡ Sync All Sections (AURA, ZEN, NEO)", "syncAllSections")
    .addItem("📄 Sync Current Section Only", "syncCurrentSection")
    .addSeparator()
    .addItem("⚙️ Check Connection & Setup", "checkConnection")
    .addToUi();
}

/**
 * Get endpoint and secret from Script Properties or defaults
 */
function getSettings() {
  const props = PropertiesService.getScriptProperties();
  const endpoint = props.getProperty("SYNC_ENDPOINT") || CONFIG.DEFAULT_ENDPOINT;
  const secret = props.getProperty("SYNC_SECRET") || CONFIG.DEFAULT_SECRET;
  return { endpoint, secret };
}

/**
 * Helper to locate column indices by header names in Row 1
 */
function getColumnMapping(headerRow) {
  const mapping = {};
  for (let c = 0; c < headerRow.length; c++) {
    const val = String(headerRow[c] || "").trim().toUpperCase();
    if (val.includes("S") && val.includes("NO")) mapping.sNo = c;
    else if (val.includes("STUDENT") && val.includes("NAME")) mapping.name = c;
    else if (val === "ENGLISH" || val.includes("ENG")) mapping.english = c;
    else if (val === "MATHS" || val.includes("MATH")) mapping.maths = c;
    else if (val.includes("S") && val.includes("ST")) mapping.sSt = c;
    else if (val.includes("H/S/F") || val.includes("HINDI") || val.includes("FRENCH")) mapping.hsf = c;
    else if (val === "SCIENCE" || val.includes("SCI")) mapping.science = c;
    else if (val === "IT" || val.includes("INFORMATION")) mapping.it = c;
    else if (val.includes("OVERALL")) mapping.overall = c;
    else if (val.includes("TARGET")) mapping.target = c;
  }
  return mapping;
}

/**
 * Formats a single row object from a sheet
 */
function parseRow(sheetName, rowVals, mapping, rowIndex) {
  const name = String(rowVals[mapping.name] || "").trim();
  if (!name) return null;

  const group = sheetName.replace(/^IX-?/, "").toUpperCase();

  return {
    sNo: mapping.sNo !== undefined ? rowVals[mapping.sNo] : rowIndex - 1,
    name: name,
    group: group,
    english: mapping.english !== undefined ? rowVals[mapping.english] : null,
    maths: mapping.maths !== undefined ? rowVals[mapping.maths] : null,
    sSt: mapping.sSt !== undefined ? rowVals[mapping.sSt] : null,
    hsf: mapping.hsf !== undefined ? rowVals[mapping.hsf] : null,
    science: mapping.science !== undefined ? rowVals[mapping.science] : null,
    it: mapping.it !== undefined ? rowVals[mapping.it] : null,
    overall: mapping.overall !== undefined ? rowVals[mapping.overall] : null,
    target: mapping.target !== undefined ? rowVals[mapping.target] : null,
    sourceRow: rowIndex,
    sheetName: sheetName,
  };
}

/**
 * Synchronizes all Class IX tabs (IX-AURA, IX-ZEN, IX-NEO)
 */
function syncAllSections() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const { endpoint, secret } = getSettings();

  const allRows = [];
  const errors = [];

  CONFIG.TARGET_TABS.forEach(function (tabName) {
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      errors.push("Tab not found: " + tabName);
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    const mapping = getColumnMapping(data[0]);
    if (mapping.name === undefined) {
      errors.push("Column 'STUDENT NAME' missing in " + tabName);
      return;
    }

    for (let r = 1; r < data.length; r++) {
      const parsed = parseRow(tabName, data[r], mapping, r + 1);
      if (parsed) allRows.push(parsed);
    }
  });

  if (allRows.length === 0) {
    ui.alert("⚠️ No student records found to synchronize.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // Send payload to website sync endpoint
  try {
    const response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-sync-secret": secret,
      },
      payload: JSON.stringify({
        students: allRows,
        syncSource: "Google Apps Script Manual Sync",
        timestamp: new Date().toISOString(),
      }),
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    const result = JSON.parse(response.getContentText() || "{}");

    if (code === 200 && result.success) {
      ui.alert(
        "✅ Sync Complete!",
        "Successfully updated " + allRows.length + " students across Class IX (AURA, ZEN, NEO) in the CCIS portal.",
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      ui.alert(
        "❌ Sync Error (" + code + ")",
        result.error || result.details || response.getContentText(),
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (err) {
    ui.alert("❌ Network / Fetch Error", err.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Synchronizes only the active sheet
 */
function syncCurrentSection() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  const { endpoint, secret } = getSettings();

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    ui.alert("Sheet contains no student data rows.");
    return;
  }

  const mapping = getColumnMapping(data[0]);
  if (mapping.name === undefined) {
    ui.alert("Could not locate 'STUDENT NAME' header in row 1.");
    return;
  }

  const rows = [];
  for (let r = 1; r < data.length; r++) {
    const parsed = parseRow(sheetName, data[r], mapping, r + 1);
    if (parsed) rows.push(parsed);
  }

  try {
    const response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: { "x-sync-secret": secret },
      payload: JSON.stringify({
        students: rows,
        syncSource: "Google Apps Script Section Sync (" + sheetName + ")",
      }),
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    const result = JSON.parse(response.getContentText() || "{}");

    if (code === 200 && result.success) {
      ui.alert("✅ " + sheetName + " Synced!", "Updated " + rows.length + " students successfully.", SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      ui.alert("❌ Sync Error (" + code + ")", result.error || response.getContentText(), SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (err) {
    ui.alert("❌ Network Error", err.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Live change detection via Installable On-Edit trigger
 * Whenever a staff member edits any cell in AURA, ZEN, or NEO, this automatically pushes the single updated student row!
 */
function handleInstallableEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  // Only trigger on Class IX tabs
  if (!CONFIG.TARGET_TABS.includes(sheetName)) return;

  const editedRow = e.range.getRow();
  if (editedRow <= 1) return; // Ignore header edits

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const mapping = getColumnMapping(headers);
  if (mapping.name === undefined) return;

  const rowData = sheet.getRange(editedRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  const parsedStudent = parseRow(sheetName, rowData, mapping, editedRow);
  if (!parsedStudent) return;

  const { endpoint, secret } = getSettings();

  try {
    UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: { "x-sync-secret": secret },
      payload: JSON.stringify({
        singleStudent: parsedStudent,
        syncSource: "Live Edit on " + sheetName + " (Row " + editedRow + ")",
      }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error("Live onEdit sync failed for row " + editedRow + ":", err);
  }
}

/**
 * Connection check utility
 */
function checkConnection() {
  const ui = SpreadsheetApp.getUi();
  const { endpoint } = getSettings();

  try {
    const res = UrlFetchApp.fetch(endpoint, { method: "get", muteHttpExceptions: true });
    const code = res.getResponseCode();
    if (code === 200) {
      ui.alert("✅ Connection Verified!", "Portal endpoint is online and reachable:\n" + endpoint + "\n\nServer Response:\n" + res.getContentText(), SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      ui.alert("⚠️ Status Check (" + code + ")", res.getContentText(), SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (err) {
    ui.alert("❌ Could not connect to endpoint", err.message + "\n\nMake sure your endpoint URL is accessible.", SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
