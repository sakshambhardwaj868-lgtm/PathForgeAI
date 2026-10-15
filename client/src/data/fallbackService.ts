import { CareerRoadmap } from '../types/roadmap';
import climateTechData from './fallbacks/climate-tech.json';
import fintechUxData from './fallbacks/fintech-ux.json';
import aiEngineerData from './fallbacks/ai-engineer.json';

/**
 * Client-side verified offline fallback provider.
 * Guarantees that "Load Verified Offline Fallback" works immediately
 * even when the Gemini API, network, or backend Express server is completely unavailable.
 */
export function getClientOfflineFallback(
  targetRole: string = 'Full Stack Developer at a Climate Tech Startup',
  weeklyCommitmentHours: number = 15,
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'
): CareerRoadmap {
  const roleLower = String(targetRole || '').toLowerCase();
  let baseData: any = climateTechData;

  if (
    roleLower.includes('design') ||
    roleLower.includes('ux') ||
    roleLower.includes('ui') ||
    roleLower.includes('fintech')
  ) {
    baseData = fintechUxData;
  } else if (
    roleLower.includes('ai') ||
    roleLower.includes('machine learning') ||
    roleLower.includes('llm') ||
    roleLower.includes('data')
  ) {
    baseData = aiEngineerData;
  }

  // Deep clone to ensure immutability
  const cloned: CareerRoadmap = JSON.parse(JSON.stringify(baseData));
  if (targetRole && targetRole.trim()) {
    cloned.targetRole = targetRole.trim();
  }
  cloned.weeklyCommitmentHours = weeklyCommitmentHours || cloned.weeklyCommitmentHours;
  cloned.experienceLevel = experienceLevel || cloned.experienceLevel;
  cloned.source = 'cached_fallback';

  // Ensure deterministic DAG edges are built from prerequisiteIds if missing
  if (!cloned.edges || cloned.edges.length === 0) {
    cloned.edges = [];
    cloned.milestones.forEach((m) => {
      (m.prerequisiteIds || []).forEach((prereqId) => {
        cloned.edges.push({
          id: `edge-${prereqId}-${m.id}`,
          source: prereqId,
          target: m.id,
        });
      });
    });
  }

  return cloned;
}
