'use client';
import React, { useEffect, useState } from 'react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { Milestone } from '@/types/academic';
import MilestoneJourney from '@/components/dashboard/MilestoneJourney';
import UpcomingMilestoneCard from '@/components/dashboard/UpcomingMilestoneCard';
import { Compass, Calendar, Award, CheckCircle2, Clock } from 'lucide-react';

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await schoolMilestoneApi.getMilestones();
        setMilestones(data);
      } catch (err) {
        console.error('Failed loading milestones:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              CBSE Academic Milestone Gates
            </h1>
            <p className="text-xs text-slate-500">
              6 Progressive Milestones spanning Class VIII baseline to Class IX annual targets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Academic Year 2026 – 2027</span>
        </div>
      </div>

      {/* Connected Milestone Stepper (Aligned 3x2 Grid) */}
      <MilestoneJourney milestones={milestones} />

      {/* Row with Next Milestone Details and Governance Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingMilestoneCard
          daysLeft={23}
          title="Mid Term Examination"
          dateRange="5 Nov 2026 – 15 Nov 2026"
          targetAvg={82}
          currentAvg={79}
          studentsOnTrack={118}
          needAttention={27}
        />

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">
                CBSE Milestone Criteria & Weightage
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Formal assessment weightage mandated under National Education Policy (NEP 2020) and CBSE evaluation framework:
            </p>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span>Periodic Tests (PT-1 & PT-2)</span>
                <strong className="text-slate-900">10% Weightage</strong>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span>Mid-Term Examination</span>
                <strong className="text-slate-900">30% Weightage</strong>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span>Annual Term-End Examination</span>
                <strong className="text-slate-900">50% Weightage</strong>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span>Portfolio & Subject Enrichment</span>
                <strong className="text-slate-900">10% Weightage</strong>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Reconciled with School Examination Committee (SEC)
          </div>
        </div>
      </div>
    </div>
  );
}
