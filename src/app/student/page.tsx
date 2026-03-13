'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { NavItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from '@/components/dashboard/course-card';
import { AdaptiveLearningTool } from '@/components/dashboard/adaptive-learning-tool';
import { QrCodeGenerator } from '@/components/dashboard/qr-code-generator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Course } from '@/lib/types';
import { onAuthStateChanged, User } from 'firebase/auth';

const studentNavItems: NavItem[] = [
  { title: 'Home', href: '/', icon: 'Home' },
  { title: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
  { title: 'Courses', href: '/student/courses', icon: 'BookOpen' },
  { title: 'Quizzes', href: '/student/quiz', icon: 'Trophy' },
];

export default function StudentDashboardPage() {
  const searchParams = useSearchParams();
  const studentClass = searchParams.get('class');
  const [studentName, setStudentName] = useState('Back');
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStudentName(currentUser.displayName?.split(' ')[0] || 'Back');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      if (!user) return;
      const coursesCollection = collection(db, 'courses');
      const courseSnapshot = await getDocs(coursesCollection);
      const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(courseList);
    }
    fetchCourses();
  }, [user]);

  const relevantCourses = studentClass ? courses.filter(c => c.class === studentClass) : courses;

  const inProgressCourses = relevantCourses.filter(c => c.progress > 0 && c.progress < 100);
  const newCourses = relevantCourses.filter(c => c.progress === 0).slice(0, 2);

  if (loading) {
    return (
      <DashboardLayout navItems={studentNavItems}>
        <div className="flex justify-center items-center h-full">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNavItems}>
      <div className="space-y-8">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl">Welcome {studentName}, to Class {studentClass}!</CardTitle>
            <CardDescription>Ready to continue your learning journey? Let's make today productive.</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 font-headline tracking-tight">Continue Learning</h2>
              {inProgressCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {inProgressCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <CardContent className='p-0'>
                    <p className="text-muted-foreground mb-4">You have no courses in progress. Visit the courses page to start a new one!</p>
                    <Button asChild>
                      <Link href="/student/courses">Explore Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-4 font-headline tracking-tight">Explore New Courses</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {newCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          </div>

          <aside className="xl:col-span-1 space-y-8">
            <AdaptiveLearningTool studentId={user?.uid} />
            <QrCodeGenerator
              studentId={user?.uid}
              studentName={studentName}
              studentClass={studentClass}
              courses={courses.map(c => ({ courseId: c.id, progress: c.progress, title: c.title }))}
            />
          </aside>

        </div>
      </div>
    </DashboardLayout>
  );
}
