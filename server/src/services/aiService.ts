import { env } from '../config/env';
import { CareerRoadmap } from '../types/roadmap';
import { GenerateRoadmapInput } from '../schemas/requestSchemas';
import { validateAndSanitizeRoadmap } from '../schemas/roadmapSchema';
import { FallbackService } from './fallbackService';

export class AiService {
  private static readonly API_TIMEOUT_MS = 25000; // 25-second timeout guard to prevent frontend socket drops

  /**
   * Generates a structured career roadmap DAG using Gemini 3.8 Flash,
   * with strict Zod validation, cycle detection, and automatic fallback safety.
   */
  public static async generateRoadmap(input: GenerateRoadmapInput): Promise<CareerRoadmap> {
    const { targetRole, targetCompanyType, experienceLevel, weeklyCommitmentHours } = input;

    // Check if API key is present
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === '') {
      console.warn('[AiService] No GEMINI_API_KEY found in environment. Serving cached fallback.');
      return FallbackService.getFallbackRoadmap(targetRole, weeklyCommitmentHours, experienceLevel);
    }

    try {
      const liveRoadmap = await this.callGeminiApi(input);
      return liveRoadmap;
    } catch (err: any) {
      console.warn(`[AiService] Live Gemini generation failed (${err.message}). Activating fallback resilience.`);
      return FallbackService.getFallbackRoadmap(targetRole, weeklyCommitmentHours, experienceLevel);
    }
  }

  private static async callGeminiApi(input: GenerateRoadmapInput): Promise<CareerRoadmap> {
    const { targetRole, targetCompanyType, experienceLevel, weeklyCommitmentHours } = input;
    const model = env.GEMINI_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const systemPrompt = `You are an elite principal engineer and career architect.
Reverse-engineer the user's dream job into an actionable, comprehensive Directed Acyclic Graph (DAG) career roadmap with a detailed course curriculum for every milestone.

STRICT GUIDELINES:
1. Break the roadmap into 3 to 4 progressive sequential phases (e.g. Foundations, Core Specialization, Advanced Engineering, Capstone & Production Readiness).
2. Generate 8 to 12 high-impact, logically sequenced milestone nodes forming a complete learning journey.
3. Every milestone MUST have a unique, stable id (e.g. "ms-fund-1", "ms-core-2", "ms-capstone-1").
4. Declare prerequisite dependencies using "prerequisiteIds" pointing ONLY to earlier milestone ids.
5. NO CYCLES. The graph MUST be a valid Directed Acyclic Graph (DAG).
6. Provide concrete, non-generic details: real industry tools, frameworks, and protocols.
7. For EVERY milestone, provide a full, structured curriculum in "actionableData":
   - "whyItMatters": 1-2 clear sentences explaining why this skill is vital for the target career.
   - "difficultyLevel": "Beginner" | "Intermediate" | "Advanced".
   - "learningOutcomes": 3-4 concrete competencies acquired.
   - "topics": 2-3 topics with 2-4 subtopics each in a sensible learning order.
   - "lessons": 2-3 structured lesson modules, each with id, title, durationMinutes (30 to 60), explanation, studySteps (3-4 steps), practiceActivity, and completionCriteria.
   - "practicalExercises": 1-2 hands-on exercises with id, title, difficulty, instructions, hints.
   - "weekendProject": specific project with title, description, deliverables (2-4 items), estimatedHours (8 to 20), step-by-step "tasks" (3-5 tasks), and "acceptanceCriteria" (2-3 criteria).
   - "curatedResources": 2 official documentation or trusted GitHub search links (e.g. "https://github.com/search?q=topic%3A..."). NEVER invent fake repository URLs.
   - "interviewChallenges": 1-2 realistic technical interview questions with idealAnswerKey and difficulty.
   - "quizQuestions": 2 multiple-choice knowledge-check questions with question, 4 options, correctAnswerIndex (0-3), and explanation.
   - "completionCriteria": 3-4 bullet criteria defining when the learner is ready to proceed.
8. Keep descriptions practical, rich, and direct. Realistic hours (15 to 45 hours per milestone).`;

    const userPrompt = `Target Role: "${targetRole}"
Target Company/Sector: "${targetCompanyType}"
Candidate Experience Level: "${experienceLevel}"
Weekly Study Commitment: ${weeklyCommitmentHours} hours/week.

Synthesize the complete structured career roadmap with comprehensive course curriculum for every milestone.`;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING' },
        targetRole: { type: 'STRING' },
        targetCompanyType: { type: 'STRING' },
        experienceLevel: { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced'] },
        weeklyCommitmentHours: { type: 'INTEGER' },
        totalEstimatedWeeks: { type: 'INTEGER' },
        phases: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING' },
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              order: { type: 'INTEGER' },
            },
            required: ['id', 'title', 'description', 'order'],
          },
        },
        intermediateRoles: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              estimatedTimelineMonth: { type: 'INTEGER' },
              description: { type: 'STRING' },
            },
            required: ['title', 'estimatedTimelineMonth', 'description'],
          },
        },
        milestones: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING' },
              title: { type: 'STRING' },
              category: { type: 'STRING', enum: ['foundation', 'core-skill', 'tooling', 'capstone', 'career-prep'] },
              phaseId: { type: 'STRING' },
              estimatedHours: { type: 'INTEGER' },
              prerequisiteIds: { type: 'ARRAY', items: { type: 'STRING' } },
              status: { type: 'STRING', enum: ['available', 'locked'] },
              isKnown: { type: 'BOOLEAN' },
              actionableData: {
                type: 'OBJECT',
                properties: {
                  whyItMatters: { type: 'STRING' },
                  difficultyLevel: { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced'] },
                  learningObjectives: { type: 'ARRAY', items: { type: 'STRING' } },
                  learningOutcomes: { type: 'ARRAY', items: { type: 'STRING' } },
                  topics: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        title: { type: 'STRING' },
                        subtopics: { type: 'ARRAY', items: { type: 'STRING' } },
                      },
                      required: ['title', 'subtopics'],
                    },
                  },
                  lessons: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        id: { type: 'STRING' },
                        title: { type: 'STRING' },
                        durationMinutes: { type: 'INTEGER' },
                        explanation: { type: 'STRING' },
                        studySteps: { type: 'ARRAY', items: { type: 'STRING' } },
                        practiceActivity: { type: 'STRING' },
                        completionCriteria: { type: 'STRING' },
                      },
                      required: ['id', 'title', 'durationMinutes', 'explanation', 'studySteps', 'practiceActivity', 'completionCriteria'],
                    },
                  },
                  practicalExercises: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        id: { type: 'STRING' },
                        title: { type: 'STRING' },
                        difficulty: { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced'] },
                        instructions: { type: 'STRING' },
                        hints: { type: 'ARRAY', items: { type: 'STRING' } },
                      },
                      required: ['id', 'title', 'difficulty', 'instructions'],
                    },
                  },
                  weekendProject: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      description: { type: 'STRING' },
                      deliverables: { type: 'ARRAY', items: { type: 'STRING' } },
                      estimatedHours: { type: 'INTEGER' },
                      tasks: { type: 'ARRAY', items: { type: 'STRING' } },
                      acceptanceCriteria: { type: 'ARRAY', items: { type: 'STRING' } },
                    },
                    required: ['title', 'description', 'deliverables', 'estimatedHours'],
                  },
                  curatedResources: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        title: { type: 'STRING' },
                        type: { type: 'STRING', enum: ['github_search', 'documentation', 'tutorial'] },
                        searchQueryOrUrl: { type: 'STRING' },
                        description: { type: 'STRING' },
                      },
                      required: ['title', 'type', 'searchQueryOrUrl', 'description'],
                    },
                  },
                  interviewChallenges: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        question: { type: 'STRING' },
                        idealAnswerKey: { type: 'STRING' },
                        difficulty: { type: 'STRING', enum: ['Easy', 'Medium', 'Hard'] },
                      },
                      required: ['question', 'idealAnswerKey', 'difficulty'],
                    },
                  },
                  quizQuestions: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        question: { type: 'STRING' },
                        options: { type: 'ARRAY', items: { type: 'STRING' } },
                        correctAnswerIndex: { type: 'INTEGER' },
                        explanation: { type: 'STRING' },
                      },
                      required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
                    },
                  },
                  completionCriteria: { type: 'ARRAY', items: { type: 'STRING' } },
                },
                required: ['learningObjectives', 'weekendProject', 'curatedResources', 'interviewChallenges'],
              },
            },
            required: ['id', 'title', 'category', 'phaseId', 'estimatedHours', 'prerequisiteIds', 'actionableData'],
          },
        },
      },
      required: ['targetRole', 'phases', 'intermediateRoles', 'milestones'],
    };

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
      },
    };

    const MAX_RETRIES = 1; // 1 retry (2 total attempts) to preserve responsiveness
    let lastError: Error = new Error('Gemini API call failed.');

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT_MS);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY!,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          if ((response.status === 503 || response.status === 429) && attempt <= MAX_RETRIES) {
            const backoffMs = attempt * 1500;
            console.warn(`[AiService] Gemini API returned HTTP ${response.status} (attempt ${attempt}/${MAX_RETRIES + 1}). Retrying in ${backoffMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
          throw new Error(`Gemini API returned HTTP ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const responseData = (await response.json()) as any;
        const candidate = responseData.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const generatedText = candidate?.content?.parts?.[0]?.text;

        if (!generatedText || generatedText.trim() === '') {
          throw new Error(`Gemini API response contained no candidate text (finishReason: ${finishReason || 'UNKNOWN'}).`);
        }

        if (finishReason === 'MAX_TOKENS') {
          throw new Error('Gemini output exceeded max output tokens and was truncated.');
        }

        let parsedJson: any;
        try {
          parsedJson = JSON.parse(generatedText);
        } catch (parseError: any) {
          throw new Error(`Failed to parse AI output as JSON: ${parseError.message}`);
        }

        // Ensure user input overrides
        parsedJson.targetRole = targetRole;
        parsedJson.targetCompanyType = targetCompanyType || 'Tech Company';
        parsedJson.experienceLevel = experienceLevel;
        parsedJson.weeklyCommitmentHours = weeklyCommitmentHours;

        // Validate with Zod + Cycle Detector + Prerequisite Verifier
        const validated = validateAndSanitizeRoadmap(parsedJson, 'live_ai');

        if (!validated.success) {
          throw new Error(`Graph validation rejected AI output: ${validated.errors.join('; ')}`);
        }

        return validated.data;
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        if (fetchErr.name === 'AbortError') {
          lastError = new Error(`Gemini API call exceeded timeout threshold of ${this.API_TIMEOUT_MS}ms.`);
        } else {
          lastError = fetchErr;
        }

        if (attempt <= MAX_RETRIES) {
          const backoffMs = attempt * 1500;
          console.warn(`[AiService] Gemini attempt ${attempt} failed (${lastError.message}). Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('All Gemini API attempts failed.');
  }
}
