import { RegisterForm } from '@/components/auth/register-form';

export default function PrincipalRegisterPage() {
  return (
    <RegisterForm
      role="Principal"
      redirectUrl="/teacher/principal/login"
    />
  );
}
