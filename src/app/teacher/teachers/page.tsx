
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem, Teacher } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { TeacherRole } from '@/lib/types';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth as appAuth } from '@/lib/firebase';

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

import { deleteDoc, doc } from 'firebase/firestore';

export default function TeacherManagementPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'Principal';

    // This page is only for Principals
    if (role !== 'Principal') {
        return (
            <DashboardLayout navItems={baseNavItems}>
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={principalNavItems}>
            <TeacherManagementContent />
        </DashboardLayout>
    );
}

function TeacherManagementContent() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<TeacherRole | ''>('');
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    const availableClasses = ["6th A", "6th B", "7th A", "7th B", "8th A", "8th B"];
    const availableSubjects = ['Mathematics', 'Science', 'English', 'History', 'Punjabi', 'Computer Science'];

    async function fetchTeachers() {
        setLoading(true);
        try {
            const teachersRef = collection(db, 'users');
            // Principal can see all roles except Students (Principal, Class Teacher, Subject Teacher)
            const q = query(teachersRef, where("role", "!=", "Student"));
            const querySnapshot = await getDocs(q);
            const teacherList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
            setTeachers(teacherList);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
        if (!confirm(`Are you sure you want to delete the account for ${teacherName}?`)) return;

        try {
            await deleteDoc(doc(db, "users", teacherId));
            toast({
                title: "Teacher Deleted",
                description: `Successfully removed ${teacherName}'s account.`,
            });
            fetchTeachers(); // Refresh list
        } catch (error: any) {
            console.error("Error deleting teacher:", error);
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message,
            });
        }
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = `${name.toLowerCase().replace(/\s/g, '.')}@gyansetu.com`;
        const newPassword = Math.random().toString(36).slice(-8);
        const role = formData.get('role') as TeacherRole;
        const assignment = formData.get('assignment') as string;

        try {
            // Note: Creating auth users requires elevated privileges, which might not work client-side in production.
            // This is a simplified example. A real app would use a backend function to create users.
            const userCredential = await createUserWithEmailAndPassword(appAuth, email, newPassword);
            const user = userCredential.user;

            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: name,
                email: email,
                role: role,
                assignment: assignment,
                avatarId: role === 'Principal' ? 'avatar-teacher' : 'avatar-teacher-male',
            });

            toast({
                title: `Account Created for ${name}`,
                description: `Email: ${email} | Password: ${newPassword}. An email has been sent with their credentials.`,
            });

            setOpen(false);
            setSelectedRole('');
            e.currentTarget.reset();
            fetchTeachers(); // Refresh the list
        } catch (error: any) {
            console.error("Error creating teacher:", error);
            toast({
                variant: 'destructive',
                title: 'Error Creating Account',
                description: error.message,
            });
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Manage Teachers</CardTitle>
                        <CardDescription>
                            View teacher assignments and create new accounts.
                        </CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setSelectedRole(''); }}>
                        <DialogTrigger asChild>
                            <Button><UserPlus className="mr-2" /> Add New Teacher</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Teacher Account</DialogTitle>
                                <DialogDescription>
                                    Fill out the form to generate login credentials for a new teacher. Email will be auto-generated.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select name="role" required onValueChange={(value: TeacherRole) => setSelectedRole(value)}>
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Class Teacher">Class Teacher</SelectItem>
                                            <SelectItem value="Subject Teacher">Subject Teacher</SelectItem>
                                            <SelectItem value="Principal">Principal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedRole && selectedRole !== 'Principal' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="assignment">Assignment</Label>
                                        <Select name="assignment" required>
                                            <SelectTrigger id="assignment">
                                                <SelectValue placeholder={`Select a ${selectedRole === 'Class Teacher' ? 'class' : 'subject'}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedRole === 'Class Teacher' && availableClasses.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                                                {selectedRole === 'Subject Teacher' && availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button type="submit">Create Account</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {loading ? <p>Loading teachers...</p> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Assignment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.map(teacher => {
                                    return (
                                        <TableRow key={teacher.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className='font-medium'>{teacher.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{teacher.role}</Badge>
                                            </TableCell>
                                            <TableCell>{teacher.assignment || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className='h-4 w-4' /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteTeacher(teacher.id, teacher.name)} className="text-destructive">Delete Account</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
