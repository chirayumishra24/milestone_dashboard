'use client';
import React, { useEffect, useState } from 'react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { InterventionRecord } from '@/types/academic';
import InterventionKanban from '@/components/dashboard/InterventionKanban';
import { LifeBuoy, PlusCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await schoolMilestoneApi.getInterventions();
        setInterventions(data);
      } catch (err) {
        console.error('Failed loading interventions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Academic Interventions & Remedial Action
            </h1>
            <p className="text-xs text-slate-500">
              Structured remedial assignments to bridge student learning deficits before Pre-Boards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" /> Create New Intervention
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <InterventionKanban initialInterventions={interventions.length ? interventions : undefined} />
    </div>
  );
}
