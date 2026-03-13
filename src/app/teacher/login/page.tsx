'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is redundant. The main teacher role selection is at /teacher.
// We redirect any traffic from here to /teacher to avoid duplicate pages.
export default function TeacherRoleSelectionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teacher');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p>Redirecting to role selection...</p>
    </div>
  );
}
