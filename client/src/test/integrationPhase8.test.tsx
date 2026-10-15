import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { CareerRoadmap } from '../types/roadmap';
import { resolveApiUrl, safeFetchJson } from '../services/apiClient';

describe('Phase 8 — Final Integration Testing: Refresh Persistence, Study Availability & API Decoupling', () => {
  const sampleRoadmap: CareerRoadmap = {
    id: 'rm-phase8-integration',
    targetRole: 'Senior Cloud Architect',
    targetCompanyType: 'Enterprise Cloud Provider',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 10,
    totalEstimatedWeeks: 7,
    source: 'cached_fallback',
    phases: [
      { id: 'phase-1', title: 'Foundations', description: 'Core foundations', order: 1 },
      { id: 'phase-2', title: 'Core Engineering', description: 'Scaling clusters', order: 2 },
      { id: 'phase-3', title: 'Production', description: 'Multi-region resiliency', order: 3 },
    ],
    intermediateRoles: [
      { title: 'Cloud Associate', estimatedTimelineMonth: 2, description: 'IAM fundamentals' },
    ],
    edges: [
      { id: 'e-ms-1-ms-2', source: 'ms-1', target: 'ms-2' },
      { id: 'e-ms-2-ms-3', source: 'ms-2', target: 'ms-3' },
    ],
    createdAt: '2026-10-10T00:00:00.000Z',
    milestones: [
      {
        id: 'ms-1',
        title: 'Cloud Foundations & IAM',
        category: 'foundation',
        phaseId: 'phase-1',
        estimatedHours: 20,
        prerequisiteIds: [],
        isKnown: false,
        status: 'available',
        actionableData: {
          learningObjectives: ['Master IAM roles and policies', 'Configure VPC networking'],
          weekendProject: {
            title: 'Zero-Trust Multi-Account IAM Blueprint',
            description: 'Deploy isolated environments with federated SSO',
            deliverables: ['Terraform IAM templates', 'Audit logging trail'],
            estimatedHours: 10,
          },
          curatedResources: [],
          interviewChallenges: [
            {
              question: 'How do you structure cross-account role assumption securely?',
              idealAnswerKey: 'Discuss ExternalID, STS assumeRole, and session duration policies.',
              difficulty: 'Medium',
            },
          ],
        },
      },
      {
        id: 'ms-2',
        title: 'Kubernetes Orchestration at Scale',
        category: 'core-skill',
        phaseId: 'phase-2',
        estimatedHours: 30,
        prerequisiteIds: ['ms-1'],
        isKnown: false,
        status: 'locked',
        actionableData: {
          learningObjectives: ['Deploy highly available clusters', 'Configure ingress controllers'],
          weekendProject: {
            title: 'Automated GitOps Multi-Cluster Pipeline',
            description: 'ArgoCD sync with automated canary rollouts',
            deliverables: ['Helm chart repository', 'Canary metric analysis configuration'],
            estimatedHours: 15,
          },
          curatedResources: [],
          interviewChallenges: [
            {
              question: 'What happens during pod eviction when nodes are scaled down?',
              idealAnswerKey: 'Explain graceful termination signals, PodDisruptionBudgets, and drains.',
              difficulty: 'Hard',
            },
          ],
        },
      },
      {
        id: 'ms-3',
        title: 'Disaster Recovery & Multi-Region Resiliency',
        category: 'capstone',
        phaseId: 'phase-3',
        estimatedHours: 20,
        prerequisiteIds: ['ms-2'],
        isKnown: false,
        status: 'locked',
        actionableData: {
          learningObjectives: ['Design sub-minute RPO/RTO failover patterns'],
          weekendProject: {
            title: 'Global Multi-Region Failover Drill',
            description: 'Simulate region outage with automated DNS failover',
            deliverables: ['Failover runbook', 'Route53 health check alarms'],
            estimatedHours: 10,
          },
          curatedResources: [],
          interviewChallenges: [
            {
              question: 'Compare RPO vs RTO in active-active multi-region architectures.',
              idealAnswerKey: 'Detail consensus latency vs immediate recovery tradeoffs.',
              difficulty: 'Hard',
            },
          ],
        },
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    useRoadmapStore.getState().clearRoadmap();
  });

  it('1. Persists user progress across page refreshes via localStorage rehydration', () => {
    // User loads roadmap
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);

    let state = useRoadmapStore.getState();
    expect(state.roadmap).not.toBeNull();
    expect(state.roadmap?.milestones[0].isKnown).toBe(false);
    expect(state.metrics.completedCount).toBe(0);

    // User marks Milestone 1 as completed
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');

    state = useRoadmapStore.getState();
    expect(state.roadmap?.milestones[0].isKnown).toBe(true);
    expect(state.metrics.completedCount).toBe(1);

    // Verify localStorage has cached the completed status
    const cachedRaw = localStorage.getItem('pathforge_active_roadmap');
    expect(cachedRaw).toBeTruthy();
    const cachedData = JSON.parse(cachedRaw!);
    expect(cachedData.milestones[0].isKnown).toBe(true);

    // Simulate page refresh: verify that cached active roadmap preserves completion
    expect(cachedData.milestones[0].id).toBe('ms-1');
    expect(cachedData.milestones[1].status).toBe('available'); // ms-1 completion unlocked ms-2
  });

  it('2. Dynamically recalculates remaining study weeks when weekly availability changes', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);

    // Initial total hours = 20 + 30 + 20 = 70 hrs.
    // At 10 hrs/wk commitment: remainingWeeks = Math.ceil(70 / 10) = 7 weeks
    let state = useRoadmapStore.getState();
    expect(state.roadmap?.weeklyCommitmentHours).toBe(10);
    expect(state.metrics.totalHours).toBe(70);
    expect(state.metrics.remainingHours).toBe(70);
    expect(state.metrics.remainingWeeks).toBe(7);

    // User increases weekly commitment to 20 hrs/week
    useRoadmapStore.getState().setWeeklyCommitmentHours(20);

    state = useRoadmapStore.getState();
    expect(state.roadmap?.weeklyCommitmentHours).toBe(20);
    // At 20 hrs/wk: remainingWeeks = Math.ceil(70 / 20) = 4 weeks
    expect(state.metrics.remainingWeeks).toBe(4);

    // User completes ms-1 (20 hrs done, 50 hrs remaining)
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');
    state = useRoadmapStore.getState();
    expect(state.metrics.completedHours).toBe(20);
    expect(state.metrics.remainingHours).toBe(50);
    // At 20 hrs/wk: remainingWeeks = Math.ceil(50 / 20) = 3 weeks
    expect(state.metrics.remainingWeeks).toBe(3);

    // User drops commitment to 15 hrs/week
    useRoadmapStore.getState().setWeeklyCommitmentHours(15);
    state = useRoadmapStore.getState();
    // At 15 hrs/wk: remainingWeeks = Math.ceil(50 / 15) = 4 weeks
    expect(state.metrics.remainingWeeks).toBe(4);
  });

  it('3. Preserves completed downstream work and flags prerequisite gap warnings non-destructively', () => {
    useRoadmapStore.getState().setRoadmap(sampleRoadmap);

    // Complete ms-1 and ms-2
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');
    useRoadmapStore.getState().toggleMilestoneKnown('ms-2');

    let state = useRoadmapStore.getState();
    expect(state.metrics.completedCount).toBe(2);
    expect(state.metrics.warningGapCount).toBe(0);

    // Now user unchecks ms-1 (e.g., to review foundations)
    useRoadmapStore.getState().toggleMilestoneKnown('ms-1');

    state = useRoadmapStore.getState();
    // ms-2 MUST NOT be wiped out; it stays completed with a prerequisite gap warning
    const ms2 = state.roadmap?.milestones.find((m) => m.id === 'ms-2');
    expect(ms2?.isKnown).toBe(true);
    expect(ms2?.status).toBe('completed_with_warning');
    expect(state.metrics.warningGapCount).toBe(1);
    expect(state.metrics.completedCount).toBe(1); // ms-2 is still counted as completed
  });

  it('4. Resolves API URLs correctly for decoupled frontend/backend deployments', () => {
    // When no VITE_API_URL is configured (relative proxy in dev)
    const relativeUrl = resolveApiUrl('/api/v1/auth/login');
    expect(relativeUrl).toBe('/api/v1/auth/login');

    // Unrelated external URLs are never modified
    const externalUrl = resolveApiUrl('https://api.github.com/users');
    expect(externalUrl).toBe('https://api.github.com/users');
  });

  it('5. Safe API client intercepts empty or malformed server responses without crash', async () => {
    // Mock empty response from an unresponsive backend
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: { get: () => 'text/html' },
      text: async () => '<html><body>502 Bad Gateway</body></html>',
    } as any);

    const result = await safeFetchJson('/api/v1/roadmaps/generate');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(502);
    expect(result.error).toContain('502 Bad Gateway');
    expect(result.data).toBeNull();
  });
});
