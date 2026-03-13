'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student } from '@/lib/types';

const teacherNavItems: NavItem[] = [
    { title: 'Home', href: '/', icon: 'Home' },
    { title: 'Dashboard', href: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { title: 'Students', href: '/teacher/students', icon: 'Users' },
    { title: 'Assignments', href: '/teacher/assignments', icon: 'BookUser' },
    { title: 'Messages', href: '/teacher/chat', icon: 'MessageSquare' },
];

export default function TeacherStudentsPage() {
    const searchParams = useSearchParams();
    const selectedClass = searchParams.get('class');
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

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

    const filteredStudents = students
        .filter(s => selectedClass ? s.class === selectedClass : true)
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <DashboardLayout navItems={teacherNavItems}>
            <div className="flex flex-col gap-4">
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Students</CardTitle>
                            <CardDescription>
                                {selectedClass ? `Showing students for class ${selectedClass}` : 'Showing all students.'}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? <p>Loading students...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">Courses Completed</TableHead>
                                        <TableHead className="text-center">Overall Score</TableHead>
                                        <TableHead className="text-center hidden md:table-cell">Attendance</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length > 0 ? filteredStudents.map(student => {
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <Avatar>
                                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className='flex flex-col'>
                                                            <span className='font-medium'>{student.name}</span>
                                                            <span className='text-xs text-muted-foreground'>{student.class}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center hidden sm:table-cell">
                                                    <Badge variant="secondary">{student.completedCourses}</Badge>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Badge variant={student.overallScore > 80 ? 'default' : student.overallScore > 60 ? 'secondary' : 'destructive'} >{student.overallScore}%</Badge>
                                                </TableCell>

                                                <TableCell className="text-center hidden md:table-cell">{student.attendance}%</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal className='h-4 w-4' /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/students/${student.id}`}>View Report</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/chat?contactId=contact-2`}>Send Message</Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No students found for your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
