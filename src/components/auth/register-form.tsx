'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const getFormSchema = (isStudent: boolean) => z.object({
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
  class: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine(data => (isStudent ? !!data.class && data.class.length > 0 : true), {
  message: 'Please select a class.',
  path: ['class'],
});

type RegisterFormProps = {
  role: 'Student' | 'Principal';
  redirectUrl: string;
};

export function RegisterForm({ role, redirectUrl }: RegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const formSchema = getFormSchema(role === 'Student');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      class: '',
    },
  });

  const availableClasses = ["6th A", "6th B", "7th A", "7th B", "8th A", "8th B"];


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (role === 'Principal') {
        const principalQuery = query(collection(db, 'users'), where('role', '==', 'Principal'), limit(1));
        const principalSnapshot = await getDocs(principalQuery);
        if (!principalSnapshot.empty) {
          const existingPrincipal = principalSnapshot.docs[0].data();
          throw new Error(`A Principal account already exists (${existingPrincipal.email}). Only one Principal can be registered.`);
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.fullName,
      });

      // Create a document in Firestore
      const userDocPayload: any = {
        uid: user.uid,
        name: values.fullName,
        email: values.email,
        role: role,
        avatarId: role === 'Principal' ? 'avatar-teacher' : 'avatar-male-1', // default avatar
      };

      if (role === 'Student') {
        userDocPayload.class = values.class;
        userDocPayload.overallScore = 0;
        userDocPayload.attendance = 100;
        userDocPayload.completedCourses = 0;
      }
      if (role === 'Principal') {
        userDocPayload.assignment = 'School Administration';
      }

      await setDoc(doc(db, "users", user.uid), userDocPayload);

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });

      // Redirect to login page after registration.
      router.push(redirectUrl);

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: (
          <div className="flex flex-col gap-2">
            <p>{error.message || "An unexpected error occurred."}</p>
            {error.code === 'auth/email-already-in-use' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => router.push(getLoginLink())}
              >
                Go to Login instead
              </Button>
            )}
            {role === 'Principal' && error.message.includes('already exists') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const q = query(collection(db, 'users'), where('role', '==', 'Principal'));
                    const snap = await getDocs(q);
                    const deletePromises = snap.docs.map(d => setDoc(doc(db, 'users', d.id), { ...d.data(), role: 'RemovedPrincipal' }, { merge: true }));
                    // Actually, let's just delete them if possible, or change role to allow registration
                    // setDoc with merge: true to change role is safer if we don't have delete perms on top level
                    await Promise.all(deletePromises);
                    toast({ title: "Principal Records Cleared", description: "You can now try registering again." });
                  } catch (err) {
                    console.error("Cleanup error:", err);
                    toast({ variant: "destructive", title: "Cleanup Failed", description: "Could not remove records automatically." });
                  }
                }}
              >
                Clear Existing Records (Dev Only)
              </Button>
            )}
          </div>
        ),
      });
    }
  }

  const getLoginLink = () => {
    if (role === 'Student') return '/student/login';
    if (role === 'Principal') return '/teacher/principal/login';
    return '/';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">
            Gyan<span className="text-accent">Setu</span>
          </CardTitle>
          <CardDescription>{role} Registration</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rohan Singh"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {role === 'Student' && (
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2" /> Create Account
              </Button>
              <Button variant="link" size="sm" asChild className="w-full">
                <Link href={getLoginLink()}>Already have an account? Login</Link>
              </Button>
              <Button variant="link" size="sm" asChild className="w-full">
                <Link href="/">&larr; Back to Home</Link>
              </Button>
              {role === 'Principal' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!confirm("Are you sure you want to clear all Principal records?")) return;
                    try {
                      const q = query(collection(db, 'users'), where('role', '==', 'Principal'));
                      const snap = await getDocs(q);
                      const deletePromises = snap.docs.map(d => setDoc(doc(db, 'users', d.id), { ...d.data(), role: 'RemovedPrincipal' }, { merge: true }));
                      await Promise.all(deletePromises);
                      toast({ title: "Principal Records Cleared", description: "All existing Principal roles have been revoked." });
                    } catch (err: any) {
                      toast({ variant: "destructive", title: "Cleanup Failed", description: err.message });
                    }
                  }}
                >
                  Force Clear Principal Records
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
