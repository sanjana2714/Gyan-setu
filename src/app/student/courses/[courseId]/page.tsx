'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem, Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, FileText, Trophy, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const studentNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: 'Home' },
    { title: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
    { title: 'Courses', href: '/student/courses', icon: 'BookOpen' },
    { title: 'Quizzes', href: '/student/quiz', icon: 'Trophy' },
];

export default function CourseDetailPage({ params: { courseId } }: { params: { courseId: string } }) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourse() {
            setLoading(true);
            const docRef = doc(db, 'courses', courseId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
            }
            setLoading(false);
        }
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    if (loading) {
        return (
            <DashboardLayout navItems={studentNavItems}>
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-2xl font-bold">Loading course...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!course) {
        return (
            <DashboardLayout navItems={studentNavItems}>
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-2xl font-bold">Course not found.</p>
                    <Button variant="link" asChild>
                        <Link href="/student/courses">Go back to courses</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout navItems={studentNavItems}>
            <div className="space-y-6">
                <div>
                    <Button variant="ghost" asChild className='mb-4'>
                        <Link href="/student/courses"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses</Link>
                    </Button>
                    <div className="relative h-64 w-full rounded-lg overflow-hidden border bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary/40" />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div>
                                <Badge variant="secondary" className='mb-2'>{course.language}</Badge>
                                <CardTitle className="text-3xl font-bold font-headline">{course.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{course.description}</CardDescription>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-64">
                                {course.progress > 0 && (
                                    <div className='mb-4'>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
                                            <span className="text-sm font-bold text-primary">{course.progress}%</span>
                                        </div>
                                        <Progress value={course.progress} className="h-2" />
                                    </div>
                                )}
                                <Button asChild className="w-full">
                                    <Link href="/student/quiz">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        {course.progress > 0 ? 'Continue to Quiz' : 'Start Quiz'}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-6 border-t pt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <InfoItem icon={<BookOpen />} label="Modules" value={`${course.modules} learning modules`} />
                            <InfoItem icon={<Clock />} label="Estimated Time" value="2-3 hours" />
                            <InfoItem icon={<FileText />} label="Resources" value="Videos & Notes" />
                        </div>
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-xl font-bold font-headline mb-4">Course Content</h3>
                            <CourseContentList course={course} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

function CourseContentList({ course }: { course: Course }) {
    const [progressMap, setProgressMap] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProgress() {
            if (!auth.currentUser) return;
            try {
                const progressRef = doc(db, 'userProgress', `${auth.currentUser.uid}_${course.id}`);
                const progressSnap = await getDoc(progressRef);
                if (progressSnap.exists()) {
                    setProgressMap(progressSnap.data().completedModules || {});
                }
            } catch (error) {
                console.error("Error fetching course progress:", error);
            } finally {
                setLoading(false);
            }
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) fetchProgress();
        });
        return () => unsubscribe();
    }, [course.id]);

    const handleToggleModule = async (index: number, isCompleted: boolean) => {
        if (!auth.currentUser) return;

        const newProgressMap = { ...progressMap, [index]: isCompleted };
        setProgressMap(newProgressMap);

        const completedCount = Object.values(newProgressMap).filter(Boolean).length;
        const totalModules = course.modules;
        const progressPercent = Math.round((completedCount / totalModules) * 100);

        try {
            const progressRef = doc(db, 'userProgress', `${auth.currentUser.uid}_${course.id}`);
            await setDoc(progressRef, {
                studentId: auth.currentUser.uid,
                courseId: course.id,
                completedModules: newProgressMap,
                progress: progressPercent,
            });

            // Update main course progress if needed (could also be done via course list query)
            // For now, we update the local object for current UI consistency if it was state-managed up top
        } catch (error) {
            console.error("Error saving module progress:", error);
        }
    };

    if (loading) return <p className="text-muted-foreground">Loading course content...</p>;

    return (
        <div className="space-y-4">
            {Array.from({ length: course.modules }).map((_, i) => (
                <ModuleItem
                    key={i}
                    index={i}
                    courseTitle={course.title}
                    isCompleted={progressMap[i] || false}
                    onToggle={(completed) => handleToggleModule(i, completed)}
                />
            ))}
        </div>
    );
}

function ModuleItem({ index, courseTitle, isCompleted, onToggle }: {
    index: number;
    courseTitle: string;
    isCompleted: boolean;
    onToggle: (completed: boolean) => void;
}) {
    // Generate dummy module titles based on course title
    const moduleTitles = [
        `Introduction to ${courseTitle}`,
        `Fundamentals and Core Concepts`,
        `Advanced ${courseTitle} Techniques`,
        `Practical Applications and Case Studies`,
        `Final Review and Summary`
    ];
    const title = moduleTitles[index % moduleTitles.length];

    return (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                <div>
                    <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{title}</h4>
                    <p className="text-xs text-muted-foreground">Approx 30 mins</p>
                </div>
            </div>
            <Button
                variant={isCompleted ? "outline" : "default"}
                size="sm"
                onClick={() => onToggle(!isCompleted)}
            >
                {isCompleted ? 'Completed' : 'Mark as Done'}
            </Button>
        </div>
    )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-md text-primary">
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    )
}
