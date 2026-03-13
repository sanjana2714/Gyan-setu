'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem, Course } from '@/lib/types';
import { CourseCard } from '@/components/dashboard/course-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const studentNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: 'Home' },
    { title: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
    { title: 'Courses', href: '/student/courses', icon: 'BookOpen' },
    { title: 'Quizzes', href: '/student/quiz', icon: 'Trophy' },
];

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            const coursesCollection = collection(db, 'courses');
            const courseSnapshot = await getDocs(coursesCollection);
            const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(courseList);
            setLoading(false);
        }
        fetchCourses();
    }, []);

    const allLanguages = ['All', ...Array.from(new Set(courses.map(c => c.language)))];

  return (
    <DashboardLayout navItems={studentNavItems}>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Course Catalog</h1>
                <p className="text-muted-foreground">Explore all available courses and start your learning journey.</p>
            </div>
            {loading ? <p>Loading courses...</p> : (
                 <Tabs defaultValue="All" className="w-full">
                    <TabsList>
                        {allLanguages.map(lang => (
                            <TabsTrigger key={lang} value={lang}>{lang}</TabsTrigger>
                        ))}
                    </TabsList>
                    {allLanguages.map(lang => (
                        <TabsContent key={lang} value={lang}>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                                {courses
                                    .filter(course => lang === 'All' || course.language === lang)
                                    .map(course => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    </DashboardLayout>
  );
}
