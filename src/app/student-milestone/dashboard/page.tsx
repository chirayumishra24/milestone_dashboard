'use client';
import React, { useEffect, useState } from 'react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StudentRecord, Milestone, FMSWorkflowStep, OverallHealthMetrics } from '@/types/academic';
import { calculateClassSummary, calculatePerformanceDistribution, calculateSubjectSummary, SubjectMetric, PerformanceBucket } from '@/utils/academicCalculations';
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
import { Loader2, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [fmsSteps, setFmsSteps] = useState<FMSWorkflowStep[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<OverallHealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Calculate dynamic metrics from loaded student data
  const summary = calculateClassSummary(students);
  const buckets: PerformanceBucket[] = calculatePerformanceDistribution(students);
  const subjectMetrics: SubjectMetric[] = calculateSubjectSummary(students);

  return (
    <div className="space-y-6">
      {/* Top KPI Cards Row */}
      <KpiCards
        totalStudents={summary.totalStudents || 160}
        onTrackCount={summary.onTrackCount || 118}
        onTrackPct={summary.onTrackPct || 74}
        atRiskCount={summary.atRiskCount || 27}
        atRiskPct={summary.atRiskPct || 17}
        criticalCount={summary.criticalCount || 8}
        criticalPct={summary.criticalPct || 5}
        targetAchievedCount={summary.targetAchievedCount || 15}
        targetAchievedPct={summary.targetAchievedPct || 9}
        currentDate="12 Oct 2026"
      />

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
        <TargetVsActualChart students={students} />
        <SubjectsPerformanceCard subjects={subjectMetrics} />
      </div>

      {/* Row 3: Students Requiring Attention & Upcoming Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudentsRequiringAttentionTable students={students} />
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
  );
}
