import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-primary/30" />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className='flex justify-between items-start'>
          <CardTitle className="text-lg font-bold mb-1 font-headline">{course.title}</CardTitle>
          <Badge variant="secondary">{course.language}</Badge>
        </div>
        <CardDescription className="text-sm mb-4">{course.description}</CardDescription>
        {course.progress > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground">Progress</span>
              <span className="text-xs font-bold text-primary">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild size="sm" className="w-full group">
          <Link href={`/student/courses/${course.id}`}>
            {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
