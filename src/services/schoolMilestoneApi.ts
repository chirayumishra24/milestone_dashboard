import { StudentRecord, Milestone, FMSWorkflowStep, InterventionRecord, OverallHealthMetrics } from '@/types/academic';
import { INITIAL_CLASS_IX_STUDENTS } from '@/data/initialClass9Data';
import { INITIAL_MILESTONES } from '@/data/initialMilestones';
import { INITIAL_FMS_STEPS } from '@/data/initialFmsWorkflow';
import { INITIAL_INTERVENTIONS } from '@/data/initialInterventions';
import { calculateOverallMilestoneHealth } from '@/utils/academicCalculations';

const STORAGE_KEYS = {
  STUDENTS: 'school_milestone_students_v1',
  INTERVENTIONS: 'school_milestone_interventions_v1',
  FMS_STEPS: 'school_milestone_fms_v1',
  MILESTONES: 'school_milestone_milestones_v1',
  LAST_SYNC: 'school_milestone_last_sync_v1',
};

class SchoolMilestoneApiService {
  private cache: {
    students: StudentRecord[] | null;
    milestones: Milestone[] | null;
    fmsSteps: FMSWorkflowStep[] | null;
    interventions: InterventionRecord[] | null;
    lastUpdated: string;
  } = {
    students: null,
    milestones: null,
    fmsSteps: null,
    interventions: null,
    lastUpdated: '22 Sep 2026 • 12:05 PM',
  };

  /**
   * Fetches all student records
   */
  async getStudents(): Promise<StudentRecord[]> {
    if (this.cache.students) {
      return this.cache.students;
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        if (stored) {
          this.cache.students = JSON.parse(stored);
          return this.cache.students!;
        }
      } catch (err) {
        console.warn('LocalStorage read error:', err);
      }
    }

    // Default to verified official dataset
    this.cache.students = INITIAL_CLASS_IX_STUDENTS;
    return this.cache.students;
  }

  /**
   * Fetches single student by studentId
   */
  async getStudentById(studentId: string): Promise<StudentRecord | null> {
    const students = await this.getStudents();
    const found = students.find((s) => s.studentId === studentId);
    return found || null;
  }

  /**
   * Fetches academic milestones
   */
  async getMilestones(): Promise<Milestone[]> {
    if (this.cache.milestones) return this.cache.milestones;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.MILESTONES);
        if (stored) {
          this.cache.milestones = JSON.parse(stored);
          return this.cache.milestones!;
        }
      } catch (err) {
        console.warn('LocalStorage read error:', err);
      }
    }

    this.cache.milestones = INITIAL_MILESTONES;
    return this.cache.milestones;
  }

  /**
   * Fetches FMS workflow steps
   */
  async getFmsWorkflow(): Promise<FMSWorkflowStep[]> {
    if (this.cache.fmsSteps) return this.cache.fmsSteps;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.FMS_STEPS);
        if (stored) {
          this.cache.fmsSteps = JSON.parse(stored);
          return this.cache.fmsSteps!;
        }
      } catch (err) {
        console.warn('LocalStorage read error:', err);
      }
    }

    this.cache.fmsSteps = INITIAL_FMS_STEPS;
    return this.cache.fmsSteps;
  }

  /**
   * Fetches interventions
   */
  async getInterventions(): Promise<InterventionRecord[]> {
    if (this.cache.interventions) return this.cache.interventions;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.INTERVENTIONS);
        if (stored) {
          this.cache.interventions = JSON.parse(stored);
          return this.cache.interventions!;
        }
      } catch (err) {
        console.warn('LocalStorage read error:', err);
      }
    }

    this.cache.interventions = INITIAL_INTERVENTIONS;
    return this.cache.interventions;
  }

  /**
   * Computes dynamic milestone health
   */
  async getMilestoneHealth(): Promise<OverallHealthMetrics> {
    const students = await this.getStudents();
    const interventions = await this.getInterventions();
    const fmsSteps = await this.getFmsWorkflow();

    const closedInterventions = interventions.filter((i) => i.status === 'Completed').length;
    const completedFms = fmsSteps.filter((s) => s.status === 'Completed').length;

    return calculateOverallMilestoneHealth(
      students,
      closedInterventions,
      interventions.length,
      completedFms,
      fmsSteps.length
    );
  }

  /**
   * Adds or updates an intervention
   */
  async saveIntervention(intervention: InterventionRecord): Promise<InterventionRecord> {
    const list = await this.getInterventions();
    const existingIndex = list.findIndex((i) => i.id === intervention.id);

    let updated: InterventionRecord[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = intervention;
    } else {
      updated = [intervention, ...list];
    }

    this.cache.interventions = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(updated));
    }
    return intervention;
  }

  /**
   * Updates FMS step status
   */
  async updateFmsStep(stepId: string, status: FMSWorkflowStep['status'], remarks?: string): Promise<FMSWorkflowStep[]> {
    const steps = await this.getFmsWorkflow();
    const updated = steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          status,
          remarks: remarks !== undefined ? remarks : s.remarks,
        };
      }
      return s;
    });

    this.cache.fmsSteps = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FMS_STEPS, JSON.stringify(updated));
    }
    return updated;
  }

  /**
   * Returns metadata sync timestamp
   */
  getLastUpdated(): string {
    return this.cache.lastUpdated;
  }

  /**
   * Multi-Class: Returns whole school overview metrics
   */
  async getSchoolOverview(): Promise<import('@/types/academic').SchoolOverviewMetrics> {
    const { SCHOOL_OVERVIEW_DATA } = await import('@/data/schoolClassesData');
    return SCHOOL_OVERVIEW_DATA;
  }

  /**
   * Multi-Class: Returns all class summaries (VI to XII)
   */
  async getAllClasses(): Promise<import('@/types/academic').ClassSummary[]> {
    const { SCHOOL_CLASSES } = await import('@/data/schoolClassesData');
    return SCHOOL_CLASSES;
  }

  /**
   * Multi-Class: Returns specific class summary by code
   */
  async getClassSummary(classId: string): Promise<import('@/types/academic').ClassSummary | null> {
    const classes = await this.getAllClasses();
    return classes.find((c) => c.classId.toUpperCase() === classId.toUpperCase()) || null;
  }

  /**
   * Multi-Class: Returns school consolidated audit report
   */
  async getSchoolConsolidatedReport(): Promise<import('@/types/academic').SchoolConsolidatedReport> {
    const { SCHOOL_CONSOLIDATED_REPORT } = await import('@/data/schoolClassesData');
    return SCHOOL_CONSOLIDATED_REPORT;
  }

  /**
   * Multi-Class: Returns students for specific grade
   */
  async getStudentsByClass(classId: string): Promise<StudentRecord[]> {
    // For Class IX, return the official 160 students dataset
    if (classId.toUpperCase() === 'IX' || classId.toUpperCase() === '9') {
      return this.getStudents();
    }
    // For other classes, return representative student roster
    const baseStudents = await this.getStudents();
    const classInfo = await this.getClassSummary(classId);
    const sections = classInfo?.sections || ['A', 'B', 'C'];

    return baseStudents.slice(0, 50).map((s, idx) => ({
      ...s,
      studentId: `STU-${classId}-${idx + 101}`,
      class: 'IX' as any, // Type compatibility
      section: sections[idx % sections.length] as any,
      group: sections[idx % sections.length] as any,
    }));
  }
}

export const schoolMilestoneApi = new SchoolMilestoneApiService();
