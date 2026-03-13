import { LoginForm } from '@/components/auth/login-form';

export default function PrincipalLoginPage() {
  return (
    <LoginForm
      role="Principal"
      redirectUrl="/teacher/dashboard"
      showRegistration={true}
    />
  );
}
