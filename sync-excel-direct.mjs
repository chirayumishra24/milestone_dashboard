import { readFileSync } from 'fs';
import { processAndSaveStudents } from '../src/lib/serverSync.js';

const rows = JSON.parse(readFileSync('./scripts/students.json', 'utf-8'));
console.log(`Loaded ${rows.length} students from JSON. Syncing to Firestore...`);

processAndSaveStudents(rows, 'CLASS IX TARGET SHEET Initial Sync')
  .then(res => {
    console.log("Firestore Sync Result:", res);
    process.exit(0);
  })
  .catch(err => {
    console.error("Firestore Sync Failed:", err);
    process.exit(1);
  });
