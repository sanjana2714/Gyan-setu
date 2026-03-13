'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem } from '@/lib/types';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Users, BarChart2, Activity, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QrCodeScanner } from '@/components/dashboard/qr-code-scanner';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Student } from '@/lib/types';

const baseNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: 'Home' },
    { title: 'Dashboard', href: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { title: 'Students', href: '/teacher/students', icon: 'Users' },
    { title: 'Assignments', href: '/teacher/assignments', icon: 'BookUser' },
    { title: 'Messages', href: '/teacher/chat', icon: 'MessageSquare' },
];

const principalNavItems: NavItem[] = [
    ...baseNavItems.slice(0, 3),
    { title: 'Teachers', href: '/teacher/teachers', icon: 'UserCog', role: 'Principal' },
    ...baseNavItems.slice(3)
];


export default function TeacherDashboardPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const selectedClass = searchParams.get('class');
    const role = searchParams.get('role') || 'Principal';

    useEffect(() => {
        async function fetchStudents() {
            setLoading(true);
            const studentsRef = collection(db, 'users');
            const q = query(studentsRef, where("role", "==", "Student"));
            const querySnapshot = await getDocs(q);
            const studentList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
            setStudents(studentList);
            setLoading(false);
        }
        fetchStudents();
    }, []);

    const teacherNavItems = role === 'Principal' ? principalNavItems : baseNavItems;

    const filteredStudents = selectedClass ? students.filter(s => s.class === selectedClass) : students;
    const availableClasses = ['All Classes', ...Array.from(new Set(students.map(s => s.class)))];

    const chartData = filteredStudents.map(s => ({ name: s.name, "Average Score": s.overallScore, "Attendance": s.attendance }));

    const schoolAverageScore = Math.round(students.reduce((acc, s) => acc + s.overallScore, 0) / (students.length || 1));
    const schoolAverageAttendance = Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / (students.length || 1));

    const classAverageScore = selectedClass ? Math.round(filteredStudents.reduce((acc, s) => acc + s.overallScore, 0) / (filteredStudents.length || 1)) : 0;
    const classAverageAttendance = selectedClass ? Math.round(filteredStudents.reduce((acc, s) => acc + s.attendance, 0) / (filteredStudents.length || 1)) : 0;

    const handleClassChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'All Classes') {
            params.delete('class');
        } else {
            params.set('class', value);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const createUrlWithParams = (path: string) => {
        const params = new URLSearchParams(searchParams);
        return `${path}?${params.toString()}`;
    }

    return (
        <DashboardLayout navItems={teacherNavItems}>
            <div className="flex flex-col gap-8">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">{role.replace(/([A-Z])/g, ' $1')} Dashboard</h1>
                        <p className="text-muted-foreground">
                            {role === 'Principal' ? "School-wide performance overview." : `Welcome to your dashboard.`}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <QrCodeScanner />
                        <Button asChild>
                            <Link href={createUrlWithParams("/teacher/students")}>View All Students</Link>
                        </Button>
                    </div>
                </header>

                {loading ? <p>Loading dashboard data...</p> : (
                    <>
                        {role === 'Principal' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>School-wide Analytics</CardTitle>
                                    <CardDescription>Select a class to view detailed performance.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-1">
                                        <Select onValueChange={handleClassChange} value={selectedClass || 'All Classes'}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6'>
                                        <StatCard icon={<Users />} title="Total Students" value={students.length.toString()} />
                                        <StatCard icon={<BarChart2 />} title="School Average Score" value={`${schoolAverageScore}%`} />
                                        <StatCard icon={<Activity />} title="School Average Attendance" value={`${schoolAverageAttendance}%`} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {selectedClass ? (
                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold font-headline">Class {selectedClass} Performance</h2>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <StatCard icon={<Users />} title="Students in Class" value={filteredStudents.length.toString()} />
                                    <StatCard icon={<BarChart2 />} title="Class Average Score" value={`${classAverageScore}%`} />
                                    <StatCard icon={<Activity />} title="Class Average Attendance" value={`${classAverageAttendance}%`} />
                                </div>
                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                                    <div className="xl:col-span-3">
                                        <ProgressChart
                                            data={chartData}
                                            title={`Student Performance: Class ${selectedClass}`}
                                            description="Average scores and attendance for each student."
                                            dataKey="Average Score"
                                            xAxisKey="name"
                                        />
                                    </div>
                                    <div className="xl:col-span-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Student Details</CardTitle>
                                                <CardDescription>Individual student data for Class {selectedClass}.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <StudentTable students={filteredStudents} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </section>
                        ) : role === 'Principal' ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>All Students Overview</CardTitle>
                                    <CardDescription>A quick look at student performance across all classes.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <StudentTable students={students} />
                                    {students.length > 10 && (
                                        <div className='text-center mt-4'>
                                            <Button variant="ghost" asChild>
                                                <Link href={createUrlWithParams(`/teacher/students`)}>View All Students &rarr;</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Students</CardTitle>
                                    <CardDescription>Performance overview for your assigned students.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <StudentTable students={filteredStudents} />
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function StudentTable({ students }: { students: Student[] }) {
    const searchParams = useSearchParams();
    const createUrlWithParams = (path: string) => {
        const params = new URLSearchParams(searchParams);
        return `${path}?${params.toString()}`;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.slice(0, 10).map(student => {
                    return (
                        <TableRow key={student.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9">
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='font-medium'>{student.name}</span>
                                        <span className='text-xs text-muted-foreground'>{student.class}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant={student.overallScore > 80 ? 'default' : student.overallScore > 60 ? 'secondary' : 'destructive'}>{student.overallScore}%</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className='h-4 w-4' /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem asChild>
                                            <Link href={createUrlWithParams(`/teacher/students/${student.id}`)}>View Full Report</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={createUrlWithParams(`/teacher/chat?contactId=contact-2`)}>Send Message</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
                {students.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No students found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
