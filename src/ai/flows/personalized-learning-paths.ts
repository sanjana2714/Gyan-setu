'use server';

/**
 * @fileOverview A personalized learning path suggestion AI agent.
 *
 * - personalizedLearningPaths - A function that suggests personalized learning paths based on student performance.
 * - PersonalizedLearningPathsInput - The input type for the personalizedLearningPaths function.
 * - PersonalizedLearningPathsOutput - The return type for the personalizedLearningPaths function.
 */

import { jsonModel as model } from '@/lib/gemini';
import { z } from 'zod';

const PersonalizedLearningPathsInputSchema = z.object({
  studentId: z.string(),
  performanceData: z.string(),
  currentTopic: z.string(),
  availableTopics: z.array(z.string()),
});
export type PersonalizedLearningPathsInput = z.infer<typeof PersonalizedLearningPathsInputSchema>;

const PersonalizedLearningPathsOutputSchema = z.object({
  suggestedPaths: z.array(z.string()),
  reasoning: z.string(),
});
export type PersonalizedLearningPathsOutput = z.infer<typeof PersonalizedLearningPathsOutputSchema>;

export async function personalizedLearningPaths(input: PersonalizedLearningPathsInput): Promise<PersonalizedLearningPathsOutput> {
  const prompt = `You are an AI learning assistant that analyzes student performance data and suggests personalized learning paths.

  Student ID: ${input.studentId}
  Current Topic: ${input.currentTopic}
  Available Topics: ${input.availableTopics.join(', ')}

  Performance Data: ${input.performanceData}

  Based on the student's performance data and the available topics, suggest personalized learning paths. Explain your reasoning for suggesting these paths, focusing on areas where the student needs the most improvement. Only suggest learning paths that are in the list of available topics.

  Return your response as a JSON object with the following structure:
  {
    "suggestedPaths": ["Path 1", "Path 2"],
    "reasoning": "Explanation here..."
  }
  
  IMPORTANT: Return ONLY the JSON object. Do not include any other text or markdown formatting.`;

  try {
    if (!input.availableTopics || input.availableTopics.length === 0) {
      console.warn("No available topics provided to personalizedLearningPaths");
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    try {
      const parsed = JSON.parse(text);
      return PersonalizedLearningPathsOutputSchema.parse(parsed);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw parseError;
    }
  } catch (error) {
    console.error("Detailed Error in personalizedLearningPaths:", error);
    return {
      suggestedPaths: [input.availableTopics[0] || "General Review"],
      reasoning: "Error generating personalized paths. Please try again later."
    };
  }
}
