import fs from 'fs';
import path from 'path';
import { validateAndSanitizeRoadmap } from '../schemas/roadmapSchema';

// ============================================================================
// 1. FULL STACK DEVELOPER AT A CLIMATE TECH STARTUP
// ============================================================================
export const climateTechRoadmap = {
  id: 'rf-climate-tech-verified',
  targetRole: 'Full Stack Developer at a Climate Tech Startup',
  targetCompanyType: 'Climate Tech & Green Energy Series-A',
  experienceLevel: 'Beginner',
  weeklyCommitmentHours: 15,
  totalEstimatedWeeks: 24,
  source: 'cached_fallback',
  phases: [
    {
      id: 'phase-1',
      title: 'Phase 1: Foundations & Core Web Engineering',
      description: 'HTML5 semantic layouts, modern CSS systems, ECMAScript event loop runtimes, and collaborative Git workflows.',
      order: 1,
    },
    {
      id: 'phase-2',
      title: 'Phase 2: Client Architecture & Reactive State',
      description: 'Strict TypeScript type contracts, React component composition, custom hooks, and deterministic client-side state.',
      order: 2,
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Backend Services, Telemetry & Data Modeling',
      description: 'Node.js event-driven runtimes, RESTful Express APIs with Zod, PostgreSQL time-series modeling, and real-time WebSockets.',
      order: 3,
    },
    {
      id: 'phase-4',
      title: 'Phase 4: Security, Automated Testing & Climate Capstone',
      description: 'JWT session hardening, end-to-end integration testing, Dockerized container deployment, and a production carbon accounting platform.',
      order: 4,
    },
  ],
  intermediateRoles: [
    {
      title: 'Junior Web Applications Intern',
      estimatedTimelineMonth: 3,
      description: 'Building telemetry ingestion forms, component styling, and internal sensor monitoring dashboards.',
    },
    {
      title: 'Associate Full Stack Engineer',
      estimatedTimelineMonth: 6,
      description: 'Developing real-time streaming WebSocket connectors and maintaining renewable energy microservices.',
    },
  ],
  milestones: [
    {
      id: 'ms-fs-1',
      title: 'Modern Web Architecture & Semantic Layouts',
      category: 'foundation',
      phaseId: 'phase-1',
      estimatedHours: 25,
      prerequisiteIds: [],
      status: 'available',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Clean HTML semantics and responsive CSS grid architectures are fundamental for building accessible, high-performance clean energy dashboards that function across mobile sensors and operations control centers.',
        difficultyLevel: 'Beginner',
        learningObjectives: [
          'Structure accessible, semantic document trees using HTML5 landmarks.',
          'Build responsive layout systems using modern CSS Flexbox and Grid.',
          'Optimize Core Web Vitals and visual performance on low-bandwidth networks.',
        ],
        learningOutcomes: [
          'Design accessible web layouts complying with modern semantic standards.',
          'Implement fluid responsive interfaces using CSS Grid and container queries.',
          'Diagnose layout shifts and render blocking resources using browser DevTools.',
        ],
        topics: [
          {
            title: 'HTML5 Semantics & Document Structure',
            subtopics: ['Semantic landmarks (<main>, <nav>, <section>)', 'Forms, accessible inputs & validation', 'Document object tree accessibility attributes'],
          },
          {
            title: 'Modern CSS Layout Engines',
            subtopics: ['Flexbox alignment & distribution', 'CSS Grid 2D layout systems', 'Responsive media queries & container queries', 'CSS custom properties & themes'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs1-1',
            title: 'Semantic Document Trees & Accessible Controls',
            durationMinutes: 45,
            explanation: 'Semantic HTML provides assistive technologies and browser rendering engines with structural context. Using explicit landmarks ensures screen readers can navigate complex multi-metric dashboards efficiently.',
            studySteps: [
              'Review HTML5 semantic landmark elements and their ARIA mappings.',
              'Implement accessible form inputs with explicit label associations and input constraints.',
              'Audit DOM depth and remove redundant container wrappers.',
            ],
            practiceActivity: 'Construct a semantic operational dashboard layout containing header, sidebar navigation, main sensor telemetry grid, and status drawer with zero div tags for landmarks.',
            completionCriteria: 'W3C markup validation passes with zero errors and accessibility tree displays valid role landmarks.',
          },
          {
            id: 'lesson-fs1-2',
            title: 'Responsive Grid & Flexbox Systems',
            durationMinutes: 60,
            explanation: 'Modern clean-tech dashboards must adapt between control-room 4K displays and field technician smartphones. CSS Grid handles two-dimensional dashboard tile distribution while Flexbox governs one-dimensional toolbar controls.',
            studySteps: [
              'Build a 12-column responsive dashboard grid with auto-fit and minmax().',
              'Implement a responsive navigation toolbar using Flexbox justify-content and align-items.',
              'Apply CSS custom properties to manage consistent spacing scales and palette tokens.',
            ],
            practiceActivity: 'Build a responsive power generation metric panel that transitions from a 4-column layout on desktop to a stacked single-column card view on mobile without horizontal scroll.',
            completionCriteria: 'Layout smoothly reflows across 360px, 768px, and 1440px viewports with zero horizontal overflow.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs1-1',
            title: 'Solar Inverter Status Card',
            difficulty: 'Beginner',
            instructions: 'Create an accessible solar inverter status card showing current wattage, operating temperature, and status badge using semantic HTML5 and CSS Flexbox.',
            hints: ['Use <article> for the card and <dl> / <dt> / <dd> for key-value telemetry pairs.', 'Use CSS custom properties for temperature color thresholds.'],
            solutionOverview: 'Define semantic description lists for metrics and color-code badges with CSS variables based on status.',
          },
        ],
        weekendProject: {
          title: 'Renewable Generation Overview Dashboard Shell',
          description: 'Build a responsive, semantic static dashboard shell for a regional clean energy grid featuring power generation cards, battery storage gauges, and alert banners.',
          deliverables: [
            'Semantic HTML5 structure adhering to W3C standards',
            'Responsive CSS stylesheet with fluid grid and dark theme variables',
            'Cross-browser tested across mobile and desktop viewport profiles',
          ],
          estimatedHours: 10,
          tasks: [
            'Create base HTML document with semantic landmarks and metadata',
            'Implement CSS reset and typography/spacing token variables',
            'Build 3-column energy source summary grid using CSS Grid',
            'Add alert banner component using accessible ARIA live regions',
            'Validate responsive reflow at 375px, 768px, and 1280px breakpoints',
          ],
          acceptanceCriteria: [
            'Lighthouse Accessibility score is 95+',
            'Zero layout shift (CLS < 0.05) during viewport resizing',
            'All interactive buttons have clear keyboard focus outlines',
          ],
        },
        curatedResources: [
          {
            title: 'MDN Web Docs: HTML Elements Reference',
            type: 'documentation',
            searchQueryOrUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
            description: 'Comprehensive official guide to standard HTML elements and attributes.',
          },
          {
            title: 'GitHub: Accessible UI Components & Patterns',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Aweb-components+topic%3Aaccessibility',
            description: 'Open source implementations of accessible web interface primitives.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Why is using semantic elements like <article> and <section> preferred over <div> with class names?',
            idealAnswerKey: 'Semantic elements provide innate accessibility semantics to the browser accessibility tree, improve SEO ranking, and allow assistive technologies to provide landmark keyboard navigation without manual ARIA configuration.',
            difficulty: 'Easy',
            explanation: 'Screen readers rely on standard landmark roles to let visually impaired users jump directly to relevant dashboard sections.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which CSS Grid property creates a fluid grid that automatically wraps tiles without explicit media queries?',
            options: [
              'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))',
              'grid-template-columns: auto auto auto',
              'display: flex; flex-wrap: nowrap',
              'grid-auto-flow: column',
            ],
            correctAnswerIndex: 0,
            explanation: 'repeat(auto-fit, minmax(...)) dynamically fills available row space with columns down to the minimum 250px threshold before wrapping.',
          },
        ],
        completionCriteria: [
          'Construct semantic HTML document with verified W3C passing score',
          'Implement responsive CSS grid layout tested on multiple screen sizes',
          'Pass the knowledge-check quiz with 100% accuracy',
        ],
      },
    },
    {
      id: 'ms-fs-2',
      title: 'ECMAScript Runtimes & Asynchronous JavaScript',
      category: 'foundation',
      phaseId: 'phase-1',
      estimatedHours: 30,
      prerequisiteIds: ['ms-fs-1'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Asynchronous event handling, Promises, and non-blocking I/O are the core engine of real-time clean tech web apps that handle incoming telemetry from thousands of remote smart meters without freezing the user interface.',
        difficultyLevel: 'Beginner',
        learningObjectives: [
          'Master JavaScript event loop phases, microtasks, and macrotasks.',
          'Execute non-blocking async operations using Promises and async/await.',
          'Handle memory leaks and event listener cleanups in high-frequency event applications.',
        ],
        learningOutcomes: [
          'Write resilient asynchronous JavaScript using try/catch/finally and Promise.allSettled.',
          'Diagnose and prevent thread blocking on high-frequency data streams.',
          'Implement functional transformations on telemetry arrays using map, filter, reduce.',
        ],
        topics: [
          {
            title: 'Modern JavaScript (ES6+) Syntax & Concepts',
            subtopics: ['Destructuring & spread operators', 'Closures & lexical scope', 'Arrow functions & this binding', 'ES modules (import/export)'],
          },
          {
            title: 'Asynchronous Concurrency & Event Loop',
            subtopics: ['Call stack vs Task Queue vs Microtask Queue', 'Promise lifecycle & chaining', 'Async/await syntax & error recovery', 'AbortController for network cancellation'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs2-1',
            title: 'The JavaScript Event Loop & Concurrency Model',
            durationMinutes: 50,
            explanation: 'JavaScript is single-threaded. Understanding how synchronous execution on the call stack interacts with the microtask queue (Promise callbacks) and macrotask queue (timers, I/O) is essential to avoid UI freezes.',
            studySteps: [
              'Trace call stack execution order with synchronous logs, setTimeout, and resolved Promises.',
              'Examine how long-running computations block the rendering engine thread.',
              'Use requestAnimationFrame and web workers for heavy computations.',
            ],
            practiceActivity: 'Write an asynchronous simulator that processes a stream of 10,000 sensor readings without freezing a CSS spinner animation running on the page.',
            completionCriteria: 'Event loop execution order code snippet correctly identifies execution sequence for mixed macro/micro tasks.',
          },
          {
            id: 'lesson-fs2-2',
            title: 'Promises, Async/Await & Robust Error Handling',
            durationMinutes: 55,
            explanation: 'Real network telemetry streams can experience packet drops, rate limits, and timeouts. Robust async functions utilize AbortController and Promise.allSettled to ensure that one failing device call does not crash the entire monitor.',
            studySteps: [
              'Build an async function that fetches telemetry with an AbortSignal timeout after 3 seconds.',
              'Implement parallel request coordination with Promise.allSettled and aggregate error logging.',
              'Refactor nested promise chains into clean async/await blocks with centralized try/catch.',
            ],
            practiceActivity: 'Build a telemetry fetcher that requests data from 5 independent grid endpoints simultaneously, reports successful responses, and recovers gracefully from individual endpoint 500 errors.',
            completionCriteria: 'Fetcher executes concurrently, handles timeouts cleanly via AbortSignal, and returns normalized error objects.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs2-1',
            title: 'Smart Meter Exponential Backoff Poller',
            difficulty: 'Intermediate',
            instructions: 'Write a JavaScript retry function that polls an unstable sensor endpoint with exponential backoff and jitter, stopping after 4 failed attempts.',
            hints: ['Calculate delay as baseDelay * 2^attempt + Math.random() * jitter.', 'Use async/await with a sleep helper.'],
            solutionOverview: 'Loop up to maxRetries, catch network exceptions, wait for calculated backoff duration, and re-attempt before finally throwing.',
          },
        ],
        weekendProject: {
          title: 'Live Grid Telemetry Poller & Event Stream Aggregator',
          description: 'Construct a standalone JavaScript module that polls multiple simulated clean energy endpoints, aggregates wattage totals, computes rolling averages, and handles network timeouts.',
          deliverables: [
            'Module with ES6 export interface and comprehensive error boundaries',
            'Async polling engine with AbortController timeout handling',
            'Interactive HTML test harness demonstrating live rolling data aggregation',
          ],
          estimatedHours: 12,
          tasks: [
            'Create mock sensor endpoints returning delayed JSON responses',
            'Implement poller class managing active subscriptions and polling intervals',
            'Add AbortController support to cancel pending requests on teardown',
            'Implement rolling average calculation across the last 60 seconds of readings',
            'Create browser test harness demonstrating live updates',
          ],
          acceptanceCriteria: [
            'Zero uncaught Promise rejection errors in console',
            'Correctly handles endpoint 503 errors with automated retry',
            'Memory usage remains flat over 10 minutes of continuous polling',
          ],
        },
        curatedResources: [
          {
            title: 'MDN: Concurrency model and the event loop',
            type: 'documentation',
            searchQueryOrUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
            description: 'Comprehensive guide to execution contexts, message queue, and run-to-completion semantics.',
          },
          {
            title: 'GitHub: JavaScript Algorithms & Data Structures',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Ajavascript+topic%3Aalgorithms',
            description: 'Open source reference implementations of data processing algorithms.',
          },
        ],
        interviewChallenges: [
          {
            question: 'What is the key difference between Promise.all() and Promise.allSettled() when querying microservices?',
            idealAnswerKey: 'Promise.all rejects immediately upon the first rejected promise, abandoning remaining results. Promise.allSettled waits for all promises to settle regardless of outcome, returning status objects for each, which prevents one failing microservice from dropping telemetry from healthy services.',
            difficulty: 'Medium',
            explanation: 'In microservice architectures, partial failure resilience requires collecting all available data rather than failing completely.',
          },
        ],
        quizQuestions: [
          {
            question: 'What happens when a synchronous long-running while loop executes on the main thread in a browser?',
            options: [
              'The browser freezes and cannot handle user clicks, animations, or render updates.',
              'The engine automatically shifts the loop to a background worker thread.',
              'Microtasks run concurrently in parallel with the while loop.',
              'The DOM updates synchronously during every iteration of the loop.',
            ],
            correctAnswerIndex: 0,
            explanation: 'The main thread has a single call stack; a blocking loop monopolizes execution and prevents the event loop from running the render phase.',
          },
        ],
        completionCriteria: [
          'Successfully write and execute asynchronous code with AbortSignal cancellation',
          'Explain event loop execution order for microtasks vs macrotasks',
          'Pass the practical exercise with exponential backoff retry logic',
        ],
      },
    },
    {
      id: 'ms-fs-3',
      title: 'Git Version Control & Team Collaboration',
      category: 'tooling',
      phaseId: 'phase-1',
      estimatedHours: 20,
      prerequisiteIds: ['ms-fs-1'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Professional clean tech engineering teams deploy continuous updates to mission-critical infrastructure. Mastery of Git branches, atomic commits, and pull request reviews is mandatory for defect-free software shipping.',
        difficultyLevel: 'Beginner',
        learningObjectives: [
          'Execute trunk-based and feature-branch Git workflows.',
          'Resolve merge conflicts cleanly using Git diff and rebase.',
          'Author meaningful conventional commits and participate in peer code reviews.',
        ],
        learningOutcomes: [
          'Manage complex branches, rebasing, and interactive commit squashing.',
          'Identify and resolve merge conflicts in multi-developer codebases.',
          'Configure Git hooks with husky and lint-staged for automated quality checks.',
        ],
        topics: [
          {
            title: 'Git Core Plumbing & Everyday Porcelain',
            subtopics: ['Working tree vs staging index vs repository commits', 'Branching, switching, and detached HEAD state', 'Git diff, log, and blame analysis'],
          },
          {
            title: 'Collaboration & Team Workflows',
            subtopics: ['Rebase vs merge strategies', 'Conventional Commits specification', 'Pull request reviews and conflict resolution', 'Tagging releases and semantic versioning'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs3-1',
            title: 'Git Branching Strategies & Conflict Resolution',
            durationMinutes: 45,
            explanation: 'In fast-paced startup teams, trunk-based development with short-lived feature branches prevents merge debt. When two engineers touch the same telemetry model, resolving merge conflicts requires careful inspection of intent.',
            studySteps: [
              'Create feature branches from main and commit independent changes.',
              'Simulate a conflicting merge by modifying the same line across two branches.',
              'Resolve conflict markers (<<<<<<< HEAD) and commit the reconciled merge.',
            ],
            practiceActivity: 'Create two branches that edit the same configuration file, trigger a merge conflict, and resolve it using interactive git rebase.',
            completionCriteria: 'Conflict is resolved cleanly with linear git history verified via git log --oneline --graph.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs3-1',
            title: 'Interactive Rebase & Commit Tidying',
            difficulty: 'Beginner',
            instructions: 'Create a repository with 4 messy commits ("fix", "wip", "update"). Use git rebase -i HEAD~4 to squash them into 2 clean conventional commits.',
            hints: ['Use the squash or fixup command in the interactive rebase editor.'],
            solutionOverview: 'Rebase interactively, combine related WIP commits into feat: and test: commits.',
          },
        ],
        weekendProject: {
          title: 'Automated Clean Tech Repository Workflow Template',
          description: 'Configure an open-source template repository featuring GitHub branch protection rules, pull request templates, and automated pre-commit linting hooks.',
          deliverables: [
            'GitHub repository with configured .github/PULL_REQUEST_TEMPLATE.md',
            'Pre-commit hooks enforcing conventional commit messages',
            'README documentation detailing team branching protocol',
          ],
          estimatedHours: 8,
          tasks: [
            'Initialize git repository and author clear .gitignore file',
            'Configure pull request template with testing verification checklist',
            'Set up pre-commit hook checking commit message format',
            'Simulate team pull request review workflow with branch protections',
          ],
          acceptanceCriteria: [
            'Commit messages not following Conventional Commits format are blocked by hook',
            'Branch protection prevents direct pushes to main branch',
          ],
        },
        curatedResources: [
          {
            title: 'Pro Git Book (Official Documentation)',
            type: 'documentation',
            searchQueryOrUrl: 'https://git-scm.com/book/en/v2',
            description: 'The definitive open source guide to Git version control architecture.',
          },
          {
            title: 'GitHub: Conventional Commits Specification',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.conventionalcommits.org/en/v1.0.0/',
            description: 'Standardized specification for adding human and machine meaning to commit messages.',
          },
        ],
        interviewChallenges: [
          {
            question: 'What is the fundamental difference between git merge and git rebase when incorporating upstream changes?',
            idealAnswerKey: 'git merge creates a new merge commit combining two histories, preserving exact chronological order and branch topology. git rebase replays your branch commits on top of the target branch tip, creating new commit hashes and producing a clean, linear project history.',
            difficulty: 'Medium',
            explanation: 'Rebasing maintains readable linear histories, but should never be performed on shared public branches.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which Git command stages only specific modified chunks of a file interactively rather than the entire file?',
            options: ['git add -p', 'git commit -a', 'git stage --all', 'git checkout -b'],
            correctAnswerIndex: 0,
            explanation: 'git add -p (patch mode) prompts the user to review and stage individual code hunks selectively.',
          },
        ],
        completionCriteria: [
          'Execute interactive git rebase squashing multiple commits into clean commits',
          'Successfully resolve merge conflicts without losing upstream modifications',
        ],
      },
    },
    {
      id: 'ms-fs-4',
      title: 'Strict TypeScript & Type-Safe System Design',
      category: 'foundation',
      phaseId: 'phase-2',
      estimatedHours: 35,
      prerequisiteIds: ['ms-fs-2'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Grid telemetric calculations and carbon compliance data cannot tolerate runtime NaN or undefined errors. Strict TypeScript ensures compile-time contract safety across client and server tiers.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Configure strict tsconfig settings with noImplicitAny and strictNullChecks.',
          'Model domain entities using discriminated unions and type narrowing.',
          'Write reusable type utilities using generics, conditional types, and keyof.',
        ],
        learningOutcomes: [
          'Construct bulletproof domain models for complex real-world renewable energy entities.',
          'Implement exhaustiveness checking using TypeScript never type in switch statements.',
          'Define generic API contract interfaces shared across frontend and backend boundaries.',
        ],
        topics: [
          {
            title: 'TypeScript Core & Strict Configurations',
            subtopics: ['Primitive types & union types', 'Interfaces vs Type aliases', 'Strict compiler flags and options', 'Type assertions vs type annotations'],
          },
          {
            title: 'Advanced Type Engineering',
            subtopics: ['Discriminated unions & exhaustive switch checks', 'Generic functions and interfaces', 'Utility types (Partial, Pick, Omit, Record)', 'Template literal types and conditional types'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs4-1',
            title: 'Discriminated Unions & Exhaustiveness Checking',
            durationMinutes: 50,
            explanation: 'Clean energy assets come in distinct variants (solar panel, wind turbine, battery storage) with differing metrics. Discriminated unions allow TypeScript to narrow properties safely based on a common discriminant tag.',
            studySteps: [
              'Define a discriminated union type for RenewableAsset with kind: "solar" | "wind" | "battery".',
              'Write a calculation function that narrows types using switch (asset.kind).',
              'Implement an assertNever helper to enforce compile-time exhaustiveness checking.',
            ],
            practiceActivity: 'Create an asset telemetry processing function where forgetting to handle the "battery" kind causes a compiler error.',
            completionCriteria: 'Adding a new variant to the union causes a TypeScript compilation error until handled in all consumers.',
          },
          {
            id: 'lesson-fs4-2',
            title: 'Generics & Type-Safe API Contracts',
            durationMinutes: 55,
            explanation: 'Building reusable data access layers requires generic type parameters that preserve response shapes without resorting to the any escape hatch.',
            studySteps: [
              'Write a generic ApiResponse<T> interface supporting data, error, and metadata.',
              'Implement a generic fetchWrapper<T>(url: string): Promise<ApiResponse<T>>.',
              'Use keyof and Record to build a generic telemetry metric accumulator.',
            ],
            practiceActivity: 'Implement a type-safe telemetry cache class that stores metrics by asset ID with full autocomplete support.',
            completionCriteria: 'TypeScript compiler confirms zero use of any, unknown, or unsafe type casts in the cache implementation.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs4-1',
            title: 'Type-Safe Renewable Metric Transformer',
            difficulty: 'Intermediate',
            instructions: 'Write a generic transformMetrics function that accepts an array of raw sensor records and transforms values using keyof constraints without losing type safety.',
            hints: ['Use <T, K extends keyof T> to constrain key parameters.'],
            solutionOverview: 'Constrain property keys with extends keyof T to guarantee that only existing telemetry attributes can be transformed.',
          },
        ],
        weekendProject: {
          title: 'Shared TypeScript Clean Energy Domain Type Library',
          description: 'Build a standalone type-safe domain package containing models for GridMeter, BatteryState, CarbonEmissionRecord, and generic API response envelopes.',
          deliverables: [
            'Strict TypeScript package with zero compiler warnings in strict mode',
            'Full suite of unit type tests using vitest or tsd verifying type narrowing',
            'Compiled .d.ts declarations ready for shared import by client and server',
          ],
          estimatedHours: 14,
          tasks: [
            'Configure tsconfig.json with strict: true and noUncheckedIndexedAccess: true',
            'Define domain models with discriminated unions for all energy asset classes',
            'Create reusable generic pagination and API response envelopes',
            'Write type-level tests verifying exhaustiveness and compile error triggers',
          ],
          acceptanceCriteria: [
            'Zero any types in repository',
            'Compiler passes cleanly with tsc --noEmit',
            'Type narrowing verifies correct property access for all union variants',
          ],
        },
        curatedResources: [
          {
            title: 'TypeScript Official Handbook: Narrowing & Unions',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
            description: 'Official guide to control flow analysis, type guards, and discriminated unions.',
          },
          {
            title: 'GitHub: TypeScript Utility Types and Patterns',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Atypescript+topic%3Atypes',
            description: 'Production type utility patterns and open-source references.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How does TypeScript’s "never" type enable compile-time exhaustiveness checking in union evaluations?',
            idealAnswerKey: 'When narrowing a discriminated union inside a switch statement, if all cases have been handled, the variable in the default case has the type "never". If an unhandled case remains, assigning it to a parameter of type "never" produces a compile-time error, alerting the developer.',
            difficulty: 'Hard',
            explanation: 'This design pattern makes adding new variants safe by turning runtime omissions into compiler failures.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the key difference between the "unknown" type and the "any" type in TypeScript?',
            options: [
              '"unknown" is type-safe: you cannot invoke methods or read properties on it without first narrowing the type.',
              '"unknown" allows any operation without type checking just like "any".',
              '"unknown" can only hold null or undefined values.',
              '"any" triggers strict compiler warnings whereas "unknown" disables the compiler.',
            ],
            correctAnswerIndex: 0,
            explanation: '"unknown" represents any value but enforces type narrowing or type assertions before any operation can be performed on it.',
          },
        ],
        completionCriteria: [
          'Author strict TypeScript project with zero errors and noImplicitAny active',
          'Implement exhaustive switch statement with compile-time never assertion',
        ],
      },
    },
    {
      id: 'ms-fs-5',
      title: 'React Component Architecture & State Management',
      category: 'core-skill',
      phaseId: 'phase-2',
      estimatedHours: 35,
      prerequisiteIds: ['ms-fs-4'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'React is the standard client library for dynamic web applications. Structuring reusable components, custom hooks, and performant state updates is required to visualize fast-changing energy grid metrics smoothly.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Design pure, declarative UI components using React 18+ and TypeScript.',
          'Manage local and shared state using useState, useReducer, and custom hooks.',
          'Optimize render cycles with memoization, useMemo, and useCallback where necessary.',
        ],
        learningOutcomes: [
          'Compose complex modular dashboard views from small reusable component primitives.',
          'Encapsulate data fetching and websocket lifecycle inside custom React hooks.',
          'Prevent unnecessary re-renders in high-frequency live updating telemetry lists.',
        ],
        topics: [
          {
            title: 'React Fundamentals & Component Architecture',
            subtopics: ['JSX & virtual DOM reconciliation', 'Component lifecycle & useEffect dependencies', 'Props interfaces & component composition', 'Forms & controlled components'],
          },
          {
            title: 'State & Custom Hooks Engineering',
            subtopics: ['useState & useReducer for complex state machines', 'Custom hooks for data synchronization', 'React Context vs Zustand for global state', 'Performance profiling with React DevTools'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs5-1',
            title: 'Component Composition & Custom Hook Lifecycles',
            durationMinutes: 55,
            explanation: 'Modern React separates visual rendering from business logic. Custom hooks encapsulate asynchronous operations (like polling energy data) and expose clean, reactive state objects to presentational components.',
            studySteps: [
              'Build a presentational MetricCard component taking typed props.',
              'Implement a custom hook useGridTelemetry(gridId) managing loading, data, and error states.',
              'Ensure useEffect cleans up timers and aborts in-flight network requests on unmount.',
            ],
            practiceActivity: 'Build a useTelemetryStream hook that connects to a mock data feed, updates state every second, and cleanly unsubscribes when the component unmounts.',
            completionCriteria: 'React DevTools confirms zero memory leaks or ghost intervals running after unmount.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs5-1',
            title: 'Energy Production Filter Bar Component',
            difficulty: 'Intermediate',
            instructions: 'Create a compound filter bar component that allows users to toggle visible energy types (Solar, Wind, Hydro, Grid) and triggers parent state updates with strict TypeScript event typing.',
            hints: ['Use useReducer to manage the multi-select filter toggle state.'],
            solutionOverview: 'Maintain set of active filter keys in reducer state and emit change callbacks to parent.',
          },
        ],
        weekendProject: {
          title: 'Interactive Clean Energy Telemetry Dashboard UI',
          description: 'Construct a full React application displaying clean energy assets, real-time power generation counters, filterable status cards, and interactive milestone drawers.',
          deliverables: [
            'Vite + React + TypeScript project with modular component tree',
            'Custom hooks managing data polling and error recovery',
            'Full responsive dark theme matching enterprise clean tech design systems',
          ],
          estimatedHours: 16,
          tasks: [
            'Scaffold Vite React project with strict TypeScript settings',
            'Implement design token classes and Card / Badge / Button UI primitives',
            'Build custom useEnergyGrid hook simulating live power generation',
            'Create interactive modal and detail drawer components with escape key handling',
          ],
          acceptanceCriteria: [
            'All components typed with React.FC or explicit prop interfaces',
            'Zero React key warnings in console',
            'Proper cleanup of subscriptions on route changes or unmounts',
          ],
        },
        curatedResources: [
          {
            title: 'React Official Documentation: Hooks & Lifecycle',
            type: 'documentation',
            searchQueryOrUrl: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
            description: 'Official comprehensive guide to custom hook patterns and state management.',
          },
          {
            title: 'GitHub: Production React Application Boilerplates',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Areact+topic%3Atypescript+topic%3Adashboard',
            description: 'Open source clean dashboard architectures and patterns.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Why is it critical to correctly declare all variables used inside useEffect in its dependency array?',
            idealAnswerKey: 'Omitting dependencies causes the effect closure to capture stale state or props from earlier renders, leading to subtle bugs. Correctly specifying dependencies ensures the effect runs when dependencies change, and if an effect runs too often, logic should be refactored with reducers or functional state updates rather than lying to the dependency array.',
            difficulty: 'Medium',
            explanation: 'The React linter enforces exhaustive dependencies to prevent stale closure bugs.',
          },
        ],
        quizQuestions: [
          {
            question: 'When should useReducer be preferred over useState in a React component?',
            options: [
              'When the next state depends on complex calculations, multiple sub-values, or previous state transitions.',
              'When you want the component to bypass virtual DOM reconciliation.',
              'When the component only needs to toggle a single boolean flag.',
              'When you need to store data persistently in localStorage automatically.',
            ],
            correctAnswerIndex: 0,
            explanation: 'useReducer centralizes complex state transitions into a deterministic, testable pure function.',
          },
        ],
        completionCriteria: [
          'Build and mount interactive React dashboard application using custom hooks',
          'Demonstrate proper cleanup of asynchronous timers and event subscriptions',
        ],
      },
    },
    {
      id: 'ms-fs-6',
      title: 'Node.js Asynchronous Runtimes & Streaming I/O',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 35,
      prerequisiteIds: ['ms-fs-4'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Backend climate data services must ingest continuous streams of smart meter payloads without running out of memory. Mastering Node.js streams, buffers, and the libuv event loop ensures high-throughput backend performance.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Understand Node.js architecture: V8 engine, libuv event loop, and thread pool.',
          'Process high-volume data streams with Readable, Writable, and Transform streams.',
          'Prevent event loop starvation by offloading or batching heavy computing tasks.',
        ],
        learningOutcomes: [
          'Build streaming data ingestion pipelines handling files larger than available RAM.',
          'Manage backpressure properly using stream.pipeline and async generators.',
          'Diagnose CPU-bound vs I/O-bound bottlenecks in Node.js backend services.',
        ],
        topics: [
          {
            title: 'Node.js Core Architecture & Libuv',
            subtopics: ['Event loop phases (timers, pending callbacks, poll, check)', 'Process global, process.nextTick vs setImmediate', 'Thread pool configuration (UV_THREADPOOL_SIZE)', 'Buffer allocation and memory limits'],
          },
          {
            title: 'Streams & High-Concurrency I/O',
            subtopics: ['Readable, Writable, Duplex & Transform streams', 'Handling stream backpressure with pipe & pipeline', 'Async generators for streaming JSON processing', 'Child processes & worker threads for intensive calculations'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs6-1',
            title: 'Node.js Event Loop & Non-Blocking Design',
            durationMinutes: 50,
            explanation: 'Node.js executes JavaScript on a single thread backed by libuv multi-threaded asynchronous I/O. Blocking the main thread with heavy synchronous JSON.parse operations starves network sockets.',
            studySteps: [
              'Review the 6 phases of the libuv event loop and queue priorities.',
              'Demonstrate how long synchronous loops block incoming HTTP request handling.',
              'Use setImmediate to yield control back to the event loop between batch processing chunks.',
            ],
            practiceActivity: 'Create an event loop latency monitor that measures lag every 100ms and reports when CPU operations exceed 20ms of thread time.',
            completionCriteria: 'Latency monitor accurately detects artificially injected synchronous work and reports metrics.',
          },
          {
            id: 'lesson-fs6-2',
            title: 'Streaming Data Pipelines & Backpressure',
            durationMinutes: 60,
            explanation: 'When reading millions of smart meter records from disk or network, buffering all data into memory causes Out Of Memory (OOM) crashes. Streams process data chunk by chunk with automatic backpressure.',
            studySteps: [
              'Create a Transform stream that parses raw CSV sensor chunks into structured JSON.',
              'Implement stream.pipeline to handle errors and stream teardown safely.',
              'Verify memory consumption remains constant while processing a 500MB sample dataset.',
            ],
            practiceActivity: 'Build a streaming CSV-to-JSON transformer pipeline that processes a simulated 100,000-line sensor telemetry log in under 50MB of RAM.',
            completionCriteria: 'Process memory RSS stays below 60MB throughout entire streaming transformation.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs6-1',
            title: 'Telemetry Transform Stream Filter',
            difficulty: 'Intermediate',
            instructions: 'Write a custom Node.js Transform stream in TypeScript that filters out corrupted sensor packets with invalid checksums and emits only clean readings.',
            hints: ['Extend Transform from stream and implement the _transform method.'],
            solutionOverview: 'Parse chunk buffer, validate packet checksum, call this.push() for valid packets and callback() to continue.',
          },
        ],
        weekendProject: {
          title: 'High-Throughput Smart Meter Telemetry Ingestion Pipeline',
          description: 'Construct a Node.js CLI utility and streaming server capable of ingesting simulated gigabyte-scale telemetry files, validating packet structures, and calculating hourly energy sums.',
          deliverables: [
            'Node.js TypeScript CLI tool taking input stream files and writing aggregated outputs',
            'Automated memory benchmarking script demonstrating constant RAM utilization',
            'Full unit test suite verifying pipeline error recovery and teardown',
          ],
          estimatedHours: 14,
          tasks: [
            'Scaffold Node.js TypeScript project with stream processing utilities',
            'Implement custom Transform stream computing rolling generation totals',
            'Assemble ingestion pipeline with stream.pipeline and error handling',
            'Benchmark memory usage with process.memoryUsage() before and during streaming',
          ],
          acceptanceCriteria: [
            'Memory RSS does not exceed 80MB when processing 1GB simulated stream',
            'All stream errors cleanly handled with zero unhandled exceptions',
          ],
        },
        curatedResources: [
          {
            title: 'Node.js Official Documentation: Stream API',
            type: 'documentation',
            searchQueryOrUrl: 'https://nodejs.org/api/stream.html',
            description: 'Comprehensive technical specification of Node.js stream interfaces and backpressure.',
          },
          {
            title: 'GitHub: Node.js High-Throughput Stream Architectures',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Anodejs+topic%3Astreams+language%3Atypescript',
            description: 'Open source streaming data pipeline implementations.',
          },
        ],
        interviewChallenges: [
          {
            question: 'What is backpressure in streaming systems and how does Node.js handle it?',
            idealAnswerKey: 'Backpressure occurs when the data consumer cannot process chunks as fast as the data producer is emitting them. If unhandled, chunks buffer in memory until the process crashes. In Node.js, stream.pipe and stream.pipeline pause the readable stream when the writable stream buffer fills, resuming it only when the "drain" event fires.',
            difficulty: 'Hard',
            explanation: 'Backpressure control is vital for writing resilient network services that do not exhaust system memory.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which method should be used to chain streams together safely with automatic error handling and cleanup?',
            options: ['stream.pipeline()', 'readable.pipe()', 'readable.on("data")', 'process.nextTick()'],
            correctAnswerIndex: 0,
            explanation: 'stream.pipeline() properly forwards errors and closes all streams if any stream in the pipeline fails or closes prematurely.',
          },
        ],
        completionCriteria: [
          'Implement custom Node.js Transform stream with backpressure handling',
          'Process large stream file with verifiable flat memory usage profile',
        ],
      },
    },
    {
      id: 'ms-fs-7',
      title: 'RESTful API Engineering & Zod Request Validation',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 30,
      prerequisiteIds: ['ms-fs-6'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Web APIs are the communication bridge between client dashboards, mobile field apps, and backend data services. Designing standardized HTTP status codes, structured JSON error contracts, and rigorous runtime validation with Zod prevents data corruption.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Design RESTful HTTP endpoints conforming to standard verbs and status codes.',
          'Validate all incoming request bodies, query params, and headers using Zod.',
          'Implement centralized Express error-handling middleware with structured error responses.',
        ],
        learningOutcomes: [
          'Build modular Express routers with clean separation of concerns (controller, service, schema).',
          'Enforce strict runtime data validation with Zod schemas and automatic TypeScript inference.',
          'Structure consistent JSON response envelopes: { success, data, error, details }.',
        ],
        topics: [
          {
            title: 'REST API Architectural Patterns',
            subtopics: ['HTTP methods (GET, POST, PUT, PATCH, DELETE) & idempotency', 'HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)', 'Resource naming, filtering, pagination, and sorting conventions', 'CORS, helmet security headers, and body parser middleware'],
          },
          {
            title: 'Zod Validation & Error Handling',
            subtopics: ['Zod schema primitives and object validation', 'Type inference with z.infer<typeof schema>', 'Express middleware for safe request validation', 'Centralized error handler mapping Zod errors to HTTP 400'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs7-1',
            title: 'Express Route Modularization & Middleware Chains',
            durationMinutes: 50,
            explanation: 'Production backend architectures avoid massive monolithic route files. Organizing code into layered controllers, validation middleware, and service classes keeps endpoints maintainable and testable.',
            studySteps: [
              'Build an Express app with helmet, cors, and json parsing middleware.',
              'Create a modular router mounted under /api/v1/telemetry.',
              'Write custom request logging middleware recording execution time and status code.',
            ],
            practiceActivity: 'Build an Express router for clean energy assets with GET, POST, and PATCH endpoints with proper status code returns.',
            completionCriteria: 'All routes return appropriate HTTP status codes (201 on create, 200 on update, 404 on missing entity).',
          },
          {
            id: 'lesson-fs7-2',
            title: 'Zod Request Validation & Structured Error Responses',
            durationMinutes: 55,
            explanation: 'Never trust user input. Zod validates request bodies at the system perimeter before any controller logic executes, preventing invalid types from entering domain services.',
            studySteps: [
              'Define a Zod schema for CreateSolarPanelRequest with positive wattage and valid serial number.',
              'Build a reusable validateRequest middleware that intercepts invalid payloads.',
              'Format Zod validation issues into a clean { success: false, details: { field: [errors] } } JSON response.',
            ],
            practiceActivity: 'Create a validation middleware and test sending invalid negative wattage values, verifying an HTTP 400 response with field-specific guidance.',
            completionCriteria: 'Invalid requests rejected with HTTP 400 and clear error breakdown; valid requests parsed with full TypeScript type inference.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs7-1',
            title: 'Energy Telemetry Ingestion Endpoint with Zod',
            difficulty: 'Intermediate',
            instructions: 'Write a POST /api/v1/telemetry endpoint validated with Zod requiring meterId (uuid), timestamp (ISO date string), and generatedKwh (non-negative number).',
            hints: ['Use z.string().uuid() and z.number().nonnegative().'],
            solutionOverview: 'Define Zod schema, attach validation middleware, and return 201 with created record ID.',
          },
        ],
        weekendProject: {
          title: 'Clean Energy Telemetry REST API Microservice',
          description: 'Build a production-grade Express REST API with full Zod validation, structured error responses, automated request logging, and rate limiting.',
          deliverables: [
            'Express + TypeScript microservice with modular routing and controllers',
            'Complete Zod validation suite for all CRUD endpoints',
            'Postman / HTTP test collection with positive and negative test cases',
          ],
          estimatedHours: 12,
          tasks: [
            'Initialize Express TypeScript project with helmet and CORS',
            'Define resource schemas for EnergyAsset and TelemetryReading',
            'Implement validation middleware and centralized error handler',
            'Add health check endpoint and request duration response headers',
          ],
          acceptanceCriteria: [
            'Zero unhandled promise rejections on malformed JSON bodies',
            'All responses follow standardized { success: boolean, data?: any, error?: string } schema',
          ],
        },
        curatedResources: [
          {
            title: 'Zod Official Documentation',
            type: 'documentation',
            searchQueryOrUrl: 'https://zod.dev',
            description: 'Complete guide to TypeScript-first schema declaration and validation.',
          },
          {
            title: 'GitHub: Production Express REST API Architectures',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Aexpress+topic%3Azod+language%3Atypescript',
            description: 'Open source clean architectures for Express and Zod applications.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Why is runtime schema validation (like Zod) still necessary in an application written in TypeScript?',
            idealAnswerKey: 'TypeScript types are completely erased at compile time and exist only for developer tooling. At runtime, data coming over the network from HTTP requests, query params, or databases is completely untyped. Zod validates actual runtime values and guarantees they conform to expected contracts before execution continues.',
            difficulty: 'Medium',
            explanation: 'Type erasure means static typing cannot protect a server from malformed network payloads without runtime validation.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the correct HTTP status code to return when a client sends a request with invalid payload syntax or failed Zod validation?',
            options: ['HTTP 400 Bad Request', 'HTTP 404 Not Found', 'HTTP 500 Internal Server Error', 'HTTP 403 Forbidden'],
            correctAnswerIndex: 0,
            explanation: 'HTTP 400 Bad Request signals that the server cannot process the request due to client error (malformed syntax or invalid parameter validation).',
          },
        ],
        completionCriteria: [
          'Create working Express API with Zod validation rejecting invalid inputs with HTTP 400',
          'Pass test cases verifying standardized JSON response envelopes',
        ],
      },
    },
    {
      id: 'ms-fs-8',
      title: 'Relational Data Modeling & PostgreSQL Time-Series',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 35,
      prerequisiteIds: ['ms-fs-6'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Energy grid data is fundamentally time-series: measurements of wattage, voltage, and carbon intensity captured at millisecond intervals. Relational schemas with time-series indexing guarantee analytical speed and transactional integrity.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Design normalized relational schemas with foreign keys and index constraints.',
          'Query and aggregate large datasets using SQL GROUP BY, HAVING, and window functions.',
          'Optimize time-series queries using composite B-tree and BRIN indexes.',
        ],
        learningOutcomes: [
          'Author resilient SQL migration scripts defining tables, foreign keys, and unique indexes.',
          'Execute analytical time-bucket aggregation queries for hourly and daily energy metrics.',
          'Prevent SQL injection vulnerabilities by using parameterized database queries.',
        ],
        topics: [
          {
            title: 'Relational Database Fundamentals & SQL',
            subtopics: ['Tables, primary keys, foreign keys & relational normalization (3NF)', 'ACID transactions and isolation levels', 'SELECT, JOIN (INNER, LEFT, FULL), and aggregations', 'Parameterized queries and SQL injection prevention'],
          },
          {
            title: 'Time-Series & Performance Optimization',
            subtopics: ['Indexing strategies: B-tree, Hash, and BRIN for timestamp columns', 'Time-bucket rollups (date_trunc, TimescaleDB continuous aggregates)', 'Database connection pooling and connection limits', 'Query execution plans (EXPLAIN ANALYZE)'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs8-1',
            title: 'Relational Schema Design & ACID Transactions',
            durationMinutes: 50,
            explanation: 'Clean energy trading and carbon accounting require strict ACID transaction guarantees. If a solar generator commits renewable energy credits, debits and credits must commit atomically.',
            studySteps: [
              'Design schema for assets, meter_readings, and carbon_credits tables with foreign keys.',
              'Implement a multi-statement transaction with BEGIN, COMMIT, and ROLLBACK.',
              'Simulate a failed operation to verify rollback preserves database consistency.',
            ],
            practiceActivity: 'Write a transactional credit allocation query that transfers 500 kWh of solar credit from producer to consumer account or aborts on insufficient balance.',
            completionCriteria: 'Transaction succeeds atomically or rolls back cleanly with zero partial balance alterations.',
          },
          {
            id: 'lesson-fs8-2',
            title: 'Time-Series Aggregations & Query Indexing',
            durationMinutes: 60,
            explanation: 'Plotting a 24-hour generation curve across thousands of solar panels requires aggregating millions of raw readings into hourly averages. Composite indexes on (asset_id, recorded_at) prevent full table scans.',
            studySteps: [
              'Write SQL queries using date_trunc("hour", recorded_at) and AVG(kilowatts).',
              'Use EXPLAIN ANALYZE to inspect query execution plan and identify sequential scans.',
              'Add composite index on (asset_id, recorded_at DESC) and verify index scan utilization.',
            ],
            practiceActivity: 'Execute EXPLAIN ANALYZE on a 500,000-row telemetry query before and after adding a composite index, measuring execution time drop.',
            completionCriteria: 'Query execution time decreases by at least 10x using verified index scan.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs8-1',
            title: 'Hourly Peak Energy Aggregation Query',
            difficulty: 'Intermediate',
            instructions: 'Write a SQL query that retrieves the top 3 peak generation hours for a given wind farm ID over the past 30 days using date_trunc, SUM, and ORDER BY.',
            hints: ['Group by date_trunc("hour", recorded_at) and order by sum descending.'],
            solutionOverview: 'Filter by asset_id and timestamp window, group by hourly truncation, order by SUM(kwh) DESC limit 3.',
          },
        ],
        weekendProject: {
          title: 'PostgreSQL Clean Energy Time-Series Analytics Engine',
          description: 'Design and deploy a relational database schema for grid telemetry with automated migrations, connection pooling, and analytical aggregation procedures.',
          deliverables: [
            'SQL migration scripts setting up tables, constraints, and indexes',
            'TypeScript database service using connection pool and parameterized queries',
            'Benchmarked SQL query suite calculating daily, weekly, and monthly carbon metrics',
          ],
          estimatedHours: 14,
          tasks: [
            'Create Docker Compose file launching PostgreSQL database',
            'Write migration script defining assets, readings, and carbon_offsets tables',
            'Seed database with 100,000 simulated energy readings',
            'Write and benchmark hourly rollup aggregation queries with EXPLAIN ANALYZE',
          ],
          acceptanceCriteria: [
            'All database queries use parameterized SQL bindings',
            'Query execution time for 30-day rollup is under 50ms on 100k rows',
          ],
        },
        curatedResources: [
          {
            title: 'PostgreSQL Official Documentation: Indexing & Queries',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.postgresql.org/docs/current/indexes.html',
            description: 'Comprehensive guide to PostgreSQL indexing architectures and query planner.',
          },
          {
            title: 'GitHub: TimescaleDB & Time-Series SQL Blueprints',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Apostgresql+topic%3Atime-series+topic%3Asql',
            description: 'Open source time-series database schemas and analytical queries.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Why is a composite index on (asset_id, recorded_at) more effective for time-series queries than two separate single-column indexes?',
            idealAnswerKey: 'A composite index on (asset_id, recorded_at) allows the database engine to jump directly to the target asset and immediately traverse an already-sorted B-tree of timestamps in a single index lookup. Two separate indexes require the planner to bitmap-index-scan both and compute a costly bitmap intersection in memory.',
            difficulty: 'Hard',
            explanation: 'Composite indexes match common multi-column WHERE and ORDER BY clauses with optimal traversal.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which SQL command displays the query planner execution plan and actual execution timing for a query?',
            options: ['EXPLAIN ANALYZE', 'SELECT TIMING', 'SHOW PLAN', 'DESCRIBE QUERY'],
            correctAnswerIndex: 0,
            explanation: 'EXPLAIN ANALYZE executes the query, records actual row counts and execution duration for each plan node.',
          },
        ],
        completionCriteria: [
          'Design normalized relational schema with verified foreign keys and index constraints',
          'Execute analytical time-bucket aggregation query with verified index usage',
        ],
      },
    },
    {
      id: 'ms-fs-9',
      title: 'Real-Time Telemetry Streaming with WebSockets',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 30,
      prerequisiteIds: ['ms-fs-5', 'ms-fs-7'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Grid operators require immediate sub-second notifications when transformer substations overload or solar generation spikes. Full-duplex WebSockets eliminate polling overhead and enable instant bidirectional telemetry streaming.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Establish and manage full-duplex WebSocket connections in Node.js and browser.',
          'Implement heartbeat ping/pong mechanisms to detect dead client sockets.',
          'Broadcast targeted room updates and handle reconnections with client backoff.',
        ],
        learningOutcomes: [
          'Build scalable WebSocket server modules with client subscription management.',
          'Create resilient React client hooks that automatically reconnect on network drops.',
          'Implement binary and JSON telemetry payload serialization protocols.',
        ],
        topics: [
          {
            title: 'WebSocket Protocol & Architecture',
            subtopics: ['HTTP 101 Switching Protocols handshake', 'Frame structure, masking, and binary vs text payloads', 'Client heartbeats, ping/pong frames, and zombie connection cleanup', 'WebSocket security, origin validation, and authentication tokens'],
          },
          {
            title: 'Real-Time Streaming Systems',
            subtopics: ['Pub/Sub room architectures for multi-tenant telemetry', 'Client-side auto-reconnection with exponential backoff', 'Buffering offline messages and delta reconciliation', 'Horizontal scaling considerations with Redis Pub/Sub'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs9-1',
            title: 'Full-Duplex Handshake & Heartbeat Management',
            durationMinutes: 50,
            explanation: 'WebSockets begin as standard HTTP requests upgraded to a persistent TCP socket. Because mobile clients and field sensors can silently disconnect without sending FIN packets, periodic ping/pong heartbeats are required.',
            studySteps: [
              'Implement an HTTP server with ws WebSocket server upgrade handler.',
              'Configure a 30-second ping interval that terminates unresponsive zombie connections.',
              'Validate client authentication token in the initial upgrade request headers.',
            ],
            practiceActivity: 'Build a WebSocket server that maintains an active connection registry, sends ping frames every 15s, and disconnects clients failing to pong.',
            completionCriteria: 'Server cleanly terminates simulated unresponsive sockets and decrements active connection count.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs9-1',
            title: 'Substation Alert Broadcast Channel',
            difficulty: 'Intermediate',
            instructions: 'Write a Node.js WebSocket channel manager that allows clients to subscribe to specific substation IDs and broadcasts emergency overload alerts only to subscribed clients.',
            hints: ['Maintain a Map<substationId, Set<WebSocket>> registry.'],
            solutionOverview: 'Group sockets by substation topic and iterate through recipient set on alert dispatch.',
          },
        ],
        weekendProject: {
          title: 'Live Clean Energy Telemetry Streaming Bridge',
          description: 'Construct a full-stack real-time streaming bridge: a Node.js WebSocket server emitting simulated live solar generation data and a React dashboard plotting real-time wattage spikes.',
          deliverables: [
            'Node.js WebSocket server with heartbeat management and room subscriptions',
            'React custom hook useWebSocketStream with auto-reconnection and buffering',
            'Live updating visual dashboard showing sub-second wattage changes',
          ],
          estimatedHours: 12,
          tasks: [
            'Build ws server with connection authentication and room subscription logic',
            'Implement mock telemetry generator broadcasting readings every 500ms',
            'Create React client hook managing WebSocket lifecycle and auto-retry',
            'Plot streaming wattage data in real-time UI without re-render stutter',
          ],
          acceptanceCriteria: [
            'Client automatically reconnects within 3 seconds when server is restarted',
            'Heartbeat cleanly terminates broken connections within 45 seconds',
          ],
        },
        curatedResources: [
          {
            title: 'MDN Web Docs: The WebSocket API',
            type: 'documentation',
            searchQueryOrUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',
            description: 'Official client API documentation for browser WebSocket connections.',
          },
          {
            title: 'GitHub: Real-Time WebSocket Streaming Architectures',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Awebsocket+topic%3Areal-time+language%3Atypescript',
            description: 'Open source implementations of resilient real-time streaming services.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you horizontally scale a WebSocket server across multiple instances behind a load balancer?',
            idealAnswerKey: 'Because WebSockets maintain stateful TCP connections to a specific server instance, multiple instances cannot communicate directly. Scaling requires configuring load balancer sticky sessions or proxy upgrades, paired with a shared Redis Pub/Sub message bus so that a message received on Instance A is published to Redis and forwarded to subscribed clients on Instance B.',
            difficulty: 'Hard',
            explanation: 'Decoupling client connections from message distribution is necessary for multi-instance clusters.',
          },
        ],
        quizQuestions: [
          {
            question: 'What HTTP status code is sent by the server to confirm successful upgrade to the WebSocket protocol?',
            options: ['101 Switching Protocols', '200 OK', '204 No Content', '301 Moved Permanently'],
            correctAnswerIndex: 0,
            explanation: 'HTTP 101 Switching Protocols indicates that the server accepts the upgrade request to switch protocols to WebSocket.',
          },
        ],
        completionCriteria: [
          'Build WebSocket server and client with verified auto-reconnection logic',
          'Demonstrate successful heartbeat ping/pong cycle with automated zombie socket teardown',
        ],
      },
    },
    {
      id: 'ms-fs-10',
      title: 'Authentication, JWT Tokens & Security Hardening',
      category: 'core-skill',
      phaseId: 'phase-4',
      estimatedHours: 35,
      prerequisiteIds: ['ms-fs-7', 'ms-fs-8'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Energy management systems represent critical public infrastructure. Unauthorized access could disrupt power distribution. Securing endpoints with hashed passwords (bcrypt), signed JWT sessions, and role-based access control (RBAC) is non-negotiable.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Hash and salt user credentials securely using bcrypt.',
          'Issue, sign, and verify JSON Web Tokens (JWT) with standard expiration.',
          'Enforce strict authorization and ownership checks on private resources.',
        ],
        learningOutcomes: [
          'Implement secure user registration, login, and token refreshment pipelines.',
          'Build Express authentication middleware extracting and verifying Bearer tokens.',
          'Prevent common vulnerabilities: injection, broken object-level authorization (BOLA), and CSRF.',
        ],
        topics: [
          {
            title: 'Cryptography & Credential Storage',
            subtopics: ['Password hashing fundamentals: salts, work factors, and bcrypt', 'Symmetric vs asymmetric signing (HMAC SHA-256 vs RSA/ECDSA)', 'Secure storage: httpOnly cookies vs Authorization headers', 'Rate limiting and brute-force prevention with express-rate-limit'],
          },
          {
            title: 'JWT Lifecycle & Authorization Guardrails',
            subtopics: ['JWT structure: header, payload claims, and cryptographic signature', 'Access tokens vs refresh tokens and rotation strategies', 'Role-Based Access Control (RBAC) middleware', 'Object-level ownership validation on API routes'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs10-1',
            title: 'Password Security & Bcrypt Work Factors',
            durationMinutes: 45,
            explanation: 'Storing plaintext passwords or fast hashes (MD5, SHA1) leaves credentials vulnerable to rainbow table attacks. Bcrypt incorporates automatic salting and configurable adaptive work factors to resist hardware cracking.',
            studySteps: [
              'Install bcryptjs and generate password hashes with work factor 12.',
              'Implement password verification using bcrypt.compare.',
              'Benchmark hash calculation time to balance security against server response latency.',
            ],
            practiceActivity: 'Build a secure registration service that validates password complexity with Zod and stores salted bcrypt hashes in the database.',
            completionCriteria: 'Plaintext passwords never logged or saved; bcrypt.compare correctly verifies authentic credentials.',
          },
          {
            id: 'lesson-fs10-2',
            title: 'JWT Token Lifecycle & Middleware Protection',
            durationMinutes: 55,
            explanation: 'JWTs allow stateless verification of user identity across distributed backend services. Signed tokens contain expiration claims (exp) and subject identifiers (sub) that authorization middleware validates on every protected request.',
            studySteps: [
              'Create signToken helper embedding user ID and role with a 15-minute expiration.',
              'Write requireAuth Express middleware validating Bearer token in the Authorization header.',
              'Attach authenticated user payload to req.user for downstream controller access.',
            ],
            practiceActivity: 'Create a requireRole("grid_admin") middleware that allows grid administrators to modify generation thresholds while returning HTTP 403 Forbidden to standard operators.',
            completionCriteria: 'Unauthenticated requests blocked with HTTP 401; unauthorized requests blocked with HTTP 403; valid tokens pass successfully.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs10-1',
            title: 'Resource Ownership Guard Middleware',
            difficulty: 'Intermediate',
            instructions: 'Write an Express middleware that checks whether the authenticated user (req.user.id) is the owner of the requested roadmap or asset ID, returning 403 Forbidden if not.',
            hints: ['Query resource owner from database and compare with req.user.id.'],
            solutionOverview: 'Fetch target resource, compare owner ID to token subject ID, call next() on match or respond 403.',
          },
        ],
        weekendProject: {
          title: 'Complete Authentication & Role-Based Authorization Service',
          description: 'Build a production authentication microservice featuring registration with bcrypt, login with JWT issuance, refresh token rotation, and protected endpoint authorization middleware.',
          deliverables: [
            'Express + TypeScript authentication router with Zod validation',
            'Full suite of unit and integration tests verifying token verification and tamper resistance',
            'Secure credential management conforming to OWASP Top 10 guidelines',
          ],
          estimatedHours: 14,
          tasks: [
            'Create User model schema with unique email and password hash',
            'Implement /register and /login endpoints with bcrypt and JWT',
            'Write requireAuth middleware checking Bearer token validity and expiration',
            'Write integration tests testing valid, expired, and tampered token payloads',
          ],
          acceptanceCriteria: [
            'Passwords hashed with bcrypt work factor >= 10',
            'Tampered or expired tokens rejected with HTTP 401',
            'Zero credentials or secrets leaked in logs or error bodies',
          ],
        },
        curatedResources: [
          {
            title: 'OWASP Top 10: API Security Best Practices',
            type: 'documentation',
            searchQueryOrUrl: 'https://owasp.org/www-project-api-security/',
            description: 'The industry-standard guide to identifying and preventing API security vulnerabilities.',
          },
          {
            title: 'GitHub: JWT Authentication & Security Patterns',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Ajwt+topic%3Aauthentication+language%3Atypescript',
            description: 'Open source secure authentication references.',
          },
        ],
        interviewChallenges: [
          {
            question: 'What is Broken Object Level Authorization (BOLA) and how do you protect against it in Express APIs?',
            idealAnswerKey: 'BOLA occurs when an API endpoint accepts an object ID (e.g. /api/assets/:id) and relies solely on verifying that the user is logged in, without checking if that specific user actually owns or has permission to access that specific object. Protection requires querying the resource owner and validating that req.user.id matches the owner ID, returning 403 Forbidden otherwise.',
            difficulty: 'Hard',
            explanation: 'BOLA is the #1 vulnerability on the OWASP API Security Top 10 list.',
          },
        ],
        quizQuestions: [
          {
            question: 'What prevents an attacker from altering the payload inside a JSON Web Token (JWT)?',
            options: [
              'The cryptographic signature generated using the server secret key.',
              'The payload is encrypted with two-factor authentication.',
              'JWT payloads are stored in the browser keychain.',
              'Browsers block client-side modifications to base64 strings.',
            ],
            correctAnswerIndex: 0,
            explanation: 'The JWT signature is calculated over the header and payload using a secret key; altering any claim breaks the signature verification.',
          },
        ],
        completionCriteria: [
          'Pass automated test suite verifying password hashing and JWT lifecycle',
          'Implement and verify resource ownership authorization middleware',
        ],
      },
    },
    {
      id: 'ms-fs-11',
      title: 'Automated Testing, Dockerization & CI/CD Pipelines',
      category: 'tooling',
      phaseId: 'phase-4',
      estimatedHours: 35,
      prerequisiteIds: ['ms-fs-5', 'ms-fs-10'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Manual testing cannot guarantee safety across complex full-stack web applications. Automated unit, integration, and end-to-end tests combined with Docker containerization ensure identical behavior between local developer machines and cloud production.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Author unit and component tests with Vitest / React Testing Library.',
          'Test API endpoints and database interactions with integration test suites.',
          'Package full-stack applications into multi-stage Docker images and configure CI/CD workflows.',
        ],
        learningOutcomes: [
          'Write deterministic unit tests with test mocks, spies, and fake timers.',
          'Build multi-stage Dockerfiles optimizing image size and build caching.',
          'Configure GitHub Actions workflows running automated lint, test, and build checks on pull requests.',
        ],
        topics: [
          {
            title: 'Automated Testing Strategies',
            subtopics: ['Testing pyramid: Unit vs Integration vs End-to-End', 'Vitest / Jest test runners and assertion matchers', 'React Testing Library for accessible UI testing', 'Mocking network requests with Mock Service Worker (MSW)'],
          },
          {
            title: 'Containerization & Continuous Integration',
            subtopics: ['Docker fundamentals: images, containers, and volumes', 'Multi-stage Docker builds for minimal production footprint', 'Docker Compose for multi-container local development', 'GitHub Actions workflow authoring (.github/workflows)'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs11-1',
            title: 'Automated Component & Service Testing',
            durationMinutes: 55,
            explanation: 'Testing software against implementation details makes test suites brittle. Testing Library focuses on user-centric behavior: asserting that metrics render correctly, buttons click, and error banners appear when APIs reject.',
            studySteps: [
              'Configure Vitest with jsdom environment and @testing-library/react.',
              'Write unit tests for a TelemetryCard component asserting text rendering and badge colors.',
              'Test asynchronous loading states using waitFor and findByRole.',
            ],
            practiceActivity: 'Write a comprehensive Vitest test suite for an energy asset status component testing loading, success, and error states with mocked data.',
            completionCriteria: 'All test assertions pass with zero warnings and report 85%+ branch coverage.',
          },
          {
            id: 'lesson-fs11-2',
            title: 'Multi-Stage Docker Packaging & GitHub Actions CI',
            durationMinutes: 60,
            explanation: 'Deploying source code directly to servers risks environment drift and large images. Multi-stage Docker builds separate build dependencies (compilers, npm devDependencies) from the lean runtime container.',
            studySteps: [
              'Write a multi-stage Dockerfile with builder and production runtime stages.',
              'Configure .dockerignore to exclude node_modules and development artifacts.',
              'Author a GitHub Actions workflow that runs npm test and docker build on pull requests.',
            ],
            practiceActivity: 'Build and package an Express API into a lightweight Alpine Docker container under 120MB and verify it starts and passes health checks.',
            completionCriteria: 'Docker container builds successfully, passes health check at /health, and image size is under 150MB.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs11-1',
            title: 'GitHub Actions Continuous Integration Workflow',
            difficulty: 'Intermediate',
            instructions: 'Write a .github/workflows/ci.yml file that triggers on pushes to main and pull requests, checks out code, sets up Node.js 20, installs dependencies, runs tests, and executes production build.',
            hints: ['Use actions/checkout@v4 and actions/setup-node@v4 with npm cache.'],
            solutionOverview: 'Define jobs for lint, test, and build with cache step to minimize CI runner duration.',
          },
        ],
        weekendProject: {
          title: 'Full-Stack Containerized CI/CD Pipeline',
          description: 'Package the client and server application with Docker Compose, configure automated Vitest testing suites, and establish a GitHub Actions continuous integration pipeline.',
          deliverables: [
            'Dockerfile with multi-stage build optimization for client and server',
            'docker-compose.yml orchestrating client, server, and PostgreSQL database',
            'Automated GitHub Actions CI workflow executing test suite on every commit',
          ],
          estimatedHours: 16,
          tasks: [
            'Author multi-stage Dockerfiles for client and server',
            'Configure docker-compose.yml with health checks and volume persistence',
            'Write 15+ automated unit and integration tests across frontend and backend',
            'Configure GitHub Actions workflow validating build and test success',
          ],
          acceptanceCriteria: [
            'docker compose up spins up all services with green health checks',
            'All automated test suites pass with zero failures in CI runner',
          ],
        },
        curatedResources: [
          {
            title: 'Docker Official Documentation: Multi-stage Builds',
            type: 'documentation',
            searchQueryOrUrl: 'https://docs.docker.com/build/building/multi-stage/',
            description: 'Official best practices for optimizing production container image layers and size.',
          },
          {
            title: 'GitHub Actions Documentation',
            type: 'documentation',
            searchQueryOrUrl: 'https://docs.github.com/en/actions',
            description: 'Official guide to continuous integration workflows and automated runners.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Why are multi-stage Docker builds preferred for production Node.js applications?',
            idealAnswerKey: 'Multi-stage builds allow compiling TypeScript and running build tools in an initial builder stage, then copying only the compiled artifacts (dist folder) and production dependencies into a clean, minimal runtime base image. This drastically reduces image size, speeds up deployments, and eliminates devDependencies and compilers from production, reducing the security attack surface.',
            difficulty: 'Medium',
            explanation: 'Separating build tools from runtime containers improves both performance and container security.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which testing tool is specifically designed to assert on accessible DOM elements based on how users perceive the screen?',
            options: ['React Testing Library', 'Puppeteer', 'Postman', 'Webpack'],
            correctAnswerIndex: 0,
            explanation: 'React Testing Library queries the DOM using accessible roles, labels, and text, encouraging accessible component authoring.',
          },
        ],
        completionCriteria: [
          'Author and pass automated test suites covering unit and integration behaviors',
          'Successfully package application into multi-stage Docker container passing health check',
        ],
      },
    },
    {
      id: 'ms-fs-12',
      title: 'Production Capstone: Renewable Energy Telemetry & Carbon Accounting Platform',
      category: 'capstone',
      phaseId: 'phase-4',
      estimatedHours: 45,
      prerequisiteIds: ['ms-fs-9', 'ms-fs-11'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'This capstone synthesizes every skill acquired throughout the roadmap into an enterprise-grade full-stack product. Building an end-to-end clean tech platform with real-time streaming, relational time-series persistence, authentication, and Docker deployment proves industry readiness.',
        difficultyLevel: 'Advanced',
        learningObjectives: [
          'Architect and deploy an end-to-end full stack web application from scratch.',
          'Synthesize streaming WebSockets, relational databases, strict TypeScript, and React.',
          'Document architectural design decisions, API contracts, and deploy to public cloud.',
        ],
        learningOutcomes: [
          'Deliver a complete, production-grade clean tech web platform to a public cloud URL.',
          'Demonstrate mastery across frontend state, backend APIs, databases, and DevOps.',
          'Present an auditable software portfolio project showcasing engineering excellence.',
        ],
        topics: [
          {
            title: 'End-to-End System Architecture',
            subtopics: ['System design & service decomposition', 'Live telemetry streaming pipeline integration', 'Transactional carbon credit ledger calculations', 'Auditable security & role-based dashboard access'],
          },
          {
            title: 'Production Deployment & Observability',
            subtopics: ['Cloud deployment (AWS / GCP / Render / Fly.io)', 'Health checks, logging, and performance metrics', 'Zero-downtime deployment strategies', 'Portfolio presentation and architectural documentation'],
          },
        ],
        lessons: [
          {
            id: 'lesson-fs12-1',
            title: 'System Design & End-to-End Service Integration',
            durationMinutes: 60,
            explanation: 'Enterprise engineering requires unifying disparate subsystems: React frontend, WebSocket streams, Express REST APIs, PostgreSQL databases, and authentication guardrails into a coherent, resilient application.',
            studySteps: [
              'Create high-level architecture diagram documenting data flow from IoT sensors to client UI.',
              'Implement end-to-end communication from WebSocket generator to live dashboard charts.',
              'Deploy transactional carbon ledger calculation updating database records in real time.',
            ],
            practiceActivity: 'Connect all subsystems in local Docker Compose environment and verify telemetry flows from sensor generator to browser in under 200ms.',
            completionCriteria: 'Full system operates end-to-end with zero console errors and real-time metrics updating continuously.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-fs12-1',
            title: 'End-to-End Integration Verification',
            difficulty: 'Advanced',
            instructions: 'Write an automated integration test that boots the server, simulates a user logging in, opens a WebSocket stream, records a renewable energy generation event, and verifies database persistence.',
            hints: ['Use supertest for API requests and ws client for WebSocket verification.'],
            solutionOverview: 'Authenticate test user, connect WebSocket, dispatch simulated telemetry, and query database to assert record existence.',
          },
        ],
        weekendProject: {
          title: 'Autonomous Clean Tech Micro-Grid & Carbon Ledger Platform',
          description: 'A full-stack, production-grade platform allowing regional clean energy grids to monitor solar/wind generation in real time, calculate verified carbon offsets, trade renewable energy credits, and manage facility operations.',
          deliverables: [
            'Public GitHub repository with clean architecture, strict TypeScript, and 85%+ test coverage',
            'Live cloud deployment URL with demo accounts for grid operator and auditor roles',
            'Architecture documentation with system diagrams and API OpenAPI/Swagger specifications',
          ],
          estimatedHours: 24,
          tasks: [
            'Design full-stack repository structure and shared TypeScript contract library',
            'Implement Express backend with Zod validation, PostgreSQL persistence, and WebSockets',
            'Build responsive React frontend with interactive telemetry graphs and detail drawers',
            'Implement JWT authentication with role-based access for operators and auditors',
            'Deploy application via Docker to cloud provider with automated CI/CD pipeline',
          ],
          acceptanceCriteria: [
            'All 12 roadmap milestones proven in code',
            'Sub-second real-time telemetry updates via WebSockets',
            'Zero security warnings, strict TypeScript with zero any escapes',
            'Publicly accessible live URL with responsive mobile and desktop support',
          ],
        },
        curatedResources: [
          {
            title: 'GitHub: System Design Architecture Blueprints',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Asystem-design+topic%3Afull-stack+language%3Atypescript',
            description: 'Production system design blueprints and full-stack reference architectures.',
          },
          {
            title: '12-Factor App Methodology for Cloud Applications',
            type: 'documentation',
            searchQueryOrUrl: 'https://12factor.net',
            description: 'Industry-standard methodology for building scalable, maintainable cloud SaaS systems.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Walk me through the complete end-to-end architecture of your renewable energy platform. How did you ensure data consistency between real-time streaming sockets and long-term database storage?',
            idealAnswerKey: 'Incoming telemetry packets arrive via WebSockets and are validated using Zod. To prevent database I/O bottlenecks during generation spikes, readings are batched in memory and written in micro-batches to PostgreSQL using parameterized transactions. Live readings are immediately broadcast to active client rooms, while historical queries read from indexed time-series tables.',
            difficulty: 'Hard',
            explanation: 'This question tests architectural maturity, data consistency trade-offs, and clear technical communication.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which architectural strategy decouples high-volume incoming sensor streaming from database write bottlenecks?',
            options: [
              'Buffering incoming packets and writing them in micro-batches with transactional bulk inserts.',
              'Writing every single packet synchronously with separate database connections.',
              'Disabling database indexes completely to speed up insertions.',
              'Storing all historical data in client browser localStorage.',
            ],
            correctAnswerIndex: 0,
            explanation: 'Micro-batching aggregates high-frequency writes, amortizing database transaction overhead while keeping streaming responsive.',
          },
        ],
        completionCriteria: [
          'Successfully build, test, and deploy full-stack production capstone',
          'Verify all 12 milestones integrated into portfolio repository and live URL',
        ],
      },
    },
  ],
};
