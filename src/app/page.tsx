import DashboardPage from './student-milestone/dashboard/page';
import StudentMilestoneLayout from './student-milestone/layout';

export default function HomePage() {
  return (
    <StudentMilestoneLayout>
      <DashboardPage />
    </StudentMilestoneLayout>
  );
}
