// ============================================================================
// 2. FINTECH MOBILE & WEB UI/UX DESIGNER
// ============================================================================
export const fintechUxRoadmap = {
  id: 'rf-fintech-ux-verified',
  targetRole: 'Fintech Mobile & Web UI/UX Designer',
  targetCompanyType: 'Neo-bank & Payment Infrastructure',
  experienceLevel: 'Intermediate',
  weeklyCommitmentHours: 20,
  totalEstimatedWeeks: 18,
  source: 'cached_fallback',
  phases: [
    {
      id: 'phase-1',
      title: 'Phase 1: Financial UX Foundations & User Mental Models',
      description: 'Understanding psychology of money, risk perception, user research in wealth management, and journey mapping.',
      order: 1,
    },
    {
      id: 'phase-2',
      title: 'Phase 2: Scalable Design Systems & Information Architecture',
      description: 'Figma auto-layout mastery, multi-brand design tokens, transactional flow architecture, and wireframing.',
      order: 2,
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Financial Data Visualization, Security & Accessibility',
      description: 'Candlestick and portfolio charts, intentional friction for high-stakes transactions, biometric UX, and WCAG 2.2 AA compliance.',
      order: 3,
    },
    {
      id: 'phase-4',
      title: 'Phase 4: High-Fidelity Prototyping, Testing & Neo-Bank Capstone',
      description: 'Complex micro-interactions in ProtoPie/Figma, moderated usability testing with quantitative task metrics, and an end-to-end wealth management capstone.',
      order: 4,
    },
  ],
  intermediateRoles: [
    {
      title: 'Associate Product Designer',
      estimatedTimelineMonth: 3,
      description: 'Designing transactional payment flows, form inputs, and banking design system components in Figma.',
    },
    {
      title: 'Mid-Level FinTech UX Designer',
      estimatedTimelineMonth: 6,
      description: 'Leading user research, building high-stakes money transfer journeys, and conducting usability benchmark studies.',
    },
  ],
  milestones: [
    {
      id: 'ms-ux-1',
      title: 'Financial UX Foundations & Psychology of Money',
      category: 'foundation',
      phaseId: 'phase-1',
      estimatedHours: 25,
      prerequisiteIds: [],
      status: 'available',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Designing financial products involves intense user vulnerability. People experience acute anxiety around money, loss aversion, and security fears. Understanding the psychological mental models of financial decisions is the prerequisite for designing trustworthy fintech products.',
        difficultyLevel: 'Beginner',
        learningObjectives: [
          'Deconstruct psychological biases: loss aversion, mental accounting, and cognitive load in financial decisions.',
          'Establish brand trust through visual reassurance, clarity of fee disclosure, and transparent confirmations.',
          'Analyze regulatory transparency standards (CFPB, FCA) and design ethical financial disclosures.',
        ],
        learningOutcomes: [
          'Identify and eradicate dark patterns in financial subscription and loan flows.',
          'Design reassuring feedback states that reduce user anxiety during delayed banking settlements.',
          'Map user mental models against actual banking ledger mechanics.',
        ],
        topics: [
          {
            title: 'Behavioral Finance & Psychology of Risk',
            subtopics: ['Loss aversion and prospect theory in wealth apps', 'Mental accounting and budget categorizations', 'Cognitive overload during complex investment decisions'],
          },
          {
            title: 'Trust Architecture & Ethical FinTech Design',
            subtopics: ['Visual cues for security and encryption status', 'Transparent fee architecture and zero-surprise checkouts', 'Dark patterns vs ethical nudges in savings products'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux1-1',
            title: 'Loss Aversion & Reducing Financial Anxiety',
            durationMinutes: 45,
            explanation: 'Users feel the pain of losing \$100 twice as acutely as the joy of gaining \$100. Financial interfaces must communicate market volatility, balances, and negative balances with empathy rather than panic-inducing visual alarms.',
            studySteps: [
              'Examine case studies of Robinhood vs Wise in how market fluctuations and transfer fees are communicated.',
              'Audit color semantics: avoiding aggressive red tones for expected account debits.',
              'Author copy guidelines for sensitive banking events (overdraft, failed deposit, fraud alert).',
            ],
            practiceActivity: 'Redesign an aggressive overdraft notification into an empathetic, action-oriented financial wellness dialog.',
            completionCriteria: 'Redesigned notification provides clear balance context, non-punitive language, and single-tap resolution options.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux1-1',
            title: 'Transparent Fee Breakdown Dialog',
            difficulty: 'Beginner',
            instructions: 'Design an international remittance cost transparency modal comparing bank markup vs real exchange rate using clear visual hierarchy.',
            hints: ['Break down mid-market exchange rate, transfer fee, and guaranteed arrival time.'],
            solutionOverview: 'Present side-by-side fee comparison with transparent calculations and guaranteed recipient delivery amount.',
          },
        ],
        weekendProject: {
          title: 'Financial Trust & Onboarding Heuristic Audit Report',
          description: 'Conduct a comprehensive heuristic UX audit of 3 leading FinTech banking applications, identifying dark patterns, trust breakdowns, and friction points across onboarding and transfers.',
          deliverables: [
            'Figma / FigJam audit board with 30+ annotated screen captures',
            'Competitive matrix evaluating trust cues, fee transparency, and error states',
            'Summary presentation highlighting 5 actionable UX redesign recommendations',
          ],
          estimatedHours: 10,
          tasks: [
            'Select 3 neo-bank or wealth apps (e.g. Revolut, Wise, Monzo)',
            'Document onboarding, KYC verification, and international transfer flows',
            'Score each flow against Nielsen Norman Group usability heuristics',
            'Highlight ethical design alternatives to identified friction points',
          ],
          acceptanceCriteria: [
            'Audit evaluates at least 15 individual screens per application',
            'Clear evidence-based recommendations supported by behavioral finance principles',
          ],
        },
        curatedResources: [
          {
            title: 'Nielsen Norman Group: UX of Banking and Financial Services',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.nngroup.com/topic/fintech-financial-services/',
            description: 'Industry-standard research reports on user behavior and interface usability in finance.',
          },
          {
            title: 'GitHub: FinTech UI/UX Guidelines and Design Systems',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Afintech+topic%3Adesign-system',
            description: 'Open source design guidelines and component patterns in financial software.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you design an interface that balances speed with security when a user is making a high-value irreversible wire transfer?',
            idealAnswerKey: 'High-value irreversible transactions require "intentional friction" rather than pure speed. Speed can cause catastrophic accidental transfers. The interface should enforce progressive confirmation: displaying beneficiary details, amount written in both numbers and words, clear warnings of irrevocability, and requiring explicit biometrics or a slide-to-confirm gesture rather than a simple tap.',
            difficulty: 'Medium',
            explanation: 'FinTech UX distinguishes itself by knowing when to introduce friction to protect users from high-risk mistakes.',
          },
        ],
        quizQuestions: [
          {
            question: 'What behavioral psychology principle explains why users feel greater distress over a financial loss than joy over an equal gain?',
            options: ['Loss Aversion', 'Hick’s Law', 'Fitts’s Law', 'The Halo Effect'],
            correctAnswerIndex: 0,
            explanation: 'Loss aversion, identified in Kahneman and Tversky’s Prospect Theory, shows that losses loom larger than equivalent gains.',
          },
        ],
        completionCriteria: [
          'Complete heuristic audit evaluating financial mental models and trust cues',
          'Pass quiz on behavioral finance principles in interface design',
        ],
      },
    },
    {
      id: 'ms-ux-2',
      title: 'User Research, Journey Mapping & Financial Personas',
      category: 'foundation',
      phaseId: 'phase-1',
      estimatedHours: 30,
      prerequisiteIds: ['ms-ux-1'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'A 22-year-old student budgeting paycheck to paycheck has completely different goals and risk tolerance than a 45-year-old managing a retirement portfolio. Conducting qualitative interviews and authoring behavioral personas ensures design solutions address actual customer pain points.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Formulate unbiased user interview scripts for sensitive financial topics.',
          'Construct behavioral personas reflecting financial literacy, tech adoption, and risk posture.',
          'Map end-to-end user journeys from account discovery through KYC identity verification to active usage.',
        ],
        learningOutcomes: [
          'Conduct qualitative interviews with target financial users without leading questions.',
          'Synthesize raw research notes into affinity diagrams and actionable insight clusters.',
          'Design visual customer journey maps highlighting emotion curves and high-friction touchpoints.',
        ],
        topics: [
          {
            title: 'FinTech User Research Methodologies',
            subtopics: ['Qualitative interview techniques for private financial habits', 'Contextual inquiry and diary studies for daily spending tracking', 'Affinity diagramming and thematic synthesis in FigJam'],
          },
          {
            title: 'Persona & Journey Map Synthesis',
            subtopics: ['Behavioral personas vs demographic marketing profiles', 'End-to-end customer journey mapping with emotional arcs', 'Identifying drop-off bottlenecks in KYC onboarding funnels'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux2-1',
            title: 'Qualitative Financial Interviewing & Journey Mapping',
            durationMinutes: 55,
            explanation: 'People are often guarded when discussing money. Skilled financial UX researchers ask open-ended questions focused on recent real behaviors ("Walk me through the last time you split a bill") rather than hypothetical self-assessments.',
            studySteps: [
              'Author an interview guide with warm-up, core behavior, and wrap-up questions.',
              'Conduct simulated user research sessions capturing audio and screen interactions.',
              'Plot an emotional journey map tracking excitement, anxiety, and frustration points during account opening.',
            ],
            practiceActivity: 'Create a customer journey map for a first-time investor opening an account, depositing \$500, and buying their first ETF fractional share.',
            completionCriteria: 'Journey map clearly details stages, user actions, touchpoints, emotion curves, and prioritized design opportunities.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux2-1',
            title: 'FinTech Behavioral Persona Profile',
            difficulty: 'Beginner',
            instructions: 'Create a behavioral persona for "The Anxious First-Time Investor" documenting financial goals, tech stack, triggers, frustrations, and design implications in Figma.',
            hints: ['Focus on behavior, financial literacy level, and coping mechanisms rather than irrelevant demographic filler.'],
            solutionOverview: 'Profile includes key financial motivations, digital habits, mental friction points, and specific UX requirements.',
          },
        ],
        weekendProject: {
          title: 'Neo-Bank KYC Onboarding Research & Journey Map Package',
          description: 'Synthesize research from 5 simulated user interviews to produce an actionable customer journey map of the KYC (Know Your Customer) identity verification funnel, identifying drop-off reasons and proposing targeted UX solutions.',
          deliverables: [
            'Comprehensive user research synthesis board in FigJam / Figma',
            'Two validated behavioral personas with distinct financial literacy profiles',
            'Full customer journey map detailing pain points, emotion arcs, and design opportunities',
          ],
          estimatedHours: 12,
          tasks: [
            'Draft interview script targeting identity verification and mobile banking onboarding',
            'Conduct and synthesize 3 user research walkthroughs',
            'Create affinity diagram clustering findings by onboarding stage',
            'Develop journey map highlighting document capture and verification wait time friction',
          ],
          acceptanceCriteria: [
            'Journey map identifies at least 4 distinct friction points in KYC onboarding',
            'Every friction point is paired with a concrete, testable design recommendation',
          ],
        },
        curatedResources: [
          {
            title: 'Just Enough Research by Erika Hall',
            type: 'documentation',
            searchQueryOrUrl: 'https://abookapart.com/products/just-enough-research',
            description: 'Practical guide to qualitative user research and structured interview synthesis.',
          },
          {
            title: 'GitHub: User Journey Map & Persona Templates',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Ajourney-mapping+topic%3Aux-research',
            description: 'Open source UX research frameworks and journey mapping resources.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you handle research participants who say they want advanced financial data tools, but your analytics show they drop out when presented with complex screens?',
            idealAnswerKey: 'Users frequently state aspirational preferences in interviews (wanting to feel sophisticated), but their actual behavior reveals cognitive overload. As a UX designer, you triangulate declared preferences with observed behavioral data. The solution is progressive disclosure: presenting a clean, glanceable overview by default, while providing an accessible path for power users to expand detailed metrics.',
            difficulty: 'Hard',
            explanation: 'Great UX research distinguishes between what users say and what users actually do.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the primary benefit of creating an emotional curve in a customer journey map?',
            options: [
              'It pinpoints exact moments of user frustration or anxiety where targeted design interventions will yield maximum impact.',
              'It calculates the conversion rate of a marketing landing page.',
              'It defines the color scheme for the application brand identity.',
              'It provides developers with the database schema for user profiles.',
            ],
            correctAnswerIndex: 0,
            explanation: 'Emotional curves visualize user sentiment over time, immediately spotlighting friction valleys that cause abandonment.',
          },
        ],
        completionCriteria: [
          'Produce a comprehensive customer journey map with verified pain point clusters',
          'Pass interview challenge on behavioral triangulation and progressive disclosure',
        ],
      },
    },
    {
      id: 'ms-ux-3',
      title: 'Figma Mastery, Auto-Layout & Design Token Systems',
      category: 'foundation',
      phaseId: 'phase-2',
      estimatedHours: 35,
      prerequisiteIds: ['ms-ux-1'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Modern FinTech design teams operate on atomic design systems. Mastery of Figma Auto-Layout, component variants, interactive component states, and multi-tier design tokens (color, spacing, elevation) enables rapid iteration and seamless engineering handoff.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Construct responsive, flexible components using Figma Auto-Layout 5.0 (min/max widths, wrap).',
          'Architect multi-tier design token libraries (global, semantic, and component-level tokens).',
          'Build robust interactive component sets with component properties (boolean, text, instance swap).',
        ],
        learningOutcomes: [
          'Design adaptive mobile and desktop components that reflow naturally under Auto-Layout.',
          'Organize Figma variables for color, numbers, and strings supporting dark and light themes.',
          'Publish and maintain shared Figma team libraries adhering to atomic design principles.',
        ],
        topics: [
          {
            title: 'Figma Advanced Layout & Component Engineering',
            subtopics: ['Auto-Layout constraints: hug, fill, fixed, and min/max bounds', 'Component properties: boolean toggles, text replacement, instance swap', 'Component variant state matrices (default, hover, active, disabled, error)'],
          },
          {
            title: 'Design Token Architecture & Variables',
            subtopics: ['Design token taxonomy: Primitive tokens vs Semantic tokens', 'Color modes: Light mode, Dark mode, and High-Contrast variables', 'Spacing, radius, and typography scales', 'Exporting tokens for developer handoff (Style Dictionary, JSON)'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux3-1',
            title: 'Auto-Layout Mastery & Fluid Component Resizing',
            durationMinutes: 50,
            explanation: 'Static frames with absolute positioning fail when localized into longer languages or resized across device screens. Auto-layout models real CSS Flexbox behavior, ensuring components adapt gracefully to changing content length.',
            studySteps: [
              'Build a flexible BankTransactionRow component using nested auto-layout frames.',
              'Apply fill container to text labels with truncate overflow settings.',
              'Test component with both short (\\$5.00) and long (\\$1,234,567.89) balance amounts without layout breakage.',
            ],
            practiceActivity: 'Create a reusable financial card component in Figma that maintains perfect padding and alignment across 320px to 480px width variations.',
            completionCriteria: 'Component resizes smoothly with zero clipping, text overlap, or fixed coordinate shifts.',
          },
          {
            id: 'lesson-ux3-2',
            title: 'Semantic Design Tokens & Theming with Figma Variables',
            durationMinutes: 55,
            explanation: 'Hardcoding hex codes creates maintenance nightmares. Modern design systems map primitive colors (slate-900) to semantic aliases (surface-primary, text-critical) that switch dynamically between light and dark themes.',
            studySteps: [
              'Define variable collection with primitive color tokens and semantic alias tokens.',
              'Configure variable modes for Light and Dark themes.',
              'Apply semantic tokens to a full banking dashboard screen and toggle modes seamlessly.',
            ],
            practiceActivity: 'Build a design token system containing 10 semantic colors and 5 spacing variables, and apply them across 3 financial components.',
            completionCriteria: 'Switching Figma mode instantly transforms all components between light and dark modes with correct contrast.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux3-1',
            title: 'Transaction Item State Matrix Component',
            difficulty: 'Intermediate',
            instructions: 'Create a Figma component set for a financial TransactionItem with variants for Status (Pending, Cleared, Failed) and Theme (Light, Dark) using component properties.',
            hints: ['Use nested Auto-Layout and semantic token variables for background and text.'],
            solutionOverview: 'Component set utilizes boolean properties for badge visibility and switches semantic tokens cleanly.',
          },
        ],
        weekendProject: {
          title: 'Neo-Bank Scalable Design System Starter Kit',
          description: 'Construct a foundational Figma design system library for a modern neo-bank, including typography scales, semantic color variables (light/dark), elevation styles, and 12 core banking UI components.',
          deliverables: [
            'Published Figma community file or team library with clean component documentation',
            'Complete token architecture with primitive and semantic variable collections',
            'Component set covering Buttons, Input Fields, Currency Inputs, Transaction Rows, and Account Cards',
          ],
          estimatedHours: 16,
          tasks: [
            'Define typography, spacing, and radius variables in Figma',
            'Set up semantic color token system supporting Light and Dark modes',
            'Build accessible Button and Form Input component sets with all interactive states',
            'Construct specialized FinTech components: AccountBalanceCard, CurrencyBadge, TransactionRow',
          ],
          acceptanceCriteria: [
            'All components built with 100% Auto-Layout and zero absolute positioning',
            'Component properties configured for text, boolean, and instance swap slots',
            'Full light/dark theme switching functional across all components',
          ],
        },
        curatedResources: [
          {
            title: 'Figma Official Auto Layout Guide',
            type: 'documentation',
            searchQueryOrUrl: 'https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties',
            description: 'Comprehensive guide to auto-layout, alignment, min/max dimensions, and wrapping.',
          },
          {
            title: 'Design Systems by Alla Kholmatova',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.smashingmagazine.com/design-systems-book/',
            description: 'Foundational text on atomic design patterns, shared design language, and design tokens.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you structure design tokens to ensure a frictionless design-to-code workflow with front-end engineers?',
            idealAnswerKey: 'A robust design token system is structured in three layers: 1) Global/Primitive tokens defining raw values (e.g., color-blue-600: #2563eb), 2) Semantic/Alias tokens defining intent (e.g., color-surface-action: {color-blue-600}), and 3) Component tokens defining specific usage (e.g., button-primary-bg: {color-surface-action}). Aligning naming conventions 1:1 between Figma variables and CSS custom properties / Tailwind tokens allows developers to consume tokens directly via automated tools like Style Dictionary.',
            difficulty: 'Hard',
            explanation: 'Engineers love designers who understand token taxonomy and automated handoff tooling.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the primary advantage of semantic design tokens over primitive design tokens?',
            options: [
              'Semantic tokens convey meaning and intent (e.g., "color-feedback-danger"), making theming and automated mode switching seamless.',
              'Semantic tokens render faster in web browsers than primitive tokens.',
              'Primitive tokens cannot be used in mobile applications.',
              'Semantic tokens eliminate the need for CSS style sheets.',
            ],
            correctAnswerIndex: 0,
            explanation: 'Semantic tokens decouple the specific hex color from its functional intent, allowing dark mode or high-contrast overrides without breaking code.',
          },
        ],
        completionCriteria: [
          'Build complete Figma component set using Auto-Layout and component properties',
          'Implement semantic variable token collections supporting light and dark themes',
        ],
      },
    },
    {
      id: 'ms-ux-4',
      title: 'FinTech Information Architecture & Transactional Funnels',
      category: 'core-skill',
      phaseId: 'phase-2',
      estimatedHours: 30,
      prerequisiteIds: ['ms-ux-2', 'ms-ux-3'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Transferring money, splitting expenses, and investing involve multi-step transactional funnels. Flawed information architecture causes user hesitation, input mistakes, and costly cart/transfer abandonment.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Organize banking navigation hierarchies using card sorting and tree testing.',
          'Architect multi-step transactional flows with clear progress indicators and save states.',
          'Design error-tolerant input forms with smart defaults, auto-formatting, and inline validation.',
        ],
        learningOutcomes: [
          'Design low-friction wireframe flows for peer-to-peer payments and bank transfers.',
          'Implement currency and routing number inputs with real-time format masking and error states.',
          'Structure checkout and confirmation reviews that eliminate ambiguous fees.',
        ],
        topics: [
          {
            title: 'Information Architecture in Mobile & Web Banking',
            subtopics: ['Bottom navigation bars vs drawer menus in financial apps', 'Account hierarchy: checking, savings, vaults, and credit lines', 'Tree testing and card sorting for banking menu structures'],
          },
          {
            title: 'Transactional Funnel Design & Input Ergonomics',
            subtopics: ['Progressive disclosure in multi-step transfers (Recipient -> Amount -> Review)', 'Smart defaults and predictive beneficiary search', 'Form input ergonomics: custom numeric keypads, currency masking, and inline feedback'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux4-1',
            title: 'The Anatomy of a High-Conversion Money Transfer Funnel',
            durationMinutes: 55,
            explanation: 'Every step in a money transfer funnel is a potential point of abandonment. Dividing the funnel into discrete, focused steps (Who -> How Much -> When -> Review) reduces cognitive load compared to a cluttered single-page form.',
            studySteps: [
              'Analyze transfer funnel progression in top fintech apps (Venmo, Cash App, Revolut).',
              'Design custom numeric currency keypad with instant fee calculation.',
              'Create a pre-confirmation review screen showing exact recipient arrival time and conversion rate.',
            ],
            practiceActivity: 'Wireframe a 3-step peer-to-peer money transfer flow with custom keypad and review screen in Figma.',
            completionCriteria: 'Wireframe flow demonstrates clear breadcrumb/progress state, inline error recovery, and unambiguous review step.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux4-1',
            title: 'Currency Input Field Ergonomics',
            difficulty: 'Intermediate',
            instructions: 'Design an interactive currency input component that handles dynamic currency symbols, auto-commas for thousands (1,000.00), and shows real-time available balance below the input.',
            hints: ['Ensure the font size scales down gracefully as digits increase past 6 characters.'],
            solutionOverview: 'Dynamic typography sizing and instant balance sufficiency validation prevent overdrafts.',
          },
        ],
        weekendProject: {
          title: 'Cross-Border Remittance Transfer Flow Wireframe Package',
          description: 'Design a comprehensive end-to-end wireframe flow for an international remittance transfer, including beneficiary selection, currency conversion calculator, delivery method selection, and confirmation review.',
          deliverables: [
            'Interactive wireframe prototype in Figma covering 8 interconnected screens',
            'Information architecture sitemap and user flow diagram in FigJam',
            'Detailed error state matrix covering insufficient funds, network drops, and invalid IBAN codes',
          ],
          estimatedHours: 14,
          tasks: [
            'Create user flow diagram detailing happy path and error branch logic',
            'Wireframe beneficiary selection with recent contacts and search filter',
            'Design currency exchange screen with live rate indicator and delivery fee toggle',
            'Build transfer summary review screen with explicit arrival guarantee',
          ],
          acceptanceCriteria: [
            'Prototype link functions smoothly across all happy and error branches',
            'Zero ambiguous fee displays or unformatted currency values',
          ],
        },
        curatedResources: [
          {
            title: 'Information Architecture: For the Web and Beyond (O’Reilly)',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/',
            description: 'The seminal textbook on structuring digital information architectures and navigational hierarchies.',
          },
          {
            title: 'GitHub: Wireframing & Flow Design Kits',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Awireframing+topic%3Auser-flow',
            description: 'Open source user flow libraries and wireframing templates.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you design a mobile payment form to prevent fat-finger input errors when a user enters an amount to send?',
            idealAnswerKey: 'To prevent input errors on financial amounts: 1) Use a dedicated numeric keypad with large touch targets (minimum 48x48dp), 2) Auto-format currency in real-time with clear currency symbols and comma separators, 3) Display the user’s remaining balance directly underneath the input with real-time feedback if amount exceeds balance, and 4) Include a prominent review step showing the amount in both bold numbers and written words before submission.',
            difficulty: 'Medium',
            explanation: 'Input ergonomics directly prevent catastrophic money transfer errors.',
          },
        ],
        quizQuestions: [
          {
            question: 'What UX design principle states that breaking a complex task into smaller, sequential steps reduces perceived cognitive effort?',
            options: ['Progressive Disclosure', 'Occam’s Razor', 'Fitts’s Law', 'Metcalfe’s Law'],
            correctAnswerIndex: 0,
            explanation: 'Progressive disclosure presents information and tasks step-by-step to prevent cognitive overload.',
          },
        ],
        completionCriteria: [
          'Design end-to-end transactional transfer user flow in Figma',
          'Document error state matrix covering insufficient funds and invalid account inputs',
        ],
      },
    },
    {
      id: 'ms-ux-5',
      title: 'Financial Data Visualization & Real-Time Portfolio Charts',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 35,
      prerequisiteIds: ['ms-ux-4'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Users rely on charts to evaluate asset performance, spending habits, and net worth trajectory. Designing financial data visualizations requires balancing visual beauty with mathematical truth, readable axis labels, accessible contrast, and responsive touch gestures.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Design clear, honest financial visualizations: area charts, candlestick charts, and asset distribution donuts.',
          'Implement interactive scrubbers and tooltip overlays that display exact point-in-time values on touch.',
          'Ensure data visualizations maintain accessibility for colorblind users and meet WCAG contrast thresholds.',
        ],
        learningOutcomes: [
          'Create responsive portfolio performance charts with dynamic time-range toggles (1D, 1W, 1M, 1Y, ALL).',
          'Design accessible candlestick charts that communicate bullish/bearish trends without relying solely on red/green.',
          'Build spending category breakdowns with accessible data tables for screen reader navigation.',
        ],
        topics: [
          {
            title: 'Data Visualization Principles for Finance',
            subtopics: ['Avoiding deceptive scales (truncated axes, misleading intervals)', 'Area charts vs Candlestick vs Donut charts for portfolio assets', 'Touch ergonomics: scrubbing gestures, crosshairs, and dynamic tooltip cards'],
          },
          {
            title: 'Colorblind Accessibility & Chart Theming',
            subtopics: ['Designing for Deuteranopia and Protanopia (red/green colorblindness)', 'Using shape, stroke dash, and texture alongside color', 'High-density chart responsive reflow on mobile screens'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux5-1',
            title: 'Interactive Portfolio Scrubbing & Honest Data Scales',
            durationMinutes: 50,
            explanation: 'Financial charts must never mislead users through truncated Y-axes. Interactive charts require intuitive touch-and-drag scrubbers that surface the exact price, timestamp, and gain/loss delta in a high-contrast floating pill.',
            studySteps: [
              'Examine mobile portfolio chart interactions in Apple Stocks and TradingView.',
              'Design an interactive area chart with scrubbing cursor, crosshair, and floating inspection badge.',
              'Test touch target size for 1D, 1W, 1M, 1Y, and ALL time-range filter chips.',
            ],
            practiceActivity: 'Design a mobile portfolio chart component in Figma with full state variants: resting, scrubbing active, and loading skeleton.',
            completionCriteria: 'Chart includes honest zero-anchored or clearly labeled axis bounds and accessible touch scrubber.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux5-1',
            title: 'Colorblind-Safe Financial Trend Indicator',
            difficulty: 'Intermediate',
            instructions: 'Design a stock price change indicator that communicates +5.4% gain or -3.2% loss clearly using color, directional icons, and textual labels without relying solely on red and green hues.',
            hints: ['Incorporate up/down arrows and secondary indicators (e.g. bold +/- prefixes).'],
            solutionOverview: 'Combines dual cues (iconography + text prefix + accessible palette) ensuring 100% clarity under colorblind filters.',
          },
        ],
        weekendProject: {
          title: 'Wealth Management Portfolio Analytics Dashboard',
          description: 'Design a comprehensive mobile and desktop investment portfolio analytics dashboard featuring interactive net-worth trajectory charts, asset allocation breakdowns, and dividend forecasts.',
          deliverables: [
            'Figma design file with mobile (393px) and desktop (1440px) portfolio views',
            'Full component set for Chart Scrubber, Metric Card, Time Filter Bar, and Asset List',
            'Accessibility validation sheet proving WCAG 2.2 AA contrast compliance on all chart elements',
          ],
          estimatedHours: 14,
          tasks: [
            'Design hero net worth card with 24h change pill and privacy eye toggle to hide balance',
            'Build interactive area chart for historical portfolio performance with 5 time horizons',
            'Create asset allocation breakdown chart with accompanying accessible tabular view',
            'Test color palette using Stark or Figma colorblind simulation plugins',
          ],
          acceptanceCriteria: [
            'All text and chart contrast ratios exceed 4.5:1 against dark backgrounds',
            'Data is fully comprehensible in monochrome / grayscale simulation',
          ],
        },
        curatedResources: [
          {
            title: 'The Visual Display of Quantitative Information by Edward Tufte',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.edwardtufte.com/tufte/books_vdqi',
            description: 'The foundational masterwork on honest, high-density data visualization and graphic integrity.',
          },
          {
            title: 'GitHub: Accessible Chart & Visualization Systems',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Adata-visualization+topic%3Acharts+topic%3Aaccessibility',
            description: 'Open source accessible chart libraries and design specifications.',
          },
        ],
        interviewChallenges: [
          {
            question: 'In many cultures, green represents financial gain and red represents loss, but in East Asian markets (like China), red represents market gains. How do you approach this as a global FinTech UX designer?',
            idealAnswerKey: 'As a global FinTech designer, you cannot assume cultural color universalism. Best practice is to decouple color from the core meaning by: 1) Always pairing color with explicit textual signs (+/-) and directional arrows (up/down), 2) Supporting localized color schemes where users in Asian markets see red for gains and green for losses, and 3) Providing user-configurable color accessibility toggles (including high-contrast and monochrome modes).',
            difficulty: 'Hard',
            explanation: 'Demonstrating cultural awareness in financial visual design is a hallmark of senior design leadership.',
          },
        ],
        quizQuestions: [
          {
            question: 'Why is relying solely on green and red colors to indicate financial gain and loss considered a severe accessibility failure?',
            options: [
              'Approximately 8% of men and 0.5% of women have red-green colorblindness (deuteranopia/protanopia), rendering the colors indistinguishable.',
              'Green and red pixels consume more mobile battery power than neutral tones.',
              'Financial regulators legally prohibit colored numbers on bank statements.',
              'Red colors cannot be displayed accurately on modern OLED screens.',
            ],
            correctAnswerIndex: 0,
            explanation: 'Red-green colorblindness makes relying solely on color hue an inaccessible barrier; dual coding with icons or prefixes is mandatory.',
          },
        ],
        completionCriteria: [
          'Design interactive financial chart with touch scrubbing and colorblind-safe cues',
          'Pass WCAG contrast audit on all data visualization components',
        ],
      },
    },
    {
      id: 'ms-ux-6',
      title: 'Friction by Design: Security, 2FA & Fraud Prevention UX',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 25,
      prerequisiteIds: ['ms-ux-4'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'In social media or e-commerce, UX designers strive to remove all friction. In FinTech, friction is a protective safety feature. Designing thoughtful friction for two-factor authentication, biometric handshakes, and scam warnings protects customers from fraud.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Identify when to introduce deliberate UX friction to protect users from irrevocable loss.',
          'Design biometric authentication flows (Face ID, Fingerprint) with graceful PIN fallbacks.',
          'Create contextual warning dialogs that alert users to social engineering and authorized push payment (APP) fraud.',
        ],
        learningOutcomes: [
          'Design multi-factor authentication (MFA / 2FA) patterns that minimize frustration while maximizing security.',
          'Implement "Slide to Confirm" and timeout confirmation gestures for high-value operations.',
          'Craft scam warning overlays that break user autopilot during coerced transactions.',
        ],
        topics: [
          {
            title: 'Intentional Friction & Risk-Based Authentication',
            subtopics: ['Zero-friction vs Positive friction in financial workflows', 'Risk-based adaptive authentication (requesting 2FA only for anomalous transfers)', 'Slide to confirm and progressive commitment patterns'],
          },
          {
            title: 'Scam Prevention & Biometric Interaction Design',
            subtopics: ['Authorized Push Payment (APP) scam intervention dialogs', 'Biometric prompts (FaceID / TouchID) and accessible fallback paths', 'Cool-down periods and transaction delay options for security'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux6-1',
            title: 'Designing Scam Warning Interventions That Users Don’t Ignore',
            durationMinutes: 45,
            explanation: 'When users are under the influence of social engineering phone scams, generic "Are you sure?" dialogs are dismissed instantly on autopilot. Effective anti-fraud friction asks contextual questions that force critical reflection.',
            studySteps: [
              'Review UK PSR regulations on Authorized Push Payment fraud prevention.',
              'Design contextual prompt asking: "Are you sending money because someone called claiming to be your bank?"',
              'Require explicit confirmation checkboxes before unlocking the transfer button.',
            ],
            practiceActivity: 'Design a high-friction security verification dialog for a user adding an unrecognized payee for an unusually large amount.',
            completionCriteria: 'Warning screen forces deliberate comprehension, provides clear exit path, and cannot be dismissed with a single accidental tap.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux6-1',
            title: 'Slide-to-Pay Confirmation Component',
            difficulty: 'Intermediate',
            instructions: 'Create an interactive Figma prototype of a "Slide to Send" slider button for a \$5,000 transfer with spring physics and haptic visual feedback upon completion.',
            hints: ['Use interactive component variants with dragging triggers and spring animations.'],
            solutionOverview: 'Slider requires deliberate horizontal drag across 80% of track before committing transaction.',
          },
        ],
        weekendProject: {
          title: 'High-Stakes Financial Security & Fraud Prevention Flow Package',
          description: 'Design a comprehensive mobile security suite for a banking app, including Face ID login with fallback, adaptive step-up authentication for large transfers, and contextual scam warning dialogs.',
          deliverables: [
            'Figma prototype with 6 connected security screens and interactive components',
            'UX copy guidelines explaining fraud risk in plain, non-technical language',
            'Decision tree diagram detailing when adaptive friction is triggered vs bypassed',
          ],
          estimatedHours: 12,
          tasks: [
            'Map out adaptive authentication triggers based on transfer amount and payee novelty',
            'Design FaceID prompt and numeric PIN backup keypad',
            'Construct interactive anti-scam intervention modal with affirmative user choices',
            'Build "Slide to Transfer" confirmation component with loading and success states',
          ],
          acceptanceCriteria: [
            'Prototypes demonstrate smooth recovery if biometric check fails',
            'Scam warning copy tested for clarity and reading comprehension',
          ],
        },
        curatedResources: [
          {
            title: 'FIDO Alliance UX Guidelines for Passkeys & Biometrics',
            type: 'documentation',
            searchQueryOrUrl: 'https://fidoalliance.org/ux-guidelines/',
            description: 'Industry-standard guidelines for designing biometric and passwordless authentication experiences.',
          },
          {
            title: 'GitHub: Security & Authentication UX Patterns',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Asecurity-ui+topic%3Aauthentication',
            description: 'Open source design patterns for multi-factor authentication and security dialogs.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you design security prompts so users do not experience "warning fatigue" and blindly tap "OK"?',
            idealAnswerKey: 'To combat warning fatigue: 1) Apply risk-based security so warnings only appear during truly anomalous actions (new beneficiary, large transfer) rather than on routine transactions, 2) Avoid generic copy; use specific contextual questions that address the exact fraud vector, and 3) Require an affirmative action that cannot be done on autopilot (e.g. typing the word "CONFIRM" or selecting the specific reason for transfer).',
            difficulty: 'Hard',
            explanation: 'Warning fatigue is the primary reason social engineering fraud succeeds against standard security prompts.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the purpose of "intentional friction" in financial user experience design?',
            options: [
              'To slow down the user during high-risk or irreversible actions, ensuring deliberate confirmation and preventing catastrophic mistakes.',
              'To artificially extend session time metrics to show investors higher engagement.',
              'To make the application harder for elderly users to navigate.',
              'To reduce backend server load by delaying API calls.',
            ],
            correctAnswerIndex: 0,
            explanation: 'Intentional friction forces cognitive reflection before committing irrevocable financial transfers.',
          },
        ],
        completionCriteria: [
          'Design interactive Slide-to-Confirm component with spring animation in Figma',
          'Document adaptive authentication decision tree for high-risk financial transfers',
        ],
      },
    },
    {
      id: 'ms-ux-7',
      title: 'Regulatory Accessibility (WCAG 2.2 AA) & Inclusive Banking',
      category: 'core-skill',
      phaseId: 'phase-3',
      estimatedHours: 30,
      prerequisiteIds: ['ms-ux-5'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Access to financial services is a fundamental human necessity. Furthermore, regulatory frameworks (ADA in the US, European Accessibility Act in the EU) legally mandate WCAG 2.2 AA compliance for digital banking. Designing accessible tap targets, focus states, and screen reader announcements ensures equal access for all users.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Audit and design interfaces meeting WCAG 2.2 AA standards (color contrast, tap targets, focus rings).',
          'Structure screen reader announcements for complex financial balance tables and real-time alerts.',
          'Design accessible keyboard navigation flows with visible focus indicators and skip links.',
        ],
        learningOutcomes: [
          'Verify minimum 4.5:1 text contrast and 3:1 UI component contrast across all screens.',
          'Ensure all interactive elements provide minimum 44x44 CSS pixel touch target areas.',
          'Annotate Figma designs with explicit accessibility specifications for engineering handoff.',
        ],
        topics: [
          {
            title: 'WCAG 2.2 Principles & Legal Mandates in FinTech',
            subtopics: ['The 4 principles: Perceivable, Operable, Understandable, Robust', 'European Accessibility Act (EAA 2025) banking requirements', 'Minimum touch target size (44x44px mobile / 24x24px desktop target size)'],
          },
          {
            title: 'Screen Readers & Assistive Technology in Banking',
            subtopics: ['How TalkBack and VoiceOver read currency amounts and balance changes', 'Accessible name calculation for iconography and icon buttons', 'Accessible form error announcement and focus management', 'Figma accessibility annotation kits'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux7-1',
            title: 'Auditing Contrast & Annotating Accessibility in Figma',
            durationMinutes: 50,
            explanation: 'Accessibility is not an afterthought added by developers. Designers must verify contrast ratios during Figma authoring and provide explicit annotations for screen reader labels, focus order, and ARIA live regions.',
            studySteps: [
              'Audit color palette using Stark or Contrast plugins, checking normal text (4.5:1) and large text (3:1).',
              'Inspect tap targets on mobile layouts ensuring 44x44px bounding boxes.',
              'Create accessibility annotation stickers indicating focus order and VoiceOver labels.',
            ],
            practiceActivity: 'Audit an existing banking screen, fix 5 contrast and tap target violations, and produce a fully annotated accessibility specification.',
            completionCriteria: 'Screen achieves 100% WCAG 2.2 AA passing score with documented accessibility annotations.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux7-1',
            title: 'Accessible Banking Form Error State',
            difficulty: 'Intermediate',
            instructions: 'Design an accessible credit card input form with error states that communicate invalid card numbers using color, clear inline text, error icons, and programmatic aria-describedby associations.',
            hints: ['Do not rely solely on red border; provide a persistent error message with an icon.'],
            solutionOverview: 'Form includes high-contrast error banner, inline field messages, and explicit keyboard focus indicators.',
          },
        ],
        weekendProject: {
          title: 'Inclusive Banking Component Audit & Accessibility Specification',
          description: 'Conduct a thorough WCAG 2.2 AA accessibility audit of 6 core banking components (Account Card, Transaction Item, Input Field, Currency Keypad, Confirmation Modal, Alert Banner) and produce an engineering handoff specification sheet.',
          deliverables: [
            'Figma accessibility audit file documenting contrast scores for every state',
            'Full accessibility annotation overlay showing tab focus order and VoiceOver announcements',
            'Remediated component set guaranteeing 44x44px minimum tap targets',
          ],
          estimatedHours: 12,
          tasks: [
            'Measure contrast ratios across default, hover, active, and disabled component states',
            'Ensure all touch targets meet 44x44px requirement with invisible padding boxes if needed',
            'Write VoiceOver / TalkBack announcements for currency values (e.g. "Plus forty-two dollars and fifty cents")',
            'Document keyboard tab order and focus ring specifications',
          ],
          acceptanceCriteria: [
            'Zero contrast violations under WCAG 2.2 AA evaluation',
            'All icon-only buttons include explicit accessible label annotations',
          ],
        },
        curatedResources: [
          {
            title: 'W3C Web Content Accessibility Guidelines (WCAG) 2.2',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.w3.org/TR/WCAG22/',
            description: 'The official international standard for digital web accessibility.',
          },
          {
            title: 'A11y Project: Accessibility Checklist',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.a11yproject.com/checklist/',
            description: 'Community-driven practical checklist for designing accessible digital products.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you design a financial screen so that a visually impaired user using a screen reader understands when their account balance updates in real time?',
            idealAnswerKey: 'To notify screen reader users of live balance updates without disrupting their current reading flow, we annotate the balance container with an ARIA live region (aria-live="polite"). Setting it to polite ensures the screen reader waits until the user pauses before announcing the update (e.g. "Balance updated: \$1,420.50"). We avoid aria-live="assertive", which would aggressively interrupt the user mid-sentence.',
            difficulty: 'Hard',
            explanation: 'Understanding ARIA live regions demonstrates genuine expertise in assistive technology design.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the minimum WCAG 2.2 AA contrast ratio required for normal body text against its background?',
            options: ['4.5:1', '3:1', '7:1', '2:1'],
            correctAnswerIndex: 0,
            explanation: 'WCAG 2.2 AA mandates a minimum contrast ratio of 4.5:1 for normal text (under 18pt regular or under 14pt bold).',
          },
        ],
        completionCriteria: [
          'Pass WCAG 2.2 AA contrast audit across all mobile banking components',
          'Author accessibility annotation sheet detailing focus order and screen reader labels',
        ],
      },
    },
    {
      id: 'ms-ux-8',
      title: 'High-Fidelity Interactive Prototyping & Micro-Interactions',
      category: 'core-skill',
      phaseId: 'phase-4',
      estimatedHours: 35,
      prerequisiteIds: ['ms-ux-6', 'ms-ux-7'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'Static wireframes cannot communicate the tactile feeling of a banking app. Designing high-fidelity interactive prototypes with realistic spring physics, micro-interactions, and sound/haptic cues is what separates top-tier FinTech apps from clunky legacy banking software.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Build advanced interactive prototypes in Figma / ProtoPie with realistic animation curves.',
          'Design delightful micro-interactions: card flipping, payment completion checkmarks, and balance counters.',
          'Respect accessibility preferences by supporting prefers-reduced-motion.',
        ],
        learningOutcomes: [
          'Construct advanced Figma prototypes using variables, conditional logic, and component states.',
          'Design physics-based micro-interactions with natural spring easing curves.',
          'Simulate realistic mobile banking workflows for stakeholders and user testing participants.',
        ],
        topics: [
          {
            title: 'Interactive Prototyping Mechanics',
            subtopics: ['Smart Animate matching rules and layer naming hygiene', 'Figma prototyping variables and conditional logic (if balance > amount)', 'ProtoPie / Principle for advanced sensor input and multi-touch gestures'],
          },
          {
            title: 'Micro-Interactions & Motion Design',
            subtopics: ['Functional micro-interactions: pull-to-refresh, payment success checkmarks, card CVV flip', 'Easing curves: cubic bezier vs spring physics', 'Accessibility: respects prefers-reduced-motion media query'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux8-1',
            title: 'Smart Animate & Conditional Variables in Figma',
            durationMinutes: 55,
            explanation: 'Figma variables allow prototypes to calculate real numbers. When a user sends \$50 in a prototype, the variable deducts \$50 from the balance and displays the new balance dynamically, producing unprecedented realism in usability testing.',
            studySteps: [
              'Create numeric variables for accountBalance and transferAmount.',
              'Add conditional logic to the Send button: if balance >= amount, deduct and navigate to success screen.',
              'Animate the success checkmark using Smart Animate with bouncy spring easing.',
            ],
            practiceActivity: 'Build a working peer-to-peer payment prototype where typing an amount subtracts it from an interactive balance card.',
            completionCriteria: 'Prototype functions dynamically with variable calculations and smooth Smart Animate transitions.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux8-1',
            title: 'Virtual Debit Card 3D Flip Micro-Interaction',
            difficulty: 'Intermediate',
            instructions: 'Create an interactive virtual debit card prototype where tapping "Show CVV" smoothly flips the card 180 degrees using Smart Animate to reveal security code and card details.',
            hints: ['Ensure back and front card layers share matching naming structures for Smart Animate interpolation.'],
            solutionOverview: 'Dual card layers interpolate horizontally with subtle perspective scaling to simulate realistic physical flip.',
          },
        ],
        weekendProject: {
          title: 'High-Fidelity Neo-Bank Mobile Experience Prototype',
          description: 'Construct a fully interactive, clickable mobile app prototype for a neo-bank featuring live balance calculation, card management (freeze/unfreeze), and an interactive peer-to-peer payment flow.',
          deliverables: [
            'Figma interactive prototype link demonstrating conditional variables and Smart Animate',
            'Micro-interaction choreography video detailing easing curves and timing specs (ms)',
            'Design handoff documentation for front-end motion developers',
          ],
          estimatedHours: 16,
          tasks: [
            'Set up prototype variables for account balance, card lock state, and contact list',
            'Build card freeze/unfreeze toggle with tactile toggle animation and color shift',
            'Implement money transfer flow with working numeric keypad and variable math',
            'Choreograph payment completion celebration with animated checkmark and tactile spring easing',
          ],
          acceptanceCriteria: [
            'Prototype handles both valid transfer and insufficient funds conditional branches',
            'All transition timings stay between 200ms and 400ms for responsive feel',
          ],
        },
        curatedResources: [
          {
            title: 'Microinteractions: Full Color Edition by Dan Saffer',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.oreilly.com/library/view/microinteractions/9781449342678/',
            description: 'The authoritative guide to designing functional, delightful interface details and feedback loops.',
          },
          {
            title: 'GitHub: UI Animation & Prototyping Patterns',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Aprototyping+topic%3Afigma+topic%3Aanimation',
            description: 'Open source interactive prototype kits and motion specifications.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you ensure that delightful micro-interactions and animations do not cause motion sickness or frustration for users with vestibular disorders?',
            idealAnswerKey: 'Delightful micro-interactions must always respect user accessibility preferences. For users with vestibular disorders, motion like parallax, zooming, or spinning causes physical nausea. We address this by: 1) Designing a reduced-motion alternative that replaces movement with simple opacity cross-fades, and 2) Documenting the prefers-reduced-motion CSS media query in engineering specs so animations automatically disable when the user has enabled reduced motion in their OS settings.',
            difficulty: 'Medium',
            explanation: 'Accessibility includes cognitive and vestibular considerations as well as vision.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the recommended duration range for functional micro-interactions in a mobile application?',
            options: ['200ms to 400ms', '1000ms to 2000ms', '50ms to 100ms', '3000ms to 5000ms'],
            correctAnswerIndex: 0,
            explanation: 'Animations between 200ms and 400ms feel snappy and responsive without lagging behind user intent.',
          },
        ],
        completionCriteria: [
          'Build interactive Figma prototype with conditional variables and math logic',
          'Choreograph micro-interaction with documented spring easing specifications',
        ],
      },
    },
    {
      id: 'ms-ux-9',
      title: 'Usability Testing, Quantitative UX Metrics & Engineering Handoff',
      category: 'tooling',
      phaseId: 'phase-4',
      estimatedHours: 30,
      prerequisiteIds: ['ms-ux-8'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'A design is only as good as its proven performance with real users. Running moderated and unmoderated usability testing with quantitative benchmarks (System Usability Scale, Task Success Rate, Time on Task) provides empirical proof of design ROI before code is written.',
        difficultyLevel: 'Intermediate',
        learningObjectives: [
          'Plan and execute moderated usability test protocols on interactive prototypes.',
          'Measure quantitative usability metrics: Task Success Rate, Time on Task, and SUS score.',
          'Prepare pixel-perfect design specifications and token documentation for engineering handoff.',
        ],
        learningOutcomes: [
          'Conduct 5 moderated usability testing sessions and synthesize critical blocker trends.',
          'Calculate System Usability Scale (SUS) scores and compare against industry benchmarks (68 average).',
          'Deliver comprehensive Figma Dev Mode handoff files with component states and redlines.',
        ],
        topics: [
          {
            title: 'Usability Testing Protocols & Quantitative Metrics',
            subtopics: ['Moderated vs unmoderated testing with Maze / UserTesting', 'Formulating task-based testing prompts without coaching the user', 'Metrics: Task Success Rate, Time on Task, Single Ease Question (SEQ), SUS score'],
          },
          {
            title: 'Developer Handoff & Design QA',
            subtopics: ['Figma Dev Mode annotations, measurements, and asset export', 'Documenting edge cases, empty states, and error codes for developers', 'Conducting design QA audits on staging builds before production shipping'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux9-1',
            title: 'Usability Test Execution & SUS Benchmark Calculation',
            durationMinutes: 50,
            explanation: 'Running usability tests with 5 users uncovers approximately 85% of usability defects. Calculating the System Usability Scale (10-question standardized questionnaire) provides an objective benchmark for stakeholder buy-in.',
            studySteps: [
              'Draft a testing script with 3 core financial tasks (Send Money, Freeze Card, View Statement).',
              'Observe participants think aloud without providing hints or leading assistance.',
              'Administer the 10-item SUS questionnaire and compute normalized score out of 100.',
            ],
            practiceActivity: 'Conduct a usability test of your transfer prototype with 3 participants, record task completion times, and calculate average SUS score.',
            completionCriteria: 'Test report details task completion rates, identifies top 3 usability blockers, and scores SUS benchmark.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux9-1',
            title: 'Engineering Handoff Specification Sheet',
            difficulty: 'Intermediate',
            instructions: 'Create a Figma engineering handoff frame for an Account Balance Card documenting Auto-Layout padding, font styles, token mappings, and empty/loading states.',
            hints: ['Include explicit component redlines and token names.'],
            solutionOverview: 'Handoff frame details spacing specs, responsive behavior, token bindings, and edge case states.',
          },
        ],
        weekendProject: {
          title: 'Usability Evaluation & Design Handoff Package',
          description: 'Execute a full usability evaluation cycle on a FinTech money transfer flow, synthesize quantitative metrics into an executive findings report, and deliver production-ready Dev Mode handoff documentation.',
          deliverables: [
            'Usability test report with task success rates, SUS scores, and prioritized severity matrix',
            'Video highlight reel demonstrating user friction moments and behavioral breakdowns',
            'Figma Dev Mode handoff file with component state matrix and accessibility annotations',
          ],
          estimatedHours: 14,
          tasks: [
            'Create usability test plan and script for money transfer workflow',
            'Conduct testing with 5 participants and record task metrics',
            'Calculate SUS score and categorize usability findings by Nielsen severity (1 to 4)',
            'Prepare Figma Dev Mode handoff file with detailed engineering annotations',
          ],
          acceptanceCriteria: [
            'Report includes quantitative metrics: Success Rate %, Average Time on Task, and SUS score',
            'All severity 3 and 4 usability blockers paired with validated redesign solutions',
          ],
        },
        curatedResources: [
          {
            title: 'Measuring the User Experience by Tullis and Albert',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.sciencedirect.com/book/9780124157811/measuring-the-user-experience',
            description: 'The definitive guide to collecting, analyzing, and presenting usability metrics.',
          },
          {
            title: 'Figma Dev Mode: Official Guide to Developer Handoff',
            type: 'documentation',
            searchQueryOrUrl: 'https://help.figma.com/hc/en-us/articles/15023124642203-Guide-to-Dev-Mode',
            description: 'Comprehensive guide to inspecting designs, token code generation, and developer handoff.',
          },
        ],
        interviewChallenges: [
          {
            question: 'How do you handle a situation where engineering says a proposed micro-interaction or design detail is too complex to implement within the sprint?',
            idealAnswerKey: 'Designers must be pragmatic partners to engineering. When engineering flags technical complexity: 1) Understand the root constraint (rendering overhead, library limitations, API latency), 2) Propose phased compromises: identify what is essential for usability versus what is visual polish, and 3) Offer an MVP alternative that achieves the core user feedback while planning the refined motion for a subsequent iteration.',
            difficulty: 'Medium',
            explanation: 'Cross-functional collaboration and pragmatic compromise are essential senior designer qualities.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is considered the average industry baseline score for the System Usability Scale (SUS)?',
            options: ['68 out of 100', '90 out of 100', '50 out of 100', '75 out of 100'],
            correctAnswerIndex: 0,
            explanation: 'A SUS score of 68 represents the 50th percentile (average); scores above 80 represent excellent usability.',
          },
        ],
        completionCriteria: [
          'Conduct usability test and compute quantitative Task Success Rate and SUS score',
          'Deliver Figma Dev Mode handoff file with complete token and state annotations',
        ],
      },
    },
    {
      id: 'ms-ux-10',
      title: 'Production Capstone: Autonomous Neo-Bank Wealth Management Platform',
      category: 'capstone',
      phaseId: 'phase-4',
      estimatedHours: 45,
      prerequisiteIds: ['ms-ux-9'],
      status: 'locked',
      isKnown: false,
      actionableData: {
        whyItMatters: 'This capstone represents the culmination of your FinTech design education. You will architect an end-to-end modern neo-bank and autonomous wealth management platform covering mobile and desktop experiences, design systems, data visualization, accessibility, and security friction.',
        difficultyLevel: 'Advanced',
        learningObjectives: [
          'Design an enterprise-grade neo-bank and wealth management mobile/web platform from discovery to final handoff.',
          'Synthesize all 9 prior milestones into a production-grade portfolio case study.',
          'Demonstrate mastery in Figma Auto-Layout, design tokens, data visualization, and accessibility.',
        ],
        learningOutcomes: [
          'Deliver an industry-ready portfolio case study demonstrating deep FinTech domain expertise.',
          'Present interactive prototypes showcasing real-time data scrubbing, biometric security, and transfers.',
          'Defend design decisions using behavioral psychology, accessibility regulations, and usability metrics.',
        ],
        topics: [
          {
            title: 'End-to-End FinTech Product Architecture',
            subtopics: ['Unified mobile (iOS/Android) and responsive web dashboard experience', 'Multi-tier account ecosystem (Checking, High-Yield Savings, Automated Stock Portfolios, Crypto Vaults)', 'Contextual AI financial assistant & automated spending categorization'],
          },
          {
            title: 'Portfolio Presentation & Case Study Storytelling',
            subtopics: ['Structuring a winning UX design case study (Problem, Research, Iteration, Solution, Metrics)', 'Creating compelling video walkthroughs and interactive prototype links', 'Defending design trade-offs in senior product design interviews'],
          },
        ],
        lessons: [
          {
            id: 'lesson-ux10-1',
            title: 'End-to-End Neo-Bank Product Synthesis & Case Study Architecture',
            durationMinutes: 60,
            explanation: 'Senior FinTech designers are evaluated on product thinking, not just pretty Dribbble shots. A compelling case study tells the story of real user friction, business goals, regulatory constraints, iterative research, and measurable outcomes.',
            studySteps: [
              'Define product vision: autonomous wealth management app helping young professionals save and invest automatically.',
              'Design core flows: Onboarding & KYC, Portfolio Performance & Scrubbing, Instant Peer Transfers, Security Settings.',
              'Author a comprehensive case study article detailing research insights and usability metrics.',
            ],
            practiceActivity: 'Assemble final case study portfolio deck with prototype embeds, component token breakdowns, and usability test metrics.',
            completionCriteria: 'Case study clearly communicates problem statement, research methodology, design token system, and verified user test results.',
          },
        ],
        practicalExercises: [
          {
            id: 'ex-ux10-1',
            title: 'Portfolio Case Study Outline',
            difficulty: 'Advanced',
            instructions: 'Write a comprehensive case study outline for your capstone project including Context, Problem Statement, Research Insights, Design System Architecture, Key Flows, and Usability Metrics.',
            hints: ['Structure using the STAR method (Situation, Task, Action, Result).'],
            solutionOverview: 'Outline articulates clear user problem, research data, iterative prototyping, and quantitative SUS improvements.',
          },
        ],
        weekendProject: {
          title: 'Autonomous Neo-Bank Wealth Management Platform (Complete Capstone)',
          description: 'A complete end-to-end design system and interactive product experience for an autonomous neo-bank mobile application and companion web dashboard, including onboarding, live portfolio charts, peer transfers, and security controls.',
          deliverables: [
            'Figma design system library with 20+ components, semantic light/dark tokens, and accessibility specs',
            'Interactive mobile prototype covering Onboarding, Portfolio Tracking, and Money Transfer flows',
            'Comprehensive written case study article ready for publication on personal portfolio or Medium',
          ],
          estimatedHours: 24,
          tasks: [
            'Architect scalable design system in Figma with semantic variable collections',
            'Design mobile KYC onboarding flow with document scan and biometric prompts',
            'Build interactive investment portfolio dashboard with scrubbing area charts',
            'Design multi-step money transfer flow with anti-scam checks and slide-to-pay confirmation',
            'Conduct usability testing with 5 users, score SUS, and document findings in case study',
          ],
          acceptanceCriteria: [
            'All 10 roadmap milestones proven in final designs',
            '100% WCAG 2.2 AA compliant across all screens and components',
            'Interactive prototype functions with realistic variable logic and spring transitions',
            'Portfolio case study clearly articulates business and user impact',
          ],
        },
        curatedResources: [
          {
            title: 'Case Study Club: Top Product Design Case Studies',
            type: 'documentation',
            searchQueryOrUrl: 'https://www.casestudy.club',
            description: 'Curated collection of the worlds best UX design portfolio case studies.',
          },
          {
            title: 'GitHub: Production FinTech Design Systems',
            type: 'github_search',
            searchQueryOrUrl: 'https://github.com/search?q=topic%3Adesign-system+topic%3Afintech+topic%3Afigma',
            description: 'Open source enterprise FinTech design system files and component specifications.',
          },
        ],
        interviewChallenges: [
          {
            question: 'Walk me through your Neo-Bank capstone project. What was the most challenging trade-off you had to make between user simplicity, regulatory compliance, and business security?',
            idealAnswerKey: 'In designing the instant transfer flow, the primary conflict was between the business goal of low friction and regulatory anti-fraud requirements. To resolve this, I implemented an adaptive friction model: transfers to established payees under \$200 complete in two taps with Face ID, while transfers to new payees or amounts exceeding \$1,000 trigger an affirmative scam verification modal and a Slide-to-Confirm gesture. In usability testing, this reduced perceived anxiety by 42% while preserving quick transfers for routine spending.',
            difficulty: 'Hard',
            explanation: 'This answer demonstrates mastery of behavioral finance, risk mitigation, and empirical design validation.',
          },
        ],
        quizQuestions: [
          {
            question: 'What distinguishes an exceptional FinTech UX design case study from an ordinary visual design portfolio?',
            options: [
              'It articulates business objectives, user research data, regulatory constraints, and measurable usability test outcomes rather than just polished visual screens.',
              'It includes at least 100 unorganized screen mockups.',
              'It uses only 3D isometric mockup renders.',
              'It hides the wireframes and research notes.',
            ],
            correctAnswerIndex: 0,
            explanation: 'Senior hiring managers hire problem solvers who demonstrate end-to-end design thinking, business context, and validated user outcomes.',
          },
        ],
        completionCriteria: [
          'Complete and publish high-fidelity interactive neo-bank prototype in Figma',
          'Publish comprehensive portfolio case study demonstrating all 10 roadmap milestones',
        ],
      },
    },
  ],
};
