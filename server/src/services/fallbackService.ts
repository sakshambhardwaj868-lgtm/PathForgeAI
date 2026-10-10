import fs from 'fs';
import path from 'path';
import { CareerRoadmap } from '../types/roadmap';
import { validateAndSanitizeRoadmap } from '../schemas/roadmapSchema';

export class FallbackService {
  private static getFallbacksDir(): string {
    const candidate1 = path.join(__dirname, '../data/fallbacks');
    if (fs.existsSync(candidate1)) return candidate1;
    const candidate2 = path.join(__dirname, '../../src/data/fallbacks');
    if (fs.existsSync(candidate2)) return candidate2;
    const candidate3 = path.join(process.cwd(), 'src/data/fallbacks');
    if (fs.existsSync(candidate3)) return candidate3;
    const candidate4 = path.join(process.cwd(), 'dist/data/fallbacks');
    if (fs.existsSync(candidate4)) return candidate4;
    return candidate1;
  }

  /**
   * Retrieves the best matching cached roadmap fallback based on target role keywords.
   */
  public static getFallbackRoadmap(
    targetRole: string,
    weeklyCommitmentHours: number = 15,
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'
  ): CareerRoadmap {
    const roleLower = String(targetRole || '').toLowerCase();
    let filename = 'climate-tech.json'; // Default fallback

    if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui') || roleLower.includes('fintech')) {
      filename = 'fintech-ux.json';
    } else if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('llm') || roleLower.includes('data')) {
      filename = 'ai-engineer.json';
    } else if (roleLower.includes('climate') || roleLower.includes('energy') || roleLower.includes('full stack') || roleLower.includes('developer')) {
      filename = 'climate-tech.json';
    }

    const filePath = path.join(this.getFallbacksDir(), filename);

    try {
      const rawText = fs.readFileSync(filePath, 'utf-8');
      const rawJson = JSON.parse(rawText);

      // Apply request overrides
      rawJson.weeklyCommitmentHours = weeklyCommitmentHours;
      rawJson.experienceLevel = experienceLevel;

      const validated = validateAndSanitizeRoadmap(rawJson, 'cached_fallback');

      if (!validated.success) {
        throw new Error(`Fallback validation failed: ${validated.errors.join(', ')}`);
      }

      return validated.data;
    } catch (err) {
      console.error(`Failed to load fallback file ${filename}:`, err);
      // Emergency in-memory fallback if file read somehow fails
      return this.getEmergencyFallback(targetRole, weeklyCommitmentHours, experienceLevel);
    }
  }

  private static getEmergencyFallback(
    targetRole: string,
    weeklyCommitmentHours: number,
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  ): CareerRoadmap {
    const emergencyRaw = {
      id: 'rf-emergency-fallback',
      targetRole: targetRole || 'Software Engineering Specialist',
      targetCompanyType: 'High-Growth Tech Enterprise',
      experienceLevel,
      weeklyCommitmentHours,
      totalEstimatedWeeks: 16,
      phases: [
        { id: 'phase-1', title: 'Phase 1: Foundational Systems Engineering', description: 'Core languages and architectures.', order: 1 },
        { id: 'phase-2', title: 'Phase 2: Domain Deep-Dive & Protocols', description: 'Advanced protocols and pipelines.', order: 2 },
        { id: 'phase-3', title: 'Phase 3: Production Capstone & Readiness', description: 'Production deployments and portfolio proof.', order: 3 },
      ],
      intermediateRoles: [
        { title: 'Associate Software Engineer', estimatedTimelineMonth: 3, description: 'Core feature development and bug fixes.' },
        { title: 'Platform Engineer', estimatedTimelineMonth: 6, description: 'Service scaling and distributed systems.' },
      ],
      milestones: [
        {
          id: 'ms-em-1',
          title: 'Core Architecture & Asynchronous Design',
          category: 'foundation',
          phaseId: 'phase-1',
          estimatedHours: 30,
          prerequisiteIds: [],
          status: 'available',
          isKnown: false,
          actionableData: {
            learningObjectives: ['Master asynchronous event loop mechanics and type-safe contracts.'],
            weekendProject: {
              title: 'High-Concurrency Telemetry Ingestion Service',
              description: 'Build a service processing simulated streaming events with automated unit tests.',
              deliverables: ['GitHub repo with test suite'],
              estimatedHours: 12,
            },
            curatedResources: [
              {
                title: 'GitHub: System Architecture Patterns',
                type: 'github_search',
                searchQueryOrUrl: 'https://github.com/search?q=topic%3Asystem-design+topic%3Aarchitecture',
                description: 'Open reference architectures for high-concurrency systems.',
              },
            ],
            interviewChallenges: [
              {
                question: 'How do you handle backpressure in high-volume streaming queues?',
                idealAnswerKey: 'Apply rate limiting, buffer pools, and reject or drop non-critical frames gracefully.',
                difficulty: 'Medium',
              },
            ],
          },
        },
        {
          id: 'ms-em-2',
          title: 'Distributed State & Reliable Persistence',
          category: 'core-skill',
          phaseId: 'phase-2',
          estimatedHours: 35,
          prerequisiteIds: ['ms-em-1'],
          status: 'locked',
          isKnown: false,
          actionableData: {
            learningObjectives: ['Design partition-tolerant datastores with ACID transaction guarantees.'],
            weekendProject: {
              title: 'Transactional Ledger Microservice',
              description: 'Create an idempotent REST API managing distributed transaction states.',
              deliverables: ['Docker Compose file', 'API integration tests'],
              estimatedHours: 14,
            },
            curatedResources: [
              {
                title: 'GitHub: Microservices Architecture Patterns',
                type: 'github_search',
                searchQueryOrUrl: 'https://github.com/search?q=topic%3Amicroservices+topic%3Adistributed-systems',
                description: 'Production implementations of resilient distributed services.',
              },
            ],
            interviewChallenges: [
              {
                question: 'Explain the difference between optimistic and pessimistic locking in databases.',
                idealAnswerKey: 'Optimistic checks version columns on commit; pessimistic locks rows during read.',
                difficulty: 'Medium',
              },
            ],
          },
        },
        {
          id: 'ms-em-3',
          title: 'Production Capstone & Portfolio Proof',
          category: 'capstone',
          phaseId: 'phase-3',
          estimatedHours: 40,
          prerequisiteIds: ['ms-em-2'],
          status: 'locked',
          isKnown: false,
          actionableData: {
            learningObjectives: ['Deploy multi-stage containerized services with automated health checks.'],
            weekendProject: {
              title: 'End-to-End Enterprise Solution Platform',
              description: 'Full-stack application deployed to cloud with automated CI/CD and metrics.',
              deliverables: ['Live public deployment URL', 'Documentation and architectural diagram'],
              estimatedHours: 18,
            },
            curatedResources: [
              {
                title: 'GitHub: Cloud Native Production Blueprints',
                type: 'github_search',
                searchQueryOrUrl: 'https://github.com/search?q=topic%3Acloud-native+topic%3Akubernetes',
                description: 'Container specifications and production CI/CD workflows.',
              },
            ],
            interviewChallenges: [
              {
                question: 'How do you structure zero-downtime rolling updates in cloud environments?',
                idealAnswerKey: 'Maintain readiness probes and gradually spin up new pods before deregistering old pods.',
                difficulty: 'Hard',
              },
            ],
          },
        },
      ],
    };

    const sanitized = validateAndSanitizeRoadmap(emergencyRaw, 'cached_fallback');
    if (sanitized.success) return sanitized.data;
    throw new Error('Fatal: Emergency fallback could not be validated.');
  }
}
