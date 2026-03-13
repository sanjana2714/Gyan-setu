import { LoginForm } from '@/components/auth/login-form';

export default function ClassTeacherLoginPage() {
  return (
    <LoginForm
      role="Class Teacher"
      redirectUrl="/teacher/dashboard"
    />
  );
}
