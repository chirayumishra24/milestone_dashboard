import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// SMTP config — set via: firebase functions:config:set smtp.host smtp.port smtp.user smtp.pass smtp.from
const smtpConfig = functions.config().smtp || {};
const transporter = smtpConfig.host
  ? nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 465,
      secure: Number(smtpConfig.port) === 465,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    })
  : null;

const FROM = smtpConfig.from || 'CCIS Alumni Hub <info@cambridgecourtgroup.com>';

async function sendMail(to: string, subject: string, text: string, html?: string) {
  if (!transporter) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, text, html });
  console.log(`Email sent to ${to}`);
}

// ─── On Contact Message Created ───
export const onContactMessageCreate = functions.firestore
  .document('contact_messages/{docId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const { name, email, phone, subject, message } = data;

    const emailSubject = `CCIS Contact Form: ${subject || 'General Inquiry'}`;
    const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`;
    const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd3bf; border-radius: 12px; background-color: #f5f0e8;">
      <h2 style="color: #172853; font-family: serif; border-bottom: 2px solid #c49a3c; padding-bottom: 8px;">New Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
      <p style="margin-top: 20px; border-top: 1px solid #ddd3bf; padding-top: 15px; white-space: pre-wrap;"><strong>Message:</strong><br/>${message}</p>
    </div>`;

    await sendMail('info@ccischool.org', emailSubject, text, html);
  });

// ─── On Admission Enquiry Created ───
export const onAdmissionEnquiryCreate = functions.firestore
  .document('admissions_enquiries/{docId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const { name, email, phone, grade, message, parentName, curriculum } = data;

    const subject = `New Admission Enquiry for Grade ${grade} - CCIS`;
    const text = `Parent Name: ${parentName || name}\nEmail: ${email}\nPhone: ${phone}\nGrade: ${grade}\nMessage: ${message || `Curriculum: ${curriculum || 'CBSE'}`}`;
    const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd3bf; border-radius: 12px; background-color: #f5f0e8;">
      <h2 style="color: #172853; margin-bottom: 20px; font-family: serif;">New Admission Enquiry</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #ede5d5;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd3bf;">Parent Name</td><td style="padding: 10px; border: 1px solid #ddd3bf;">${parentName || name}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd3bf;">Email</td><td style="padding: 10px; border: 1px solid #ddd3bf;">${email}</td></tr>
        <tr style="background-color: #ede5d5;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd3bf;">Phone</td><td style="padding: 10px; border: 1px solid #ddd3bf;">${phone}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd3bf;">Grade</td><td style="padding: 10px; border: 1px solid #ddd3bf;">Grade ${grade}</td></tr>
        <tr style="background-color: #ede5d5;"><td style="padding: 10px; font-weight: bold; border: 1px solid #ddd3bf;">Message</td><td style="padding: 10px; border: 1px solid #ddd3bf;">${message || 'No additional comments'}</td></tr>
      </table>
    </div>`;

    await sendMail('info@ccischool.org', subject, text, html);
  });

// ─── On Alumni Registration (Profile Created) ───
export const onAlumniProfileCreate = functions.firestore
  .document('alumni_profiles/{docId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data.user?.email || !data.user?.name) return;

    const verificationLink = `https://ccischool.org/verify?id=${snap.id}`;
    const subject = 'Welcome to the CCIS Alumni Hub - Verify Your Email';
    const text = `Dear ${data.user.name},\n\nThank you for registering on the CCIS Alumni Hub!\n\nVerify your email: ${verificationLink}\n\nWarm regards,\nCCIS Alumni Coordinator Team`;
    const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd3bf; border-radius: 12px; background-color: #f5f0e8;">
      <h2 style="color: #172853; margin-bottom: 20px; font-family: serif;">Verify Your Email Address</h2>
      <p>Dear <strong>${data.user.name}</strong>,</p>
      <p>Thank you for registering on the <strong>CCIS Alumni Hub</strong>!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #172853; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 2px solid #c49a3c;">Verify Email Address</a>
      </div>
      <p style="font-size: 0.85em; color: #5a5a6e;">If the button does not work, copy and paste this link: <a href="${verificationLink}">${verificationLink}</a></p>
      <p style="margin-top: 20px; font-size: 0.9em; color: #5a5a6e; border-top: 1px solid #ddd3bf; padding-top: 15px;">
        Warm regards,<br/><strong>CCIS Alumni Coordinator Team</strong><br/><a href="mailto:info@ccischool.org">info@ccischool.org</a>
      </p>
    </div>`;

    await sendMail(data.user.email, subject, text, html);
  });

// ─── Class IX Student Target Tracker Sync Endpoint ───
export const syncClass9Performance = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-sync-secret, Authorization');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      status: 'online',
      function: 'syncClass9Performance',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expectedSecret = process.env.SYNC_SECRET || 'ccis-alumni-sync-2026';
  const providedSecret = req.headers['x-sync-secret'] || req.query.secret || req.body?.secret;

  if (providedSecret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized: Invalid sync secret' });
    return;
  }

  try {
    const body = req.body;
    let rows: any[] = [];
    if (body.singleStudent) {
      rows = [body.singleStudent];
    } else if (Array.isArray(body.students)) {
      rows = body.students;
    } else if (Array.isArray(body.rows)) {
      rows = body.rows;
    }

    if (rows.length === 0) {
      res.status(200).json({ message: 'No rows to synchronize.' });
      return;
    }

    const firestore = admin.firestore();
    let successful = 0;
    let failed = 0;
    const errors: any[] = [];

    // Helper for normalization
    function parseValue(raw: any, isPercentage = false) {
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

    const BATCH_SIZE = 400;
    const now = new Date().toISOString();

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = firestore.batch();
      const chunk = rows.slice(i, i + BATCH_SIZE);

      for (const row of chunk) {
        try {
          const group = (row.group || 'AURA').toUpperCase().replace(/^IX-?/, '');
          const name = String(row.name || 'Unknown').trim().toUpperCase();
          const serialNo = Number(row.sNo) || 1;
          const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const studentId = `ccis-ix-${group.toLowerCase()}-${cleanName}`;
          const enrollmentNumber = `CCIS-IX-${group}-${String(serialNo).padStart(2, '0')}`;

          const englishNorm = parseValue(row.english);
          const mathsNorm = parseValue(row.maths);
          const sStNorm = parseValue(row.sSt);
          const hsfNorm = parseValue(row.hsf);
          const scienceNorm = parseValue(row.science);
          const itNorm = parseValue(row.it);
          const overallNorm = parseValue(row.overall, true);
          const targetNorm = parseValue(row.target, true);

          let targetStatus = 'NOT_ASSIGNED';
          let gapPoints: number | undefined;
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
            if (overallNorm.min >= targetNorm.value!) {
              targetStatus = 'ACHIEVED';
              gapDesc = `Target achieved (Current range ${overallNorm.displayValue} meets or exceeds target)`;
            } else {
              targetStatus = 'IN_PROGRESS';
              gapDesc = `Target is within or near estimated range (${overallNorm.displayValue})`;
            }
          }

          const docRef = firestore.collection('students').doc(studentId);
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

          successful++;
        } catch (err: any) {
          failed++;
          errors.push({ student: row.name, error: err.message });
        }
      }

      await batch.commit();
    }

    const logRef = firestore.collection('sync_logs').doc();
    await logRef.set({
      id: logRef.id,
      syncSource: body.syncSource || 'Cloud Function syncClass9Performance',
      startedAt: now,
      completedAt: new Date().toISOString(),
      totalRows: rows.length,
      successfulRows: successful,
      failedRows: failed,
      errors,
    });

    res.status(200).json({
      success: true,
      message: `Synchronized ${successful} student(s) successfully.`,
      successful,
      failed,
      logId: logRef.id,
    });
  } catch (err: any) {
    console.error('syncClass9Performance error:', err);
    res.status(500).json({ error: 'Sync failed', details: err.message || String(err) });
  }
});

