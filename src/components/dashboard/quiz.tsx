'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Quiz } from '@/lib/types';
import { CheckCircle2, XCircle, Award, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function QuizComponent({ quizId }: { quizId?: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);
        if (quizSnap.exists()) {
          setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl p-8 text-center">
        <p>Loading quiz...</p>
      </Card>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl p-8 text-center">
        <p className="text-muted-foreground">No quiz questions found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/student">Back to Dashboard</Link>
        </Button>
      </Card>
    );
  }

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);
  }

  useEffect(() => {
    async function saveQuizResults() {
      if (isFinished && auth.currentUser && quiz) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const studentSnap = await getDoc(userRef);

          if (studentSnap.exists()) {
            const currentScore = studentSnap.data().overallScore || 0;
            const newScore = Math.min(100, Math.round(((currentScore + (score / totalQuestions * 100)) / 2)));

            await updateDoc(userRef, {
              overallScore: newScore,
              lastQuizDate: serverTimestamp(),
            });

            await addDoc(collection(db, 'quizAttempts'), {
              studentId: auth.currentUser.uid,
              studentName: auth.currentUser.displayName,
              quizId,
              quizTitle: quiz.title,
              score,
              totalQuestions,
              percentage: Math.round((score / totalQuestions) * 100),
              timestamp: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Error saving quiz results:", error);
        }
      }
    }
    saveQuizResults();
  }, [isFinished, quiz, score, totalQuestions, quizId]);

  if (isFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Award className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Quiz Completed!</CardTitle>
          <CardDescription>Great job finishing the quiz.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-4xl font-bold">Your score: {score} / {totalQuestions}</p>
          <p className="text-xl text-muted-foreground">{Math.round((score / totalQuestions) * 100)}%</p>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-4">
          <Button onClick={handleRestart} className='w-full'><RotateCw className="mr-2 h-4 w-4" /> Try Again</Button>
          <Button asChild variant="outline" className='w-full'><Link href="/student">Back to Dashboard</Link></Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline">{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold">{currentQuestion.question}</p>
        <RadioGroup
          value={selectedAnswer ?? undefined}
          onValueChange={setSelectedAnswer}
          disabled={isAnswered}
        >
          {currentQuestion.options.map((option) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedAnswer;
            return (
              <Label
                key={option}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                  isAnswered && isCorrect && "border-green-500 bg-green-500/10",
                  isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                  !isAnswered && "cursor-pointer hover:bg-muted"
                )}
              >
                <RadioGroupItem value={option} />
                <span>{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="ml-auto text-green-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto text-red-500" />}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-sm font-bold">Score: {score}</p>
        {isAnswered ? (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        ) : (
          <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
            Submit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
