import { env } from '../config/env';
import { CareerRoadmap } from '../types/roadmap';
import { GenerateRoadmapInput } from '../schemas/requestSchemas';
import { validateAndSanitizeRoadmap } from '../schemas/roadmapSchema';
import { FallbackService } from './fallbackService';

export class AiService {
  private static readonly API_TIMEOUT_MS = 45000; // 45-second timeout guard for complex DAG synthesis

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
      console.error(`[AiService] Live Gemini generation failed (${err.message}). Activating fallback resilience.`);
      return FallbackService.getFallbackRoadmap(targetRole, weeklyCommitmentHours, experienceLevel);
    }
  }

  private static async callGeminiApi(input: GenerateRoadmapInput): Promise<CareerRoadmap> {
    const { targetRole, targetCompanyType, experienceLevel, weeklyCommitmentHours } = input;
    const model = env.GEMINI_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const systemPrompt = `You are an elite principal engineer and career architect.
Reverse-engineer the user's dream job into an actionable, realistic Directed Acyclic Graph (DAG) career roadmap.

STRICT GUIDELINES:
1. Break the roadmap into 3 sequential phases (Foundations, Core Specialization, Capstone & Production Readiness).
2. Generate 5 to 7 high-impact, focused milestone nodes.
3. Every milestone MUST have a unique, stable id (e.g. "ms-core-1", "ms-spec-2").
4. Declare prerequisite dependencies using "prerequisiteIds" pointing ONLY to earlier milestone ids.
5. NO CYCLES. The graph MUST be a valid Directed Acyclic Graph (DAG).
6. Provide concrete, non-generic details: real industry tools, frameworks, and protocols.
7. For every milestone, create a specific weekend project with measurable deliverables.
8. Curate safe GitHub search links (e.g. "https://github.com/search?q=topic%3A..."). NEVER invent direct fake repository URLs.
9. Provide 1 technical interview question with model answer per milestone.
10. Keep descriptions punchy, practical, and under 2 sentences. Estimated hours realistic (15 to 40 hours).`;

    const userPrompt = `Target Role: "${targetRole}"
Target Company/Sector: "${targetCompanyType}"
Candidate Experience Level: "${experienceLevel}"
Weekly Study Commitment: ${weeklyCommitmentHours} hours/week.

Synthesize the complete structured career roadmap.`;

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
                  learningObjectives: { type: 'ARRAY', items: { type: 'STRING' } },
                  weekendProject: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      description: { type: 'STRING' },
                      deliverables: { type: 'ARRAY', items: { type: 'STRING' } },
                      estimatedHours: { type: 'INTEGER' },
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
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
        thinkingConfig: {
          thinkingLevel: 'low',
        },
      },
    };

    const MAX_RETRIES = 2; // Up to 2 retries (3 total attempts)
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
        const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new Error('Gemini API response contained no candidate text.');
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
