'use server';

/**
 * @fileOverview An AI agent to summarize student performance.
 *
 * - summarizeStudentPerformance - A function that generates a summary of a student's performance.
 * - StudentPerformanceInput - The input type for the summarizeStudentPerformance function.
 * - StudentPerformanceOutput - The return type for the summarizeStudentPerformance function.
 */

import { jsonModel as model } from '@/lib/gemini';
import { z } from 'zod';

const StudentPerformanceInputSchema = z.object({
  studentPerformanceJson: z.string(),
});
export type StudentPerformanceInput = z.infer<typeof StudentPerformanceInputSchema>;

const StudentPerformanceOutputSchema = z.object({
  summary: z.string(),
});
export type StudentPerformanceOutput = z.infer<typeof StudentPerformanceOutputSchema>;

export async function summarizeStudentPerformance(input: StudentPerformanceInput): Promise<StudentPerformanceOutput> {
  const prompt = `You are an expert educational analyst. Your task is to provide a clear, concise summary of a student's performance based on the provided data. The summary should be easy for a teacher to understand quickly.

  Analyze the following student data:
  ${input.studentPerformanceJson}

  Based on this data, generate a summary that covers:
  1. An overall assessment of the student's performance (e.g., excellent, good, needs improvement).
  2. Specific strengths (e.g., high scores in certain subjects, high attendance).
  3. Specific areas that need attention or improvement.
  4. A concluding remark on their engagement or potential.

  Return your response as a JSON object with the following structure:
  {
    "summary": "Full summary text here..."
  }
  
  IMPORTANT: Return ONLY the JSON object. Do not include any other text or markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const parsed = JSON.parse(text);
    return StudentPerformanceOutputSchema.parse(parsed);
  } catch (error) {
    console.error("Error summarizing student performance:", error);
    return {
      summary: "Error generating performance summary. Highly engaged but technical issues prevented a full analysis."
    };
  }
}
