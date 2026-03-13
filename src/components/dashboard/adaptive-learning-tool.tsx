'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { personalizedLearningPaths, type PersonalizedLearningPathsOutput } from '@/ai/flows/personalized-learning-paths';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export function AdaptiveLearningTool({ studentId }: { studentId?: string }) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [result, setResult] = useState<PersonalizedLearningPathsOutput | null>(null);
  const [performanceData, setPerformanceData] = useState<string>('{}');
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPerformance() {
      if (!studentId) return;
      setFetchingData(true);
      try {
        const coursesRef = collection(db, 'courses');
        const querySnapshot = await getDocs(coursesRef);
        const courseList = querySnapshot.docs.map(doc => doc.data());

        const perf = {
          scores: Object.fromEntries(courseList.map(c => [c.title, c.progress || 0])),
          timeSpent: Object.fromEntries(courseList.map(c => [c.title, 60])), // Placeholder time
        };
        setPerformanceData(JSON.stringify(perf));
        setAvailableTopics(courseList.map(c => c.title));
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setFetchingData(false);
      }
    }
    fetchPerformance();
  }, [studentId]);

  const getSuggestions = async () => {
    if (!studentId) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: "You must be logged in to get personalized suggestions.",
      });
      return;
    }

    if (availableTopics.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please enroll in or start some courses first so AI can analyze your progress.",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const output = await personalizedLearningPaths({
        studentId: studentId,
        performanceData: performanceData,
        currentTopic: availableTopics[0] || 'Algebra Basics',
        availableTopics: availableTopics,
      });
      setResult(output);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to get suggestions. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="text-accent h-6 w-6" />
          Your Personal Learning Path
        </CardTitle>
        <CardDescription>Our AI will suggest what to learn next based on your recent performance.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[10rem] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p>Analyzing your progress...</p>
          </div>
        ) : result ? (
          <div className="text-sm">
            <h4 className="font-bold mb-2 text-foreground">Suggested Next Steps:</h4>
            <ul className="list-disc list-inside mb-4 space-y-1">
              {result.suggestedPaths.map((path, index) => <li key={index}>{path}</li>)}
            </ul>
            <h4 className="font-bold mb-2 text-foreground">Reasoning:</h4>
            <p className="text-muted-foreground">{result.reasoning}</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Click the button to get your personalized recommendations.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getSuggestions} disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Wand2 className="mr-2 h-4 w-4" />Generate My Path</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
