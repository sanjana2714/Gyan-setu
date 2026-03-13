import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, UserCheck, User, Users } from 'lucide-react';

const Logo = () => (
    <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
      Gyan<span className="text-accent">Setu</span>
    </h1>
);

export default function TeacherRoleSelectionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <div className="text-center mb-12 md:mb-16">
            <Logo />
            <p className="mt-4 text-lg text-muted-foreground">School Administrator Portal</p>
        </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-8 font-headline">Select Your Role to Login</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <RoleCard 
            icon={<UserCheck className="h-10 w-10 text-primary" />}
            title="Principal"
            description="Overall admin of the application. Manage teachers, students, and school-wide settings."
            href="/teacher/principal/login"
          />
          <RoleCard 
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Class Teacher"
            description="Manage your class, track student attendance, and communicate with parents."
            href="/teacher/class-teacher/login"
          />
          <RoleCard 
            icon={<User className="h-10 w-10 text-primary" />}
            title="Subject Teacher"
            description="Manage assignments, grade quizzes, and monitor student progress in your subject."
            href="/teacher/subject-teacher/login"
          />
        </div>
      </div>
       <Button variant="link" size="sm" asChild className="w-full mt-12">
            <Link href="/">&larr; Back to Home</Link>
        </Button>
    </div>
  );
}

type RoleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
};

function RoleCard({ icon, title, description, href }: RoleCardProps) {
  return (
    <Card className="flex flex-col text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/30">
      <CardHeader className="items-center pt-8">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full group">
          <Link href={href}>
            Login as {title}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
