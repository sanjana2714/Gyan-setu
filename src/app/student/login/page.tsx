import { LoginForm } from '@/components/auth/login-form';

export default function StudentLoginPage() {
  return (
    <LoginForm
      role="Student"
      redirectUrl="/student"
    />
  );
}
