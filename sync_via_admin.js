const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const admin = require('../functions/node_modules/firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseVal(raw, isPercentage = false) {
  if (raw === null || raw === undefined || raw === '' || String(raw).trim() === '') {
    return { rawValue: raw ?? null, type: 'empty', displayValue: isPercentage ? 'Not Assigned' : 'Pending', unit: 'percent' };
  }
  const str = String(raw).trim();
  if (str === '-' || str.toLowerCase() === 'exempt') {
    return { rawValue: raw, type: 'exempt', displayValue: 'Exempt (-)', unit: 'percent' };
  }
  const cleaned = str.replace(/%+$/, '%').trim();
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*[-–—/]\s*(\d+(?:\.\d+)?)\s*%?$/);
  if (rangeMatch) {
    const min = Math.min(parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2]));
    const max = Math.max(parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2]));
    return { rawValue: raw, type: 'range', min, max, displayValue: `${min}–${max}%`, unit: 'percent' };
  }
  const num = parseFloat(cleaned.replace('%', ''));
  if (!isNaN(num)) {
    const finalVal = (num > 0 && num <= 1.0) ? Math.round(num * 10000) / 100 : Math.round(num * 100) / 100;
    return { rawValue: raw, type: 'exact', value: finalVal, displayValue: `${finalVal}%`, unit: 'percent' };
  }
  return { rawValue: raw, type: 'invalid', displayValue: str, unit: 'percent' };
}

async function run() {
  const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'students.json'), 'utf-8'));
  console.log(`Ingesting ${rows.length} students into Firestore via Firebase Admin SDK...`);

  const batch = db.batch();
  const now = new Date().toISOString();

  for (const row of rows) {
    const group = (row.group || 'AURA').toUpperCase().replace(/^IX-?/, '');
    const name = String(row.name).trim().toUpperCase();
    const serialNo = Number(row.sNo) || 1;
    const studentId = `ccis-ix-${group.toLowerCase()}-${slugify(name)}`;
    const enrollmentNumber = `CCIS-IX-${group}-${String(serialNo).padStart(2, '0')}`;

    const englishNorm = parseVal(row.english);
    const mathsNorm = parseVal(row.maths);
    const sStNorm = parseVal(row.sSt);
    const hsfNorm = parseVal(row.hsf);
    const scienceNorm = parseVal(row.science);
    const itNorm = parseVal(row.it);
    const overallNorm = parseVal(row.overall, true);
    const targetNorm = parseVal(row.target, true);

    let targetStatus = 'NOT_ASSIGNED';
    let gapPoints = undefined;
    let gapDesc = 'School target has not been assigned yet.';

    if (targetNorm.type === 'exact' && overallNorm.type === 'exact' && targetNorm.value !== undefined && overallNorm.value !== undefined) {
      const gap = Math.round((targetNorm.value - overallNorm.value) * 100) / 100;
      if (gap <= 0) {
        targetStatus = 'ACHIEVED';
        gapPoints = 0;
        gapDesc = `Target achieved (${Math.abs(gap).toFixed(1)} percentage points above target)`;
      } else {
        targetStatus = 'IN_PROGRESS';
        gapPoints = gap;
        gapDesc = `${gap.toFixed(1)} percentage points to target`;
      }
    } else if (targetNorm.type === 'exact' && overallNorm.type === 'range' && overallNorm.min !== undefined) {
      if (overallNorm.min >= targetNorm.value) {
        targetStatus = 'ACHIEVED';
        gapDesc = `Target achieved (Current range ${overallNorm.displayValue} meets or exceeds target)`;
      } else {
        targetStatus = 'IN_PROGRESS';
        gapDesc = `Target is within or near estimated range (${overallNorm.displayValue})`;
      }
    }

    const docRef = db.collection('students').doc(studentId);
    batch.set(docRef, {
      studentId,
      enrollmentNumber,
      name,
      class: 'IX',
      group,
      school: 'CCIS',
      currentPerformance: {
        overall: overallNorm,
        subjects: {
          english: englishNorm,
          maths: mathsNorm,
          socialScience: sStNorm,
          secondLanguage: hsfNorm,
          science: scienceNorm,
          it: itNorm,
        },
        subjectList: [
          { id: 'english', code: 'ENG', label: 'English Language & Lit', normalized: englishNorm },
          { id: 'maths', code: 'MATH', label: 'Mathematics', normalized: mathsNorm },
          { id: 'socialScience', code: 'SST', label: 'Social Science (S.St)', normalized: sStNorm },
          { id: 'secondLanguage', code: 'H/S/F', label: 'H / S / F (2nd Language)', normalized: hsfNorm },
          { id: 'science', code: 'SCI', label: 'Science', normalized: scienceNorm },
          { id: 'it', code: 'IT', label: 'Information Technology (IT)', normalized: itNorm },
        ],
      },
      schoolTarget: {
        overall: targetNorm,
        targetStatus,
        gapPercentagePoints: gapPoints,
        gapDescription: gapDesc,
      },
      source: {
        sheetName: row.sheetName || `IX-${group}`,
        sourceRow: Number(row.sourceRow) || serialNo + 1,
        serialNo,
        lastSyncedAt: now,
      },
      updatedAt: now,
    }, { merge: true });
  }

  await batch.commit();

  // Create sync log
  const logRef = db.collection('sync_logs').doc();
  await logRef.set({
    id: logRef.id,
    syncSource: 'Initial Excel Ingestion (Firebase Admin SDK)',
    startedAt: now,
    completedAt: new Date().toISOString(),
    totalRows: rows.length,
    successfulRows: rows.length,
    failedRows: 0,
    errors: [],
  });

  console.log(`✅ Successfully ingested all ${rows.length} students into Firestore 'students' collection!`);
  process.exit(0);
}

run().catch(err => {
  console.error("Admin sync failed:", err);
  process.exit(1);
});
