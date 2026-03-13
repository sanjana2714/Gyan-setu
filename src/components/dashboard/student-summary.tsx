'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { summarizeStudentPerformance } from '@/ai/flows/student-performance-summary';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type StudentSummaryProps = {
    studentData: any;
}

export function StudentSummary({ studentData }: StudentSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const getSummary = async () => {
    setLoading(true);
    setSummary(null);
    try {
      const output = await summarizeStudentPerformance({
        studentPerformanceJson: JSON.stringify(studentData),
      });
      setSummary(output.summary);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to generate summary. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 border-2 border-primary/20 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="text-accent h-6 w-6"/> 
            AI-Generated Summary
        </CardTitle>
        <CardDescription>A quick overview of this student's performance.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[8rem] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p>Generating summary...</p>
          </div>
        ) : summary ? (
          <div className="text-sm">
            <p className="text-muted-foreground">{summary}</p>
          </div>
        ) : (
            <div className="text-center text-muted-foreground">
                <p>Click the button to generate an AI summary of the student's progress.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getSummary} disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Wand2 className="mr-2 h-4 w-4" />Generate Summary</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
