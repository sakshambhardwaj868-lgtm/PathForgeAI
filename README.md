# PathForge AI — Reverse-Engineered Career Roadmapper
**Hackathon Track:** Problem Statement 1 (Reverse-Engineered Career Roadmapper)

---

## 1. What It Does
PathForge AI is an interactive, visual career roadmap platform that reverse-engineers hyper-specific dream engineering jobs (such as *"Full Stack Developer at a Climate Tech Startup"* or *"Infrastructure Engineer in Quantitative Finance"*) into living, interactive skill trees. Built around a directed acyclic graph (DAG) canvas powered by structured Generative AI, it provides concrete weekend portfolio project specifications, curated GitHub search topics, domain-specific interview challenges, and a deterministic re-routing engine that dynamically recalculates preparation timelines when milestones are marked as known.

---

## 2. Done / Left / Plan
- **Done (Phase 1):**
  - Clean project scaffolding in dedicated repository (`client/`, `server/`, `shared/`).
  - Full TypeScript data contracts with decoupled non-destructive node states (`'locked' | 'available' | 'completed' | 'completed_with_warning'`).
  - Node.js + Express API setup with Zod environment validation and security middleware.
  - Verified `GET /api/v1/health` endpoint and clean production builds for frontend and backend.
- **Left:**
  - Phase 2: Generative AI orchestration with Gemini 2.5 Flash and strict DAG validation (cycle detection, dependency checking).
  - Phase 3: Interactive React Flow DAG canvas with Dagre auto-layout.
  - Phase 4: Actionable milestone drawer with project specs, repos, and interview challenges.
  - Phase 5: Deterministic client-side re-planning engine with non-destructive progress preservation.
  - Phase 6: Input command center, live vs cached indicator badge, and HUD metrics.
  - Phase 7: Mobile touch optimization, security audit, and deployment.
- **Plan:** Execute remaining phases sequentially with acceptance criteria and testing checkpoints.

---

## 3. Architecture and Why
- **Frontend (Client):** React 18 with Vite and TypeScript for rapid development and fast HMR; Tailwind CSS for modern dark-mode styling; `@xyflow/react` (React Flow v12) for rendering directed graph canvases with zoom, pan, and minimap; Dagre for collision-free hierarchical layout.
- **Backend (Server):** Node.js and Express in TypeScript for shared data contracts; Zod for strict runtime schema validation; Helmet and CORS for security; server-side API key isolation.
- **Generative AI:** Google Gemini 2.5 Flash utilizing native structured JSON schema mode (`responseSchema`) with low temperature (0.2) and resilient offline fallback datasets.
- **Persistence:** Local-first architecture (`localStorage`) ensuring instant evaluation without database friction or authentication barriers.

---

## 4. What We Added
- **Decoupled Non-Destructive Re-Planning:** Marking a skill as known preserves completion status even if an upstream prerequisite is unchecked, displaying clear dependency warning indicators without erasing user work.
- **Actionable Weekend Project Specifications:** Every milestone generates a practical weekend project challenge with concrete deliverables to prove competence.
- **Safe Search-Anchored Resources:** Instead of hallucinated repository URLs, links resolve to verified, parameterized GitHub search topics and official documentation.
- **Transparent Source Indicator:** Clearly tags whether the loaded roadmap originates from live AI synthesis or verified offline cached datasets.

---

## 5. How to Run It
### Prerequisites
- Node.js v20+ and npm 10+

### Setup Steps
1. Clone repository and install dependencies:
   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

2. Configure environment:
   ```bash
   cp server/.env.example server/.env
   # Add your GEMINI_API_KEY in server/.env (optional for offline testing)
   ```

3. Run development servers:
   ```bash
   # From root directory:
   npm run dev:server  # Runs API on http://localhost:5000
   npm run dev:client  # Runs UI on http://localhost:5173
   ```

4. Verify health:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```

---

## 6. Tools and AI Used
- **Libraries & Frameworks:** React 18, Vite, TypeScript, Tailwind CSS, `@xyflow/react` (React Flow v12), `@dagrejs/dagre`, Zustand, Express, Zod, Helmet, Cors, Lucide React.
- **AI Models:** Google Gemini 2.5 Flash (`gemini-2.5-flash`).
- **AI Disclosure:** All career roadmaps, milestone breakdowns, weekend projects, and interview questions are synthesized by Generative AI and validated via server-side schemas. Transparent badges indicate when live AI vs cached data is rendered.

---

## 7. Who It Is For
PathForge AI is designed for college students, placement candidates, and career switchers who need a clear, non-generic, actionable roadmap to land hyper-specific dream roles in competitive tech sectors. Users return to track their progress, build concrete portfolio projects, and adapt their preparation timelines as they master new skills.
