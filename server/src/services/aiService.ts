import { env } from '../config/env';
import { CareerRoadmap } from '../types/roadmap';
import { GenerateRoadmapInput } from '../schemas/requestSchemas';
import { validateAndSanitizeRoadmap } from '../schemas/roadmapSchema';
import { FallbackService } from './fallbackService';

export class AiService {
  private static readonly API_TIMEOUT_MS = 25000; // 25-second timeout guard to prevent frontend socket drops
  private static readonly MAX_TRANSIENT_RETRIES = 1; // 1 retry for transient (503/500) errors

  /**
   * Generates a structured career roadmap DAG using Gemini models,
   * with strict Zod validation, cycle detection, multi-model fallback chain, and automatic fallback safety.
   */
  public static async generateRoadmap(input: GenerateRoadmapInput): Promise<CareerRoadmap> {
    const { targetRole, targetCompanyType, experienceLevel, weeklyCommitmentHours } = input;

    // Check if API key is present
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === '') {
      console.warn('[AiService] No GEMINI_API_KEY found in environment. Serving cached fallback.');
      return FallbackService.getFallbackRoadmap(targetRole, weeklyCommitmentHours, experienceLevel);
    }

    const primaryModel = env.GEMINI_MODEL || 'gemini-3.8-flash';
    const secondaryModel = env.GEMINI_SECONDARY_MODEL || 'gemini-flash-lite-latest';

    // 1. Attempt Primary Model
    try {
      const liveRoadmap = await this.callGeminiModel(input, primaryModel);
      return liveRoadmap;
    } catch (primaryErr: any) {
      console.warn(`[AiService] Primary model "${primaryModel}" failed (${primaryErr.message}).`);
    }

    // 2. Attempt Secondary Model (if configured and different from primary)
    if (secondaryModel && secondaryModel !== primaryModel) {
      try {
        console.info(`[AiService] Attempting secondary model "${secondaryModel}"...`);
        const secondaryRoadmap = await this.callGeminiModel(input, secondaryModel);
        return secondaryRoadmap;
      } catch (secondaryErr: any) {
        console.warn(`[AiService] Secondary model "${secondaryModel}" failed (${secondaryErr.message}).`);
      }
    }

    // 3. Fallback Resilience: all live attempts exhausted
    console.warn('[AiService] All live Gemini attempts failed. Activating fallback resilience.');
    return FallbackService.getFallbackRoadmap(targetRole, weeklyCommitmentHours, experienceLevel);
  }

  public static async callGeminiModel(input: GenerateRoadmapInput, model: string): Promise<CareerRoadmap> {
    const { targetRole, targetCompanyType, experienceLevel, weeklyCommitmentHours } = input;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const systemPrompt = `You are an elite principal engineer and career architect.
Reverse-engineer the user's dream job into an actionable, comprehensive Directed Acyclic Graph (DAG) career roadmap with a detailed course curriculum for every milestone.

STRICT GUIDELINES:
1. Break the roadmap into 3 to 4 progressive sequential phases (e.g. Foundations, Core Specialization, Advanced Engineering, Capstone & Production Readiness).
2. Generate 6 to 10 high-impact, logically sequenced milestone nodes forming a complete learning journey.
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

    let lastError: Error = new Error(`Gemini model "${model}" call failed.`);

    for (let attempt = 1; attempt <= this.MAX_TRANSIENT_RETRIES + 1; attempt++) {
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

          // Transient errors: 503 (High Demand / Spikes), 500, 502, 504 -> retry with backoff
          const isTransient = response.status === 503 || response.status === 500 || response.status === 502 || response.status === 504;
          if (isTransient && attempt <= this.MAX_TRANSIENT_RETRIES) {
            const backoffMs = attempt * 1500;
            console.warn(`[AiService] Gemini model "${model}" returned HTTP ${response.status} (attempt ${attempt}/${this.MAX_TRANSIENT_RETRIES + 1}). Retrying in ${backoffMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          // Non-transient errors: 429 quota exhaustion, 404 retired model -> fail fast to next model
          if (response.status === 429) {
            throw new Error(`Gemini model "${model}" quota exhausted (HTTP 429).`);
          }
          if (response.status === 404) {
            throw new Error(`Gemini model "${model}" not found or deprecated (HTTP 404).`);
          }

          throw new Error(`Gemini model "${model}" returned HTTP ${response.status}: ${errorText.slice(0, 150)}`);
        }

        const responseData = (await response.json()) as any;
        const candidate = responseData.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const generatedText = candidate?.content?.parts?.[0]?.text;

        if (!generatedText || generatedText.trim() === '') {
          throw new Error(`Gemini model "${model}" response contained no candidate text (finishReason: ${finishReason || 'UNKNOWN'}).`);
        }

        if (finishReason === 'MAX_TOKENS') {
          throw new Error(`Gemini model "${model}" output exceeded max output tokens and was truncated.`);
        }

        let parsedJson: any;
        try {
          parsedJson = JSON.parse(generatedText);
        } catch (parseError: any) {
          throw new Error(`Failed to parse AI output from model "${model}" as JSON: ${parseError.message}`);
        }

        // Ensure user input overrides
        parsedJson.targetRole = targetRole;
        parsedJson.targetCompanyType = targetCompanyType || 'Tech Company';
        parsedJson.experienceLevel = experienceLevel;
        parsedJson.weeklyCommitmentHours = weeklyCommitmentHours;

        // Validate with Zod + Cycle Detector + Prerequisite Verifier
        const validated = validateAndSanitizeRoadmap(parsedJson, 'live_ai', model);

        if (!validated.success) {
          throw new Error(`Graph validation rejected AI output from model "${model}": ${validated.errors.join('; ')}`);
        }

        return validated.data;
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);

        if (fetchErr.name === 'AbortError') {
          // Timeout threshold reached: fail fast to secondary model
          throw new Error(`Gemini model "${model}" call exceeded timeout threshold of ${this.API_TIMEOUT_MS}ms.`);
        }

        lastError = fetchErr;

        // If it's a known non-transient error, throw immediately without retrying the same model
        const isNonRetryable =
          lastError.message.includes('HTTP 429') ||
          lastError.message.includes('quota exhausted') ||
          lastError.message.includes('HTTP 404') ||
          lastError.message.includes('exceeded timeout') ||
          lastError.message.includes('Graph validation rejected') ||
          lastError.message.includes('Failed to parse AI output');

        if (isNonRetryable) {
          throw lastError;
        }

        if (attempt <= this.MAX_TRANSIENT_RETRIES) {
          const backoffMs = attempt * 1500;
          console.warn(`[AiService] Gemini model "${model}" attempt ${attempt} failed (${lastError.message}). Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error(`All attempts for model "${model}" failed.`);
  }
}
