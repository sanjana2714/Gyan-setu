'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProfileForm } from '@/components/profile/profile-form';
import type { NavItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const studentNavItems: NavItem[] = [
  { title: 'Home', href: '/', icon: 'Home' },
  { title: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
  { title: 'Profile', href: '/profile', icon: 'User' },
];

const teacherNavItems: NavItem[] = [
  { title: 'Home', href: '/', icon: 'Home' },
  { title: 'Dashboard', href: '/teacher/dashboard', icon: 'LayoutDashboard' },
  { title: 'Profile', href: '/profile', icon: 'User' },
];


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getNavItems = (): NavItem[] => {
    if (userRole?.includes('Teacher') || userRole === 'Principal') {
      return teacherNavItems;
    }
    if (userRole === 'Student') {
      return studentNavItems;
    }
    // Default or for parents
    return [
      { title: 'Home', href: '/', icon: 'Home' as any },
      { title: 'Profile', href: '/profile', icon: 'User' as any },
    ];
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <DashboardLayout navItems={getNavItems()}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your account settings and personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
