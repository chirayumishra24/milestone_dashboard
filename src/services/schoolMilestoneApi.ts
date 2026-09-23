import {
  StudentRecord,
  Milestone,
  FMSWorkflowStep,
  InterventionRecord,
  OverallHealthMetrics,
  ClassSummary,
  SchoolOverviewMetrics,
  SchoolConsolidatedReport,
} from '@/types/academic';
import { INITIAL_MILESTONES } from '@/data/initialMilestones';
import { INITIAL_FMS_STEPS } from '@/data/initialFmsWorkflow';
import { INITIAL_INTERVENTIONS } from '@/data/initialInterventions';
import { CLASS_PROFILES, ClassProfile, SCHOOL_INFO, SUBJECT_REMEDIAL_ACTIONS } from '@/data/schoolClassesData';
import { generateSampleRoster } from '@/data/sampleRosters';
import {
  calculateClassSummary,
  calculateOverallMilestoneHealth,
  calculateSubjectSummary,
} from '@/utils/academicCalculations';

const STORAGE_KEYS = {
  STUDENTS: 'school_milestone_students_v1',
  INTERVENTIONS: 'school_milestone_interventions_v1',
  FMS_STEPS: 'school_milestone_fms_v1',
  MILESTONES: 'school_milestone_milestones_v1',
  LAST_SYNC: 'school_milestone_last_sync_v1',
};

/**
 * Bump when the shape of anything under STORAGE_KEYS changes. Data saved under a
 * different version is discarded on first read so stale records can't break the app.
 */
const SCHEMA_VERSION = '2';
const SCHEMA_VERSION_KEY = 'school_milestone_schema_version';

const round1 = (n: number) => Math.round(n * 10) / 10;
const pct = (count: number, total: number) => (total ? round1((count / total) * 100) : 0);

class SchoolMilestoneApiService {
  private cache: {
    students: StudentRecord[] | null;
    milestones: Milestone[] | null;
    fmsSteps: FMSWorkflowStep[] | null;
    interventions: InterventionRecord[] | null;
    sampleRosters: Record<string, StudentRecord[]>;
    lastUpdated: string;
  } = {
    students: null,
    milestones: null,
    fmsSteps: null,
    interventions: null,
    sampleRosters: {},
    lastUpdated: '22 Sep 2026 • 12:05 PM',
  };

  private schemaChecked = false;

  private ensureSchema(): void {
    if (this.schemaChecked || typeof window === 'undefined') return;
    this.schemaChecked = true;
    try {
      const stored = localStorage.getItem(SCHEMA_VERSION_KEY);
      // Data saved before versioning existed (no key) is compatible, so it is kept
      if (stored !== null && stored !== SCHEMA_VERSION) {
        Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      }
      localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
    } catch (err) {
      console.warn('LocalStorage schema check failed:', err);
    }
  }

  private readStored<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    this.ensureSchema();
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : null;
    } catch (err) {
      console.warn('LocalStorage read error:', err);
      return null;
    }
  }

  private writeStored(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    this.ensureSchema();
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Fetches the official Class IX student records
   */
  async getStudents(): Promise<StudentRecord[]> {
    if (this.cache.students) return this.cache.students;

    const stored = this.readStored<StudentRecord[]>(STORAGE_KEYS.STUDENTS);
    if (stored) {
      this.cache.students = stored;
      return stored;
    }

    // Default to verified official dataset (loaded on demand to keep page bundles small)
    const { INITIAL_CLASS_IX_STUDENTS } = await import('@/data/initialClass9Data');
    this.cache.students = INITIAL_CLASS_IX_STUDENTS;
    return this.cache.students;
  }

  /**
   * Fetches every student across all grades (official and sample rosters)
   */
  async getAllStudents(): Promise<StudentRecord[]> {
    const rosters = await Promise.all(CLASS_PROFILES.map((p) => this.getStudentsByClass(p.classId)));
    return rosters.flat();
  }

  /**
   * Fetches single student by studentId, searching every class
   */
  async getStudentById(studentId: string): Promise<StudentRecord | null> {
    for (const profile of CLASS_PROFILES) {
      const found = (await this.getStudentsByClass(profile.classId)).find((s) => s.studentId === studentId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Fetches academic milestones
   */
  async getMilestones(): Promise<Milestone[]> {
    if (!this.cache.milestones) {
      this.cache.milestones = this.readStored<Milestone[]>(STORAGE_KEYS.MILESTONES) ?? INITIAL_MILESTONES;
    }
    return this.cache.milestones;
  }

  /**
   * Fetches FMS workflow steps
   */
  async getFmsWorkflow(): Promise<FMSWorkflowStep[]> {
    if (!this.cache.fmsSteps) {
      this.cache.fmsSteps = this.readStored<FMSWorkflowStep[]>(STORAGE_KEYS.FMS_STEPS) ?? INITIAL_FMS_STEPS;
    }
    return this.cache.fmsSteps;
  }

  /**
   * Fetches interventions
   */
  async getInterventions(): Promise<InterventionRecord[]> {
    if (!this.cache.interventions) {
      this.cache.interventions =
        this.readStored<InterventionRecord[]>(STORAGE_KEYS.INTERVENTIONS) ?? INITIAL_INTERVENTIONS;
    }
    return this.cache.interventions;
  }

  /**
   * Computes milestone health for a class (Class IX by default)
   */
  async getMilestoneHealth(classId = 'IX'): Promise<OverallHealthMetrics> {
    const [students, interventions, fmsSteps] = await Promise.all([
      this.getStudentsByClass(classId),
      this.getInterventions(),
      this.getFmsWorkflow(),
    ]);
    const classInterventions = interventions.filter((i) => (i.classId || 'IX') === classId);
    // The FMS workflow belongs to the milestone programme; other grades are scored without it
    const programmeSteps = this.getProfile(classId)?.hasMilestoneProgramme ? fmsSteps : [];

    return calculateOverallMilestoneHealth(
      students,
      classInterventions.filter((i) => i.status === 'Completed').length,
      classInterventions.length,
      programmeSteps.filter((s) => s.status === 'Completed').length,
      programmeSteps.length
    );
  }

  /**
   * Adds or updates an intervention
   */
  async saveIntervention(intervention: InterventionRecord): Promise<InterventionRecord> {
    const list = await this.getInterventions();
    const existingIndex = list.findIndex((i) => i.id === intervention.id);

    const updated =
      existingIndex >= 0
        ? list.map((item, idx) => (idx === existingIndex ? intervention : item))
        : [intervention, ...list];

    this.writeStored(STORAGE_KEYS.INTERVENTIONS, updated);
    this.cache.interventions = updated;
    return intervention;
  }

  /**
   * Updates FMS step status
   */
  async updateFmsStep(stepId: string, status: FMSWorkflowStep['status'], remarks?: string): Promise<FMSWorkflowStep[]> {
    const steps = await this.getFmsWorkflow();
    const updated = steps.map((s) =>
      s.id === stepId ? { ...s, status, remarks: remarks !== undefined ? remarks : s.remarks } : s
    );

    this.writeStored(STORAGE_KEYS.FMS_STEPS, updated);
    this.cache.fmsSteps = updated;
    return updated;
  }

  /**
   * Discards every change saved in this browser (interventions, workflow updates, edited
   * records) and falls back to the bundled seed data on next read.
   */
  resetLocalData(): void {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    }
    this.cache.students = null;
    this.cache.milestones = null;
    this.cache.fmsSteps = null;
    this.cache.interventions = null;
  }

  /**
   * Returns metadata sync timestamp
   */
  getLastUpdated(): string {
    return this.cache.lastUpdated;
  }

  private getProfile(classId: string): ClassProfile | undefined {
    return CLASS_PROFILES.find((p) => p.classId.toUpperCase() === classId.toUpperCase());
  }

  /**
   * Multi-Class: Returns the roster for a grade. Class IX is the official dataset;
   * other grades return a generated sample roster (see ClassSummary.dataSource).
   */
  async getStudentsByClass(classId: string): Promise<StudentRecord[]> {
    const profile = this.getProfile(classId);
    if (!profile) return [];
    if (profile.dataSource === 'official') return this.getStudents();

    if (!this.cache.sampleRosters[profile.classId]) {
      this.cache.sampleRosters[profile.classId] = generateSampleRoster(profile);
    }
    return this.cache.sampleRosters[profile.classId];
  }

  private buildClassSummary(profile: ClassProfile, students: StudentRecord[]): ClassSummary {
    const summary = calculateClassSummary(students);
    // "On track" at school level includes students who have already met their target
    const onTrackCount = summary.onTrackCount + summary.targetAchievedCount;
    return {
      classId: profile.classId,
      code: profile.code,
      label: profile.label,
      totalStudents: summary.totalStudents,
      classAverage: summary.classAverage,
      targetAvg: summary.targetAverage,
      gap: round1(summary.classAverage - summary.targetAverage),
      onTrackCount,
      onTrackPct: Math.round(pct(onTrackCount, summary.totalStudents)),
      atRiskCount: summary.atRiskCount,
      atRiskPct: summary.atRiskPct,
      criticalCount: summary.criticalCount,
      criticalPct: summary.criticalPct,
      sections: profile.sections,
      coordinator: profile.coordinator,
      milestoneStatus: profile.milestoneStatus,
      dataSource: profile.dataSource,
      hasMilestoneProgramme: profile.hasMilestoneProgramme,
    };
  }

  /**
   * Multi-Class: Returns all class summaries (VI to XII), calculated from each roster
   */
  async getAllClasses(): Promise<ClassSummary[]> {
    return Promise.all(
      CLASS_PROFILES.map(async (profile) =>
        this.buildClassSummary(profile, await this.getStudentsByClass(profile.classId))
      )
    );
  }

  /**
   * Multi-Class: Returns specific class summary by code
   */
  async getClassSummary(classId: string): Promise<ClassSummary | null> {
    const profile = this.getProfile(classId);
    if (!profile) return null;
    return this.buildClassSummary(profile, await this.getStudentsByClass(profile.classId));
  }

  /**
   * Multi-Class: Returns whole school overview metrics, aggregated from every roster
   */
  async getSchoolOverview(): Promise<SchoolOverviewMetrics> {
    const [classes, rosters, interventions, fmsSteps] = await Promise.all([
      this.getAllClasses(),
      Promise.all(CLASS_PROFILES.map((p) => this.getStudentsByClass(p.classId))),
      this.getInterventions(),
      this.getFmsWorkflow(),
    ]);
    const allStudents = rosters.flat();
    const school = calculateClassSummary(allStudents);
    const onTrackCount = school.onTrackCount + school.targetAchievedCount;
    const health = calculateOverallMilestoneHealth(
      allStudents,
      interventions.filter((i) => i.status === 'Completed').length,
      interventions.length,
      fmsSteps.filter((s) => s.status === 'Completed').length,
      fmsSteps.length
    );

    return {
      schoolName: SCHOOL_INFO.schoolName,
      academicYear: SCHOOL_INFO.academicYear,
      totalSchoolStudents: school.totalStudents,
      overallSchoolAverage: school.classAverage,
      schoolTargetAverage: school.targetAverage,
      targetAchievementPct: pct(school.targetAchievedCount, school.totalStudents),
      studentsOnTrackCount: onTrackCount,
      studentsOnTrackPct: pct(onTrackCount, school.totalStudents),
      totalCriticalCount: school.criticalCount,
      totalCriticalPct: pct(school.criticalCount, school.totalStudents),
      schoolHealthIndex: health.healthScore,
      activeExamsCount: classes.length,
      classes,
    };
  }

  /**
   * Multi-Class: Returns school consolidated audit report, generated from live data
   */
  async getSchoolConsolidatedReport(): Promise<SchoolConsolidatedReport> {
    const overview = await this.getSchoolOverview();
    const rosters = await Promise.all(overview.classes.map((c) => this.getStudentsByClass(c.classId)));

    const ranked = [...overview.classes].sort((a, b) => b.classAverage - a.classAverage);
    const topPerformingClasses = ranked.slice(0, 3).map((c) => `${c.label} (${c.classAverage}%)`);

    // Weakest subject per class, measured against that class's average target
    const priorityInterventionAreas = overview.classes
      .map((c, idx) => {
        const weakest = calculateSubjectSummary(rosters[idx])
          .filter((s) => s.average > 0)
          .sort((a, b) => a.average - b.average)[0];
        if (!weakest) return null;
        return {
          grade: c.label,
          subject: weakest.name,
          gap: round1(weakest.average - c.targetAvg),
          actionRequired: SUBJECT_REMEDIAL_ACTIONS[weakest.key] ?? 'Targeted remedial sessions',
        };
      })
      .filter((area): area is NonNullable<typeof area> => area !== null && area.gap < 0)
      .sort((a, b) => a.gap - b.gap)
      .slice(0, 3);

    const behindTarget = overview.classes.filter((c) => c.gap < 0).map((c) => c.label);
    const sampleCount = overview.classes.filter((c) => c.dataSource === 'sample').length;
    const executiveSummary = [
      `Across ${overview.classes.length} grade levels (Grades VI through XII) comprising ${overview.totalSchoolStudents.toLocaleString('en-IN')} enrolled scholars, the composite academic health index stands at ${overview.schoolHealthIndex}/100.`,
      `The school average is ${overview.overallSchoolAverage}% against a target of ${overview.schoolTargetAverage}%, with ${overview.studentsOnTrackPct}% of scholars on track and ${overview.totalCriticalCount} requiring critical support.`,
      ranked.length ? `${ranked[0].label} leads with a ${ranked[0].classAverage}% average.` : '',
      behindTarget.length ? `Grades currently behind target: ${behindTarget.join(', ')}.` : 'All grades are at or above target.',
      sampleCount ? `Note: ${sampleCount} of ${overview.classes.length} grades use sample rosters pending import of official records.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return {
      generatedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      academicSession: SCHOOL_INFO.academicSession,
      schoolName: SCHOOL_INFO.schoolName,
      affiliationNo: SCHOOL_INFO.affiliationNo,
      executiveSummary,
      overview,
      topPerformingClasses,
      priorityInterventionAreas,
    };
  }
}

export const schoolMilestoneApi = new SchoolMilestoneApiService();
