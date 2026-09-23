'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiData } from '@/hooks/useApiData';
import { useClassId } from '@/hooks/useClassId';
import { ErrorState, LoadingState } from '@/components/ui/PageStatus';
import EmptyState from '@/components/ui/EmptyState';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';
import Link from 'next/link';
import { UserX } from 'lucide-react';

export default function StudentProfilePage() {
  const classId = useClassId();
  const params = useParams();
  const router = useRouter();
  const studentId = decodeURIComponent((params?.studentId as string) || '');
  const directoryHref = `/classes/${classId}/students`;

  const { data: student, isLoading, error, reload } = useApiData(
    () => schoolMilestoneApi.getStudentById(studentId),
    [studentId]
  );

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading) return <LoadingState message="Loading student profile..." />;

  if (!student) {
    return (
      <EmptyState
        icon={UserX}
        title="Student not found"
        message="No student with this ID was found in any class roster."
        action={
          <Link href={directoryHref} className="text-sm font-semibold text-blue-600 hover:underline">
            Back to the Class {classId} directory
          </Link>
        }
      />
    );
  }

  return <StudentProfileDrawer student={student} isOpen onClose={() => router.push(directoryHref)} />;
}
