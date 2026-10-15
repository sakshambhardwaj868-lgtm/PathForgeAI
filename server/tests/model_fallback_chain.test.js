/**
 * PathForge AI — Multi-Model Fallback Chain & Resilience Test Suite
 *
 * Verifies:
 * 1. Successful primary-model live generation
 * 2. Transient failure retry (HTTP 503) succeeds without dropping to secondary
 * 3. Primary-model quota exhaustion (HTTP 429) fails fast to secondary model
 * 4. Primary-model timeout fails over to secondary model
 * 5. Both models failing engages verified offline fallback
 * 6. Missing API key returns verified offline fallback instantly
 * 7. End-to-end HTTP endpoint returns proper headers (X-Roadmap-Source, X-Roadmap-Model)
 */

const { AiService } = require('../dist/services/aiService');
const { createApp } = require('../dist/app');
const { detectGraphCycles } = require('../dist/schemas/roadmapSchema');
const { env } = require('../dist/config/env');

async function runModelFallbackChainTests() {
  console.log('===============================================================');
  console.log('  PATHFORGE AI — MULTI-MODEL RESILIENCE & FALLBACK TEST SUITE   ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  const originalFetch = globalThis.fetch;
  const originalApiKey = env.GEMINI_API_KEY;
  const originalPrimary = env.GEMINI_MODEL;
  const originalSecondary = env.GEMINI_SECONDARY_MODEL;

  // Valid Gemini response payload fixture
  const sampleGeminiPayload = {
    targetRole: 'Site Reliability Engineer',
    targetCompanyType: 'Cloud Infra SaaS',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 12,
    phases: [
      { id: 'p1', title: 'Linux & Systems Core', description: 'Kernel & systems', order: 1 },
      { id: 'p2', title: 'Observability & SRE', description: 'Production reliability', order: 2 }
    ],
    intermediateRoles: [
      { title: 'Junior SRE', estimatedTimelineMonth: 3, description: 'Basic on-call & metrics' }
    ],
    milestones: [
      {
        id: 'ms-sre-1',
        title: 'Linux Kernel & Process Architecture',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 20,
        prerequisiteIds: [],
        actionableData: {
          whyItMatters: 'Deep understanding of syscalls and resource limits is essential for debugging outages.',
          difficultyLevel: 'Intermediate',
          learningObjectives: ['Understand cgroups and namespaces', 'Analyze /proc file system'],
          learningOutcomes: ['Configure systemd services', 'Troubleshoot OOM kills'],
          topics: [
            { title: 'Virtual Memory & Cgroups', subtopics: ['Page tables', 'Memory pressure'] }
          ],
          lessons: [
            {
              id: 'les-1',
              title: 'Cgroups V2 Hands-on',
              durationMinutes: 45,
              explanation: 'Control groups limit and isolate system resources.',
              studySteps: ['Inspect /sys/fs/cgroup', 'Create test slice', 'Apply memory max'],
              practiceActivity: 'Create a restricted slice that triggers memory throttle',
              completionCriteria: 'Slice enforces memory cap successfully'
            }
          ],
          practicalExercises: [
            {
              id: 'ex-1',
              title: 'Simulate high memory pressure',
              difficulty: 'Intermediate',
              instructions: 'Run stress-ng within restricted cgroup and record kernel events.',
              hints: ['Check dmesg for oom-killer']
            }
          ],
          weekendProject: {
            title: 'Automated Container Resource Enforcer',
            description: 'CLI tool to monitor and dynamically constrain rogue Linux processes.',
            deliverables: ['Go or Python monitor script', 'systemd unit config'],
            estimatedHours: 10,
            tasks: ['Poll /proc stats', 'Enforce cgroup limits', 'Send alert webhook'],
            acceptanceCriteria: ['Constrains CPU usage under 50%', 'Emits JSON log']
          },
          curatedResources: [
            {
              title: 'Linux Kernel Documentation: Cgroups V2',
              type: 'documentation',
              searchQueryOrUrl: 'https://docs.kernel.org/admin-guide/cgroup-v2.html',
              description: 'Official kernel guide on control groups v2'
            }
          ],
          interviewChallenges: [
            {
              question: 'Explain what happens when a Linux process encounters an OOM condition.',
              idealAnswerKey: 'The kernel oom_killer scores processes and sends SIGKILL to the selected PID.',
              difficulty: 'Medium'
            }
          ],
          quizQuestions: [
            {
              question: 'Which file in /proc shows detailed memory statistics?',
              options: ['/proc/cpuinfo', '/proc/meminfo', '/proc/version', '/proc/stat'],
              correctAnswerIndex: 1,
              explanation: '/proc/meminfo provides real-time memory usage breakdown.'
            }
          ],
          completionCriteria: ['Configure cgroup limits', 'Pass knowledge quiz', 'Build monitor CLI']
        }
      },
      {
        id: 'ms-sre-2',
        title: 'SLIs, SLOs & Error Budgets',
        category: 'core-skill',
        phaseId: 'p2',
        estimatedHours: 25,
        prerequisiteIds: ['ms-sre-1'],
        actionableData: {
          whyItMatters: 'Defines actionable service standards to balance feature velocity with reliability.',
          difficultyLevel: 'Intermediate',
          learningObjectives: ['Define 99.9% latency SLOs', 'Calculate burn rates'],
          learningOutcomes: ['Implement Prometheus alert rules', 'Configure Grafana dashboards'],
          topics: [
            { title: 'Reliability Mathematics', subtopics: ['Good events / Valid events', 'Burn rate alerting'] }
          ],
          lessons: [
            {
              id: 'les-2',
              title: 'Multi-Window Multi-Burn-Rate Alerting',
              durationMinutes: 50,
              explanation: 'Google SRE alerting strategy using 1h/6h burn windows.',
              studySteps: ['Review Google SRE Book chapter 5', 'Write PromQL query', 'Test firing alert'],
              practiceActivity: 'Draft PrometheusRule CRD for 2% budget consumption in 1 hour',
              completionCriteria: 'Alert fires under simulated latency spike'
            }
          ],
          practicalExercises: [
            {
              id: 'ex-2',
              title: 'PromQL Error Budget Expression',
              difficulty: 'Intermediate',
              instructions: 'Write expression calculating 30-day rolling availability percentage.',
              hints: ['Use sum(rate(...[30d]))']
            }
          ],
          weekendProject: {
            title: 'Production SLO Dashboard & Burn Alerter',
            description: 'Prometheus + Grafana pipeline monitoring synthetic HTTP traffic.',
            deliverables: ['Prometheus rules file', 'Grafana dashboard JSON'],
            estimatedHours: 12,
            tasks: ['Deploy local Prometheus', 'Generate synthetic latency', 'Verify alert fires'],
            acceptanceCriteria: ['Dashboard displays 30d burn rate', 'Alert triggers at 14.4x rate']
          },
          curatedResources: [
            {
              title: 'Google SRE Book: Service Level Objectives',
              type: 'documentation',
              searchQueryOrUrl: 'https://sre.google/sre-book/service-level-objectives/',
              description: 'Definitive guide on SLO principles'
            }
          ],
          interviewChallenges: [
            {
              question: 'How do you handle feature releases when the error budget is exhausted?',
              idealAnswerKey: 'Halt non-essential deployments and pivot engineering effort to reliability improvements.',
              difficulty: 'Medium'
            }
          ],
          quizQuestions: [
            {
              question: 'What is an SLO?',
              options: ['Service Level Objective', 'System Load Optimal', 'Server Log Output', 'Security Layer Origin'],
              correctAnswerIndex: 0,
              explanation: 'SLO stands for Service Level Objective.'
            }
          ],
          completionCriteria: ['Formulate SLO policy', 'Construct PromQL rules', 'Pass interview challenge']
        }
      },
      {
        id: 'ms-sre-3',
        title: 'Distributed Tracing & Incident Management',
        category: 'capstone',
        phaseId: 'p2',
        estimatedHours: 30,
        prerequisiteIds: ['ms-sre-2'],
        actionableData: {
          whyItMatters: 'Enables rapid root-cause isolation across microservice boundaries.',
          difficultyLevel: 'Advanced',
          learningObjectives: ['Instrument services with OpenTelemetry', 'Lead incident war rooms'],
          learningOutcomes: ['Diagnose tail-latency regressions', 'Write blameless postmortems'],
          topics: [
            { title: 'OpenTelemetry & Context Propagation', subtopics: ['W3C trace context', 'Span exporters'] }
          ],
          lessons: [
            {
              id: 'les-3',
              title: 'End-to-End Tracing Instrumentation',
              durationMinutes: 45,
              explanation: 'Injecting and extracting trace headers across distributed services.',
              studySteps: ['Configure OTel SDK', 'Add span tags', 'Export to Jaeger'],
              practiceActivity: 'Trace HTTP request across 3 microservices',
              completionCriteria: 'Jaeger displays unified trace graph'
            }
          ],
          practicalExercises: [
            {
              id: 'ex-3',
              title: 'Identify N+1 database queries via trace spans',
              difficulty: 'Intermediate',
              instructions: 'Inspect trace waterfall to isolate cascading DB queries.',
              hints: ['Look for sequential short spans targeting database']
            }
          ],
          weekendProject: {
            title: 'Chaos Engineering & Automated Incident Drill',
            description: 'Inject network latency with Chaos Mesh and measure trace response.',
            deliverables: ['Chaos experiment manifest', 'Postmortem report'],
            estimatedHours: 15,
            tasks: ['Deploy microservice demo', 'Inject packet loss', 'Conduct blameless review'],
            acceptanceCriteria: ['Traces accurately pinpoint injected node', 'Postmortem follows Google SRE template']
          },
          curatedResources: [
            {
              title: 'OpenTelemetry Documentation',
              type: 'documentation',
              searchQueryOrUrl: 'https://opentelemetry.io/docs/',
              description: 'Official OpenTelemetry specifications and guides'
            }
          ],
          interviewChallenges: [
            {
              question: 'Explain the difference between head-based and tail-based trace sampling.',
              idealAnswerKey: 'Head-based samples at root ingress; tail-based inspects the full trace before deciding to store.',
              difficulty: 'Hard'
            }
          ],
          quizQuestions: [
            {
              question: 'Which header standard is used for distributed trace context propagation?',
              options: ['W3C traceparent', 'X-Forwarded-For', 'Authorization-Bearer', 'Sec-Fetch-Dest'],
              correctAnswerIndex: 0,
              explanation: 'W3C traceparent is the open standard for trace propagation.'
            }
          ],
          completionCriteria: ['Complete OTel setup', 'Write blameless postmortem', 'Pass knowledge check']
        }
      }
    ]
  };

  function mockGeminiResponse(payload) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            finishReason: 'STOP',
            content: {
              parts: [{ text: JSON.stringify(payload) }]
            }
          }
        ]
      })
    };
  }

  try {
    env.GEMINI_API_KEY = 'mock-test-key-safe';
    env.GEMINI_MODEL = 'gemini-3.8-flash';
    env.GEMINI_SECONDARY_MODEL = 'gemini-flash-lite-latest';

    // -------------------------------------------------------------------------
    // TEST 1: Primary Model Success
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Successful Primary-Model Live Generation ---');
    const calledUrls1 = [];
    globalThis.fetch = async (url) => {
      calledUrls1.push(url);
      return mockGeminiResponse(sampleGeminiPayload);
    };

    const res1 = await AiService.generateRoadmap({
      targetRole: 'Site Reliability Engineer',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
    });

    assert(res1.source === 'live_ai', 'Primary model output has source="live_ai"');
    assert(res1.modelUsed === 'gemini-3.8-flash', 'Primary model output declares modelUsed="gemini-3.8-flash"');
    assert(calledUrls1.length === 1 && calledUrls1[0].includes('gemini-3.8-flash'), 'Invoked primary model URL');
    assert(detectGraphCycles(res1.milestones) === false, 'Graph is 100% acyclic');

    // -------------------------------------------------------------------------
    // TEST 2: Transient 503 on Primary Model -> Retried and Succeeded
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Transient HTTP 503 Retry Succeeded on Same Model ---');
    let attemptCount2 = 0;
    globalThis.fetch = async () => {
      attemptCount2++;
      if (attemptCount2 === 1) {
        return {
          ok: false,
          status: 503,
          text: async () => '{"error": {"code": 503, "message": "High demand spike"}}'
        };
      }
      return mockGeminiResponse(sampleGeminiPayload);
    };

    const res2 = await AiService.generateRoadmap({
      targetRole: 'Site Reliability Engineer',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
    });

    assert(attemptCount2 === 2, 'Transient 503 was retried after backoff');
    assert(res2.source === 'live_ai', 'Succeeded on transient retry with source="live_ai"');
    assert(res2.modelUsed === 'gemini-3.8-flash', 'Model used is primary model');

    // -------------------------------------------------------------------------
    // TEST 3: Primary Model Quota Exhaustion (429) -> Fast-Fail to Secondary Model
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Primary Quota (HTTP 429) Fast-Fails to Secondary Model ---');
    const calledModels3 = [];
    globalThis.fetch = async (url) => {
      if (url.includes('gemini-3.8-flash')) {
        calledModels3.push('gemini-3.8-flash');
        return {
          ok: false,
          status: 429,
          text: async () => '{"error": {"code": 429, "message": "Resource exhausted / daily free tier limit"}}'
        };
      }
      if (url.includes('gemini-flash-lite-latest')) {
        calledModels3.push('gemini-flash-lite-latest');
        return mockGeminiResponse(sampleGeminiPayload);
      }
      return { ok: false, status: 500, text: async () => 'Unexpected model' };
    };

    const res3 = await AiService.generateRoadmap({
      targetRole: 'Site Reliability Engineer',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
    });

    assert(calledModels3.includes('gemini-3.8-flash'), 'Attempted primary model');
    assert(calledModels3.includes('gemini-flash-lite-latest'), 'Seamlessly fell over to secondary model');
    assert(res3.source === 'live_ai', 'Secondary model succeeded with source="live_ai"');
    assert(res3.modelUsed === 'gemini-flash-lite-latest', 'Roadmap metadata declares modelUsed="gemini-flash-lite-latest"');

    // -------------------------------------------------------------------------
    // TEST 4: Primary Model Timeout -> Fast-Fail to Secondary Model
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Primary Model Timeout Fails Over to Secondary Model ---');
    const calledModels4 = [];
    globalThis.fetch = async (url, opts) => {
      if (url.includes('gemini-3.8-flash')) {
        calledModels4.push('gemini-3.8-flash');
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        throw err;
      }
      if (url.includes('gemini-flash-lite-latest')) {
        calledModels4.push('gemini-flash-lite-latest');
        return mockGeminiResponse(sampleGeminiPayload);
      }
      return { ok: false, status: 500, text: async () => 'Error' };
    };

    const res4 = await AiService.generateRoadmap({
      targetRole: 'Site Reliability Engineer',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
    });

    assert(calledModels4.includes('gemini-3.8-flash'), 'Primary model timed out');
    assert(calledModels4.includes('gemini-flash-lite-latest'), 'Secondary model called after primary timeout');
    assert(res4.source === 'live_ai', 'Result is live AI from secondary model');
    assert(res4.modelUsed === 'gemini-flash-lite-latest', 'modelUsed is secondary model');

    // -------------------------------------------------------------------------
    // TEST 5: Both Primary and Secondary Fail -> Verified Offline Fallback
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: All Live Models Fail -> Offline Fallback Engaged ---');
    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 503,
        text: async () => '{"error": {"code": 503, "message": "All servers down"}}'
      };
    };

    const res5 = await AiService.generateRoadmap({
      targetRole: 'Site Reliability Engineer',
      experienceLevel: 'Intermediate',
      weeklyCommitmentHours: 20,
    });

    assert(res5.source === 'cached_fallback', 'Fell back cleanly with source="cached_fallback"');
    assert(res5.milestones.length >= 3, 'Fallback returned structured milestones');
    assert(detectGraphCycles(res5.milestones) === false, 'Fallback graph is acyclic');

    // -------------------------------------------------------------------------
    // TEST 6: Missing GEMINI_API_KEY -> Instant Offline Fallback
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Missing GEMINI_API_KEY Returns Instant Fallback ---');
    env.GEMINI_API_KEY = '';
    let networkAttempted6 = false;
    globalThis.fetch = async () => {
      networkAttempted6 = true;
      return { ok: false, status: 500 };
    };

    const res6 = await AiService.generateRoadmap({
      targetRole: 'Full Stack Engineer',
      experienceLevel: 'Beginner',
      weeklyCommitmentHours: 15,
    });

    assert(networkAttempted6 === false, 'No network requests made when API key is empty');
    assert(res6.source === 'cached_fallback', 'Instantly returns cached_fallback');

    // -------------------------------------------------------------------------
    // TEST 7: HTTP Endpoint Integration Test (Headers & Payload)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: HTTP Endpoint Headers & Payload Verification ---');
    env.GEMINI_API_KEY = 'mock-key';
    env.GEMINI_MODEL = 'gemini-3.8-flash';
    env.GEMINI_SECONDARY_MODEL = 'gemini-flash-lite-latest';

    // Mock fetch so primary fails with 429 and secondary succeeds
    globalThis.fetch = async (url) => {
      if (typeof url === 'string' && url.includes('gemini-3.8-flash')) {
        return { ok: false, status: 429, text: async () => 'Quota exhausted' };
      }
      if (typeof url === 'string' && url.includes('gemini-flash-lite-latest')) {
        return mockGeminiResponse(sampleGeminiPayload);
      }
      // Node native fetch for local express server
      return originalFetch(url);
    };

    const app = createApp();
    const server = app.listen(5099);

    try {
      const endpointRes = await originalFetch('http://localhost:5099/api/v1/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: 'Site Reliability Engineer',
          experienceLevel: 'Intermediate',
          weeklyCommitmentHours: 20,
        }),
      });

      assert(endpointRes.status === 200, 'HTTP endpoint returns status 200');
      assert(endpointRes.headers.get('x-roadmap-source') === 'live_ai', 'Header X-Roadmap-Source is live_ai');
      assert(endpointRes.headers.get('x-roadmap-model') === 'gemini-flash-lite-latest', 'Header X-Roadmap-Model is secondary model');
      
      const endpointBody = await endpointRes.json();
      assert(endpointBody.success === true, 'Response payload has success: true');
      assert(endpointBody.data.modelUsed === 'gemini-flash-lite-latest', 'Payload includes modelUsed metadata');
      assert(endpointBody.data.source === 'live_ai', 'Payload includes source="live_ai"');
    } finally {
      server.close();
    }

  } finally {
    // Restore original environment and global fetch
    globalThis.fetch = originalFetch;
    env.GEMINI_API_KEY = originalApiKey;
    env.GEMINI_MODEL = originalPrimary;
    env.GEMINI_SECONDARY_MODEL = originalSecondary;
  }

  console.log('\n===============================================================');
  console.log(`  MODEL FALLBACK SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
}

runModelFallbackChainTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
