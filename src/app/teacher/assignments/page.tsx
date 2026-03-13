
'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { NavItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
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

import { addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

export default function TeacherAssignmentsPage() {
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchClasses() {
            const studentsRef = collection(db, 'users');
            const q = query(studentsRef, where("role", "==", "Student"));
            const querySnapshot = await getDocs(q);
            const studentList = querySnapshot.docs.map(doc => doc.data() as Student);
            const classes = Array.from(new Set(studentList.map(s => s.class)));
            setAvailableClasses(classes);
        }
        fetchClasses();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const targetClass = formData.get('class') as string;

        try {
            await addDoc(collection(db, 'assignments'), {
                title,
                description,
                class: targetClass,
                teacherName: user.displayName || 'Unknown Teacher',
                teacherId: user.uid,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Upload Successful",
                description: "Your materials have been uploaded for the class.",
            });
            (event.target as HTMLFormElement).reset();
        } catch (error: any) {
            console.error("Error uploading assignment:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message || "An error occurred while uploading materials.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout navItems={teacherNavItems}>
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Upload Course Materials</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>New Assignment</CardTitle>
                        <CardDescription>Upload videos, notes, or other materials for your students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="class">Class</Label>
                                    <Select name="class" required>
                                        <SelectTrigger id="class">
                                            <SelectValue placeholder="Select a class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" placeholder="e.g., Introduction to Algebra" required disabled={submitting} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Notes / Description</Label>
                                <Textarea id="description" name="description" placeholder="Provide a brief description or instructions for the students." required disabled={submitting} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file-upload">Upload Video or Notes</Label>
                                <div className="flex items-center justify-center w-full">
                                    <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">Video (MP4, AVI) or Documents (PDF, DOCX)</p>
                                        </div>
                                        <Input id="file-upload" type="file" className="hidden" />
                                    </Label>
                                </div>
                            </div>

                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Uploading...' : 'Upload Materials'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
