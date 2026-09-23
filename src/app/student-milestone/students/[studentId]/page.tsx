'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StudentRecord } from '@/types/academic';
import { ArrowLeft, User, Award, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.studentId as string;
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentId) return;
      try {
        setIsLoading(true);
        const s = await schoolMilestoneApi.getStudentById(studentId);
        setStudent(s);
      } catch (err) {
        console.error('Failed loading student:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        Loading student dossier...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-500 text-sm">Student ID not found in Class IX roster.</p>
        <button
          onClick={() => router.push('/student-milestone/students')}
          className="text-blue-600 text-xs font-semibold hover:underline"
        >
          ← Return to Student Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/student-milestone/students')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
      </button>

      {/* Render dedicated full-page 360 profile */}
      <StudentProfileDrawer
        student={student}
        isOpen={true}
        onClose={() => router.push('/student-milestone/students')}
      />
    </div>
  );
}
