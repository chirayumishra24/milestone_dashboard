# Project Context: Milestone Academic & FMS Governance Platform

## 1. Project Overview & Mission
The **Milestone Dashboard** is an enterprise academic progress, student intervention, and Faculty Management System (FMS) platform built for **Central Public School (CPS)** (Affiliated to CBSE, New Delhi). 

It bridges executive leadership (Principal, Academic Directors, Trustees) and classroom coordinators by combining:
1. **Whole-School Strategic Intelligence:** Real-time visibility into overall institutional health across 1,170+ scholars from Grade VI through Grade XII.
2. **Multi-Class Granular Drilldowns:** Class-specific milestone matrices, section cohorts (AURA, ZEN, NEO), subject gaps, and remedial action tracking.
3. **Closed-Loop Academic Interventions:** Interactive Kanban workflows connecting diagnostic testing (Mid-Term, Pre-Boards) to targeted student remediation.
4. **Board-Ready Compliance & Reporting:** One-click consolidated report generation, printable academic audit cards, and CSV roster exports.

---

## 2. Technology Stack & Design System
- **Framework:** Next.js 14 (App Router with TypeScript).
- **Styling:** Tailwind CSS with custom design tokens, responsive breakpoints, and `@media print` optimization.
- **Icons:** `lucide-react`.
- **Visualization:** CSS Dumbbell Range Visualizations, Bar Charts, Comparative Heatmaps, and Stepper Progress Bars.
- **State & Data Management:** Centralized REST/In-memory Ledger Service (`schoolMilestoneApi.ts`) backed by typed domain models.

---

## 3. Architecture & Routing Hierarchy

```
/
├── overview/                             # Whole-School Executive Cockpit (Default entry)
├── reports/
│   └── consolidated/                     # Board-Ready Institutional Report Card (Print & CSV)
├── classes/
│   └── [classId]/                        # Dynamic Grade Dashboard (VI to XII)
│       ├── page.tsx                      # Class Milestone Matrix & Kanban Triage
│       ├── students/                     # Dynamic Class Directory with Sorting & CSV
│       └── reports/                      # Class-level Official Audit & Honor Roll Card
└── student-milestone/                    # Class IX Deep Dive Module
    ├── dashboard/                        # Class IX Detailed KPI & Milestone Matrix
    ├── students/                         # Class IX 160-Scholar Roster
    │   └── [studentId]/                  # Individual Scholar 360° Profile Dossier
    ├── milestones/                       # 6-Stage CBSE Examination Journey
    ├── interventions/                    # Remedial Clinic & Subject Clinic Workflows
    ├── workflow/                         # Closed-Loop FMS Exam Operations
    └── settings/                         # Academic Thresholds & Benchmark Configs
```

---

## 4. Key Data Models (`src/types/academic.ts`)

### `StudentRecord`
Primary model representing a student's holistic academic profile:
- `studentId`: Unique roll identifier (e.g., `IX-A-01`).
- `name`: Student full name.
- `section` / `group`: Cohort grouping (`AURA`, `ZEN`, `NEO`).
- `enrollmentNumber`: CBSE registration index.
- `subjects`: Map of `SubjectScore` (English, Mathematics, Science, Social Science, Hindi/Sanskrit).
- `currentPerformance`: Overall score, historical trajectory, and status classification.
- `schoolTarget`: Benchmark targets (overall & per subject).
- `attendance`: Attendance percentage and behavioral metrics.
- `tags`: Critical risk tags (`Intervention Required`, `Borderline Pass`, `Excellence Track`).

### `ClassSummary`
Roll-up metrics for an individual grade level (VI through XII):
- `classId`: e.g. `'VI'`, `'VII'`, `'VIII'`, `'IX'`, `'X'`, `'XI'`, `'XII'`.
- `label`: Full designation (e.g., `'Class IX Secondary'`).
- `totalStudents`, `classAverage`, `targetAvg`, `gap`.
- `onTrackCount`, `atRiskCount`, `criticalCount`.
- `sections`: Array of active sections.
- `coordinator`: Designated faculty leader.

### `SchoolOverviewMetrics`
Institution-wide executive aggregated ledger:
- `totalSchoolStudents`: 1,170 students.
- `overallSchoolAverage`: 78.9%.
- `schoolTargetAverage`: 80.9%.
- `studentsOnTrackCount`: 864 scholars (73.8%).
- `totalCriticalCount`: 65 scholars (5.6%).
- `schoolHealthIndex`: 86.4 / 100.
- `classes`: Array of all 7 grade summaries.

---

## 5. Core Analytical Engine (`src/utils/academicCalculations.ts`)
The mathematical and statistical engine implements CBSE-aligned benchmark algorithms:
- `calculateAverage(numbers: number[])`: Rounded single-decimal arithmetic mean.
- `calculateTargetGap(actual: number, target: number)`: Quantifies negative/positive variance against school targets.
- `calculatePerformanceDistribution(students)`: Bins scholars into standard score brackets (`95%+`, `90–94%`, `80–89%`, `70–79%`, `60–69%`, `<60%`).
- `calculateClassSummary(students)`: Tally of totals, on-track percentages, at-risk rosters, and critical student counts.
- `calculateSubjectSummary(students)`: Computes subject-level averages, targets, and identifies highest/lowest scoring disciplines.

---

## 6. Primary Component Architecture

### Layout & Global Navigation
- `Sidebar.tsx`:
  - Three distinct functional zones: **School Executive** (`/overview`, `/reports/consolidated`), **Grade Cohorts** (direct pills for VI–XII), and **Active Class Tools**.
  - Collapsible mode with tooltip popovers and live ledger synchronization indicator.
- `Header.tsx`:
  - **Dynamic Breadcrumbs:** Tracks hierarchical navigation (`CPS > Class IX > Student Directory`).
  - **Global Command Palette (⌘K):** Autocomplete search across students, sections, and IDs with instant slide-out 360° drawer.
  - **Grade Quick-Switcher:** Top-level dropdown enabling instant grade hopping without navigating back to home.
  - **Academic Session Selector:** Toggle between AY 2026–27 (Active) and archived sessions.

### Whole-School Views (`src/components/school/`)
- `SchoolPulseCards.tsx`: Executive KPI cards showing total scholars, school average, on-track count, critical count, and institutional health index.
- `ClassComparisonHeatmap.tsx`: Cross-grade comparative table with stage filters (Middle, Secondary, Senior Secondary) and 1-click drilldowns.
- `SchoolFmsTimeline.tsx`: Examination lifecycle governance across school wings from syllabus completion to PTM.

### Class-Level Views (`src/components/dashboard/`)
- `KpiCards.tsx`: Interactive triage cards; clicking any card (*Target Achieved*, *On Track*, *At Risk*, *Critical*) filters the scholar table dynamically.
- `MilestoneJourney.tsx`: 6-stage examination roadmap tracking syllabus completion, paper moderation, exam window, and result publishing.
- `InterventionKanban.tsx`: Action board managing remediation stages (*Identified*, *Parent Intimated*, *Clinic Enrolled*, *Post-Test Cleared*).
- `StudentProfileDrawer.tsx`: Slide-over drawer with 360° student diagnostic history, subject-by-subject target dumbbells, and print support.

---

## 7. Developer & Maintenance Operations

### Development Server
```bash
npm run dev
# Running on http://localhost:3000 (or http://localhost:3005 if port 3000 is occupied)
```

### Static Type Checking & Linting
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

### Source Code Conventions
- Paths alias `@/*` maps directly to the `./src/*` directory.
- Client components explicitly declare `'use client'` at line 1.
- All numbers and percentages formatted with single-decimal consistency.
- Print stylesheets embedded via Tailwind `print:` variants to ensure clean PDF output.
