import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Users, BookUser, GraduationCap, ArrowRight } from 'lucide-react';

const Logo = () => (
  <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
    Gyan<span className="text-accent">Setu</span>
  </h1>
);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="text-center mb-12 md:mb-16">
        <Logo />
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          Bridging the digital divide in rural education. Interactive lessons, personalized paths, and progress tracking for students in Nabha.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-8 font-headline">Choose Your Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <RoleCard 
            icon={<GraduationCap className="h-10 w-10 text-primary" />}
            title="Student"
            description="Access your lessons, take quizzes, and track your learning journey."
            href="/student/login"
            actionText="Login to Dashboard"
          />
          <RoleCard 
            icon={<BookUser className="h-10 w-10 text-primary" />}
            title="School Administrator"
            description="For Class Teachers, Subject Teachers, and Principals. The Principal is the overall admin and creates accounts for teachers."
            href="/teacher"
            actionText="Login to Dashboard"
          />
          <RoleCard 
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Parent/Guardian"
            description="Login with your child's credentials to view their performance reports and progress."
            href="/student/login"
            actionText="Login with Student ID"
          />
        </div>
      </div>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GyanSetu. Empowering rural India through education.</p>
      </footer>
    </div>
  );
}

type RoleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  actionText: string;
};

function RoleCard({ icon, title, description, href, actionText }: RoleCardProps) {
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
        <Button asChild className="w-full group bg-accent hover:bg-accent/90">
          <Link href={href}>
            {actionText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
