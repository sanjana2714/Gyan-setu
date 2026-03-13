import { LoginForm } from '@/components/auth/login-form';

export default function SubjectTeacherLoginPage() {
  return (
    <LoginForm
      role="Subject Teacher"
      redirectUrl="/teacher/dashboard"
    />
  );
}
