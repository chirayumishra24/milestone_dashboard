'use client';
import React, { useEffect, useState } from 'react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StudentRecord, Milestone, FMSWorkflowStep, OverallHealthMetrics } from '@/types/academic';
import {
  calculateClassSummary,
  calculatePerformanceDistribution,
  calculateSubjectSummary,
  SubjectMetric,
  PerformanceBucket,
} from '@/utils/academicCalculations';
import KpiCards from '@/components/dashboard/KpiCards';
import MilestoneJourney from '@/components/dashboard/MilestoneJourney';
import OverallMilestoneHealth from '@/components/dashboard/OverallMilestoneHealth';
import PerformanceDistributionChart from '@/components/dashboard/PerformanceDistributionChart';
import TargetVsActualChart from '@/components/dashboard/TargetVsActualChart';
import SubjectsPerformanceCard from '@/components/dashboard/SubjectsPerformanceCard';
import StudentsRequiringAttentionTable from '@/components/dashboard/StudentsRequiringAttentionTable';
import UpcomingMilestoneCard from '@/components/dashboard/UpcomingMilestoneCard';
import FmsWorkflowProgressCard from '@/components/dashboard/FmsWorkflowProgressCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import GlobalFilterBar, { SectionFilter, StatusFilter, ViewTab } from '@/components/dashboard/GlobalFilterBar';
import Cohort3DGalaxy from '@/components/dashboard/Cohort3DGalaxy';
import InterventionKanban from '@/components/dashboard/InterventionKanban';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [fmsSteps, setFmsSteps] = useState<FMSWorkflowStep[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<OverallHealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global Filter State
  const [selectedSection, setSelectedSection] = useState<SectionFilter>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('MID_TERM');
  const [activeTab, setActiveTab] = useState<ViewTab>('OVERVIEW');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [studentData, milestoneData, fmsData, healthData] = await Promise.all([
          schoolMilestoneApi.getStudents(),
          schoolMilestoneApi.getMilestones(),
          schoolMilestoneApi.getFmsWorkflow(),
          schoolMilestoneApi.getMilestoneHealth(),
        ]);
        setStudents(studentData);
        setMilestones(milestoneData);
        setFmsSteps(fmsData);
        setHealthMetrics(healthData);
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Consolidating Academic Ledger...</p>
      </div>
    );
  }

  // Calculate cohort section counts
  const auraCount = students.filter((s) => (s.section || s.group) === 'AURA').length;
  const zenCount = students.filter((s) => (s.section || s.group) === 'ZEN').length;
  const neoCount = students.filter((s) => (s.section || s.group) === 'NEO').length;

  // Apply filters
  const filteredStudents = students.filter((s) => {
    const sec = s.section || s.group;
    if (selectedSection !== 'ALL' && sec !== selectedSection) {
      return false;
    }

    const val = s.currentPerformance?.overall?.value ?? 0;
    const tgt = s.schoolTarget?.overall?.value ?? 80;

    if (selectedStatus === 'ACHIEVED' && val < tgt) return false;
    if (selectedStatus === 'ON_TRACK' && (val < 70 || val >= tgt)) return false;
    if (selectedStatus === 'WATCH' && (val < 60 || val >= 70)) return false;
    if (selectedStatus === 'CRITICAL' && val >= 60) return false;

    return true;
  });

  // Dynamic calculations based on filtered student slice
  const summary = calculateClassSummary(filteredStudents);
  const buckets: PerformanceBucket[] = calculatePerformanceDistribution(filteredStudents);
  const subjectMetrics: SubjectMetric[] = calculateSubjectSummary(filteredStudents);

  return (
    <div className="space-y-6">
      {/* Global Filter Bar */}
      <GlobalFilterBar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedExam={selectedExam}
        onExamChange={setSelectedExam}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          total: students.length,
          aura: auraCount,
          zen: zenCount,
          neo: neoCount,
          onTrack: summary.onTrackCount || 118,
          atRisk: summary.atRiskCount || 27,
          critical: summary.criticalCount || 8,
        }}
      />

      {/* Top KPI Cards Row (Always visible across all tabs for instant pulse) */}
      <KpiCards
        totalStudents={summary.totalStudents || filteredStudents.length}
        onTrackCount={summary.onTrackCount || 0}
        onTrackPct={summary.onTrackPct || 0}
        atRiskCount={summary.atRiskCount || 0}
        atRiskPct={summary.atRiskPct || 0}
        criticalCount={summary.criticalCount || 0}
        criticalPct={summary.criticalPct || 0}
        targetAchievedCount={summary.targetAchievedCount || 0}
        targetAchievedPct={summary.targetAchievedPct || 0}
        currentDate="12 Oct 2026"
      />

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Row 1: Academic Milestone Journey & Overall Milestone Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MilestoneJourney milestones={milestones} />
            </div>
            <div className="lg:col-span-1">
              {healthMetrics && <OverallMilestoneHealth metrics={healthMetrics} />}
            </div>
          </div>

          {/* Row 2: Performance Distribution, Target vs Actual, Subjects Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PerformanceDistributionChart buckets={buckets} />
            <TargetVsActualChart students={filteredStudents} />
            <SubjectsPerformanceCard subjects={subjectMetrics} />
          </div>

          {/* Row 3: Students Requiring Attention & Upcoming Milestone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StudentsRequiringAttentionTable students={filteredStudents} />
            </div>
            <div className="lg:col-span-1">
              <UpcomingMilestoneCard
                daysLeft={23}
                title="Mid Term Examination"
                dateRange="5 Nov 2026 – 15 Nov 2026"
                targetAvg={82}
                currentAvg={summary.classAverage || 79}
                studentsOnTrack={summary.onTrackCount || 118}
                needAttention={summary.atRiskCount || 27}
              />
            </div>
          </div>

          {/* Row 4: FMS Workflow Progress & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FmsWorkflowProgressCard steps={fmsSteps} />
            </div>
            <div className="lg:col-span-1">
              <QuickActionsCard />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 3D COHORT GALAXY */}
      {activeTab === 'GALAXY_3D' && (
        <div className="animate-in fade-in duration-300">
          <Cohort3DGalaxy students={filteredStudents} />
        </div>
      )}

      {/* Tab 3: INTERVENTIONS KANBAN */}
      {activeTab === 'KANBAN' && (
        <div className="animate-in fade-in duration-300">
          <InterventionKanban />
        </div>
      )}
    </div>
  );
}
