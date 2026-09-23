# Data preparation scripts

One-off scripts used to turn the school's Excel/Google Sheet exports into the app's seed data
(`src/data/initialClass9Data.ts`). They are not part of the Next.js build.

- `*.py`, `*.js`, `*.mjs`: inspection, conversion and sync scripts.
- `source-data/`: the source Excel workbooks and the JSON extracted from them.
- `legacy-firebase/`: the earlier Firebase/Firestore data layer and Cloud Function. The
  `initialClass9Data.ts` here is a larger dataset that still contains per-exam history
  (`exams`, `examOrder`) not present in the app's current seed data.

These files were moved here from the repository root. The scripts were not rewritten, so their
file paths are inconsistent: some expect to run from the repository root (`scripts/students.json`,
`src/data/...`), others expect the workbooks in the current directory. Check a script's paths
before running it.
