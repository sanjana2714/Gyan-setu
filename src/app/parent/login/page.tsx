'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. Parents now log in using the student login form.
// We redirect them to the correct page to avoid confusion.
export default function ParentLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <p>Redirecting to login...</p>
    </div>
  );
}
