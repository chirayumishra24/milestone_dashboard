const fs = require('fs');
const path = require('path');

const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'students.json'), 'utf-8'));

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
    return { rawValue: raw, type: 'range', min, max, displayValue: min + '–' + max + '%', unit: 'percent' };
  }
  const num = parseFloat(cleaned.replace('%', ''));
  if (!isNaN(num)) {
    const finalVal = (num > 0 && num <= 1.0) ? Math.round(num * 10000) / 100 : Math.round(num * 100) / 100;
    return { rawValue: raw, type: 'exact', value: finalVal, displayValue: finalVal + '%', unit: 'percent' };
  }
  return { rawValue: raw, type: 'invalid', displayValue: str, unit: 'percent' };
}

const records = rows.map((row, idx) => {
  const group = (row.group || 'AURA').toUpperCase().replace(/^IX-?/, '');
  const name = String(row.name).trim().toUpperCase();
  const serialNo = Number(row.sNo) || (idx + 1);
  const studentId = 'ccis-ix-' + group.toLowerCase() + '-' + slugify(name);
  const enrollmentNumber = 'CCIS-IX-' + group + '-' + String(serialNo).padStart(2, '0');

  const englishNorm = parseVal(row.english);
  const mathsNorm = parseVal(row.maths);
  const sStNorm = parseVal(row.sSt);
  const hsfNorm = parseVal(row.hsf);
  const scienceNorm = parseVal(row.science);
  const itNorm = parseVal(row.it);
  const overallNorm = parseVal(row.overall, true);
  const targetNorm = parseVal(row.target, true);

  let targetStatus = 'NOT_ASSIGNED';
  let gapDesc = 'School target has not been assigned yet.';
  let gapPoints = undefined;

  return {
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
      sheetName: row.sheetName || ('IX-' + group),
      sourceRow: Number(row.sourceRow) || serialNo + 1,
      serialNo,
      lastSyncedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
});

const fileContent = `import { StudentRecord } from './academicNormalizer';

export const INITIAL_CLASS_IX_STUDENTS: StudentRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/initialClass9Data.ts'), fileContent, 'utf-8');
console.log('Successfully wrote src/lib/initialClass9Data.ts with ' + records.length + ' students.');
