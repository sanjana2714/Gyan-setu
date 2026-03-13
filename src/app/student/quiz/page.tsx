import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { QuizComponent } from '@/components/dashboard/quiz';
import type { NavItem } from '@/lib/types';

const studentNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: 'Home' },
    { title: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
    { title: 'Courses', href: '/student/courses', icon: 'BookOpen' },
    { title: 'Quizzes', href: '/student/quiz', icon: 'Trophy' },
];

export default function StudentQuizPage() {
  return (
    <DashboardLayout navItems={studentNavItems}>
      <div className="flex flex-col items-center">
        <QuizComponent />
      </div>
    </DashboardLayout>
  );
}
