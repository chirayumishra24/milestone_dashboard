# SCHOOL MILESTONE — DATA MAPPING & SPECIFICATION DOCUMENT
**Academic Year:** 2026–27  
**Institution:** Cambridge Court High / International School (CCIS)  
**Cohort:** Class IX (Sections: IX-AURA, IX-ZEN, IX-NEO)  
**Date of Audit:** 22 September 2026  

---

## 1. DATA STRUCTURE ANALYSIS & SOURCES OF TRUTH

### Primary Data Sources Examined:
1. **`CLASS IX TARGET SHEET.xlsx`**
   - **Tabs:** `IX-AURA`, `IX-ZEN`, `IX-NEO`
   - **Student Count:**
     - `IX-AURA`: 32 students (Roll 1 to 32)
     - `IX-ZEN`: 33 students (Roll 1 to 33)
     - `IX-NEO`: 32 students (Roll 1 to 32)
     - **Total Cohort:** 97 Students
   - **Columns In Tab:**
     1. `S  NO`: Serial / Roll Number (1 to 33)
     2. `STUDENT NAME`: Full Name in Uppercase
     3. `ENGLISH`: English Language & Literature score / target band
     4. `MATHS`: Mathematics score / target band
     5. `S  ST`: Social Science score / target band
     6. `H/S/F`: Second language elective (Hindi / Sanskrit / French)
     7. `SCIENCE`: Science integrated score / target band
     8. `IT`: Information Technology (Skill subject code 402)
     9. `OVERALL %`: Target percentage set for the student (e.g. `0.85` = 85%, `0.9` = 90%, `"85-90%"`)
     10. `TARGET GIVEN BY SCHOOL`: Formal school target column (in practice, teachers filled the targets directly in `OVERALL %`).

2. **`MASTER_CLASS_IX_MULTI_EXAM.xlsx`**
   - **Total Columns:** 57 Columns, 97 Student records across rows 3 to 99
   - **Columns 1–3:** `Sr. No.`, `Enrollment Number` (`CCIS-IX-AURA-01` to `CCIS-IX-NEO-32`), `Name`
   - **Columns 4–12 (Exam-1 — Baseline / PT-1):** 
     - English, Hindi, Sanskrit, French, Maths, Science, Social Science, IT, Overall %
     - All 97 students have consolidated baseline marks
   - **Columns 13–21 (Exam-2 — Mid Term Exam):**
     - English, Hindi, Sanskrit, French, Maths, Science, Social Science, IT, Overall %
     - Real exam marks out of 20 per subject, total marks out of 120, scaled overall percentage
   - **Columns 22–48 (Exam-3, Exam-4, Exam-5):**
     - Upcoming milestone placeholders: PT-2 (Exam-3), Pre-Board (Exam-4), Annual Board (Exam-5)
   - **Columns 49–57 (Target Group):**
     - Subject-wise target percentages and Overall institutional target.

3. **`ClassIX_Tracker_AppsScript.js`**
   - Apps Script installed in Google Sheet connecting to webhook:
     `https://us-central1-skillizee-products.cloudfunctions.net/syncClass9Performance`
   - Features:
     - Custom menu `🎓 CCIS Portal Sync` with `Sync All Sections` and `Sync Current Section`
     - Installable `onEdit` trigger for real-time live row updates
     - Normalizes row columns dynamically by header text matching
     - Pushes payloads with secret authentication header `x-sync-secret: ccis-alumni-sync-2026`

---

## 2. SHEET & COLUMN MAPPING TABLE

| Source Field (Sheet) | Normalized Property | Data Type | Sample Raw Value | Normalized Value | Handling / Rules |
|---|---|---|---|---|---|
| `S  NO` | `serialNo` / `sNo` | `number` | `1.0` | `1` | Integer serial number within section |
| `Enrollment Number` | `enrollmentNumber` | `string` | `"CCIS-IX-AURA-01"` | `"CCIS-IX-AURA-01"` | Canonical student identifier |
| `STUDENT NAME` | `name` | `string` | `"ACHINTYA KHANDAL"` | `"ACHINTYA KHANDAL"` | Uppercase clean trimmed name |
| Section Tab (`IX-AURA`, etc.) | `section` / `group` | `'AURA' \| 'ZEN' \| 'NEO'` | `"IX-AURA"` | `"AURA"` | Extracted from sheet name |
| Generated Slug | `studentId` | `string` | — | `"ccis-ix-aura-achintya-khandal"` | URL-safe primary key |
| `ENGLISH` | `subjects.english` | `NormalizedValue` | `68.0` or `"12"` | `{ value: 68, displayValue: "68%" }` | Baseline (out of 100) or Mid Term (/20) |
| `H/S/F` | `subjects.secondLanguage` | `NormalizedValue` | `60.0`, `"65-70"` | `{ value: 60, displayValue: "60%" }` | Preserves elective language (`Hindi`, `Sanskrit`, `French`) |
| `MATHS` | `subjects.maths` | `NormalizedValue` | `70.0` or `11.5` | `{ value: 70, displayValue: "70%" }` | Handles numeric scores and decimals |
| `SCIENCE` | `subjects.science` | `NormalizedValue` | `75.0` or `"50-53"` | `{ type: "range", min: 50, max: 53 }` | Range values parsed with midpoint for statistics |
| `S  ST` | `subjects.socialScience` | `NormalizedValue` | `65.0` or `"10.5"` | `{ value: 65, displayValue: "65%" }` | History, Civics, Geography |
| `IT` | `subjects.it` | `NormalizedValue` | `75.0` or `"14"` | `{ value: 75, displayValue: "75%" }` | IT Code 402 |
| `OVERALL %` | `schoolTarget.overall` | `NormalizedValue` | `0.85`, `"85-90%"` | `{ value: 85, displayValue: "85%" }` | Fraction 0.85 -> 85%, Range 85-90% preserved |
| `Exam-2 Overall %` | `currentPerformance.overall` | `NormalizedValue` | `"58.33%"` | `{ value: 58.33, displayValue: "58.33%" }` | Mid Term overall aggregate |

---

## 3. APPS SCRIPT & API ENDPOINT SPECIFICATION

### Outbound Pushes:
- **Trigger:** Manual Menu click or installable `onEdit` trigger.
- **Endpoint:** `POST /api/student/sync` or Firebase Cloud Function `syncClass9Performance`.
- **Payload Schema:**
  ```json
  {
    "students": [
      {
        "sNo": 1,
        "name": "ACHINTYA KHANDAL",
        "group": "AURA",
        "english": 68,
        "maths": 70,
        "sSt": 65,
        "hsf": 60,
        "science": 75,
        "it": 75,
        "overall": 0.85,
        "target": null,
        "sheetName": "IX-AURA",
        "sourceRow": 2
      }
    ],
    "syncSource": "Google Apps Script Manual Sync",
    "timestamp": "2026-09-22T12:00:00.000Z"
  }
  ```

### Read/Write Capability Status:
- **Read Operations:** Supported from Google Sheet -> Web Portal.
- **Write Operations to Sheet:** Currently Google Apps Script is configured for **outward webhooks**. It does not provide a bi-directional REST write-back server into the active spreadsheet file.
- **Intervention Management & Target Updates:** Persisted locally via IndexedDB/LocalStorage with API support for Firestore sync. The interface provides clean "Sync to Sheet Webhook" contracts without fake successful sheet writes.

---

## 4. NORMALIZED APPLICATION DATA MODEL

```typescript
export interface NormalizedValue {
  rawValue: string | number | null;
  type: 'exact' | 'range' | 'exempt' | 'empty' | 'invalid';
  displayValue: string;
  value?: number;
  min?: number;
  max?: number;
  unit: 'percent' | 'marks';
  statusNote?: string;
}

export type StudentStatus = 'ON_TRACK' | 'WATCH' | 'INTERVENTION' | 'CRITICAL' | 'ACHIEVED';

export interface StudentRecord {
  studentId: string;               // e.g. "ccis-ix-aura-achintya-khandal"
  enrollmentNumber: string;        // e.g. "CCIS-IX-AURA-01"
  name: string;
  class: 'IX';                     // Configurable (VI - XII)
  section: 'AURA' | 'ZEN' | 'NEO';
  academicYear: '2026-27';
  secondLanguage: 'Hindi' | 'Sanskrit' | 'French';
  currentPerformance: {
    overall: NormalizedValue;
    subjects: {
      english: NormalizedValue;
      secondLanguage: NormalizedValue;
      maths: NormalizedValue;
      science: NormalizedValue;
      socialScience: NormalizedValue;
      it: NormalizedValue;
    };
    subjectList: Array<{ id: string; code: string; label: string; normalized: NormalizedValue }>;
  };
  schoolTarget: {
    overall: NormalizedValue;
    subjects?: Record<string, NormalizedValue>;
    gapPercentagePoints?: number;
    gapDescription?: string;
  };
  exams: Record<string, ExamEntry>;
  calculatedStatus: StudentStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  interventions?: InterventionRecord[];
  updatedAt: string;
}

export interface ExamEntry {
  id: string;                      // 'exam-1', 'exam-2', etc.
  label: string;                   // 'Class VIII Baseline', 'Mid Term Exam', etc.
  maxMarksPerSubject: number;      // 100 or 20
  overall: NormalizedValue;
  totalMarksScored?: number;
  totalMaxMarks?: number;
  subjects: Record<string, NormalizedValue>;
}

export interface Milestone {
  id: string;
  name: string;
  code: string;
  date: string;
  type: 'baseline' | 'target' | 'actual';
  targetAvg: number;
  actualAvg?: number;
  gap?: number;
  status: 'completed' | 'current' | 'upcoming';
  studentsOnTrackCount: number;
  weight: number;
}

export interface FMSWorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';
  date: string;
  owner: string;
  remarks: string;
}

export interface InterventionRecord {
  id: string;
  studentId: string;
  studentName: string;
  section: string;
  subject: string;
  currentPerformance: number;
  target: number;
  gap: number;
  reason: string;
  assignedTeacher: string;
  strategy: string;
  createdDate: string;
  reviewDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  remarks: string;
}
```

---

## 5. CENTRALIZED CALCULATION RULES & STATUS ENGINE

### Centralized Status Function: `calculateStudentStatus()`
- **Formula:**
  $$\text{Gap} = \text{Current Score } (\%) - \text{Target Score } (\%)$$
- **Threshold Mapping:**
  - $\text{Gap} \ge 0\%$: **ACHIEVED / ON TRACK** (Status: `ACHIEVED` if target met, `ON_TRACK` if pacing well)
  - $-1\% \ge \text{Gap} > -5\%$: **WATCH** (Slight deviation, monitor)
  - $-5\% \ge \text{Gap} > -10\%$: **INTERVENTION** (At Risk, requires teacher strategy)
  - $\text{Gap} \le -10\%$: **CRITICAL** (Severe deficit, urgent academic intervention)

### Overall Milestone Health Formula:
$$\text{Health Score} = 0.35 \times (\% \text{ Students on Track}) + 0.25 \times (\text{Target Progress } \%) + 0.20 \times (\text{Target Achievement Rate}) + 0.10 \times (\text{Interventions Closed Rate}) + 0.10 \times (\text{FMS Steps Completed})$$

### Target Simulator Formula ("What do I need to score?"):
$$\text{Required Score} = \frac{\text{Target Final Score} - \text{Current Weighted Score}}{\text{Remaining Weight}}$$
- If $\text{Required Score} > 100\% \implies$ Mathematically not reachable without bonus/adjusted target.
- If $\text{Required Score} \le 0\% \implies$ Target already achieved.
