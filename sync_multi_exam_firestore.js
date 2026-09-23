const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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

async function syncMultiExamData() {
  const rawData = fs.readFileSync(path.join(__dirname, 'full_records.json'), 'utf8');
  const fullRecords = JSON.parse(rawData);

  console.log(`Starting Firestore sync for ${fullRecords.length} multi-exam student records...`);

  let batch = db.batch();
  let opCount = 0;
  let totalBatches = 0;

  for (const record of fullRecords) {
    const docRef = db.collection('students').doc(record.studentId);
    batch.set(docRef, record, { merge: true });
    opCount++;

    if (opCount === 450) {
      await batch.commit();
      totalBatches++;
      console.log(`Committed batch #${totalBatches}`);
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
    totalBatches++;
    console.log(`Committed final batch #${totalBatches}`);
  }

  console.log(`All ${fullRecords.length} records successfully synced to Firestore!`);
  process.exit(0);
}

syncMultiExamData().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
