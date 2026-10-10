# PathForge AI 🚀
### Reverse-Engineered Career Roadmapper

**Problem Statement #1 — Hackathon**

PathForge AI transforms a student's specific career goal into an interactive, personalized roadmap with connected skill milestones, actionable projects, learning resources, and interview preparation. Students can track progress, mark skills as already known, and adapt their learning plan to their available study time.

## 🎯 The Problem

Most career advice is generic. Students often don't know which skills to learn first, which projects to build, or how to prepare for a particular role at a particular type of company.

## 💡 Our Solution

PathForge AI helps students work backward from their dream job to a structured learning path.

### Key Features

- **AI-powered roadmaps:** Generate career paths from a user's specific career objective.
- **Interactive skill graph:** Explore milestones through a visual graph with zoom, pan, and clickable nodes.
- **Actionable milestones:** View learning objectives, weekend projects, deliverables, learning resources, and interview questions.
- **Dynamic replanning:** Mark skills as known or completed and update the remaining learning plan.
- **Progress tracking:** Track completed skills, remaining effort, and estimated study timeline.
- **User accounts and cloud storage:** Register, sign in, and save roadmaps using MongoDB Atlas.
- **Roadmap sharing:** Create shareable, read-only roadmap links.
- **Offline fallback:** Open a verified sample roadmap when live generation or network connectivity is unavailable.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Interactive graph | React Flow (`@xyflow/react`), Dagre |
| State management | Zustand |
| Backend | Node.js, Express, TypeScript |
| AI | Google Gemini API |
| Validation | Zod |
| Database | MongoDB Atlas |
| Authentication | Password hashing, JWT-based authentication |
| Testing | Vitest and backend automated tests |

## 🏗️ Architecture and Why

1. **React + Vite:** Provides a responsive frontend and a fast development environment.
2. **React Flow + Dagre:** Displays career milestones as a connected graph and automatically arranges the nodes.
3. **Node.js + Express:** Handles API requests, roadmap generation, authentication, saving, and sharing.
4. **Gemini API:** Generates roadmap content based on the user's career goal and preferences.
5. **Zod:** Validates request and roadmap data to reduce malformed-input and invalid-data issues.
6. **MongoDB Atlas:** Stores user accounts and saved roadmaps in the cloud.
7. **Zustand:** Manages roadmap and progress state in the frontend.

The browser communicates with the backend, which handles AI requests and database operations. The Gemini API key and database credentials must remain on the server, never in frontend code.

## ✅ Done / Left / Plan

### Done

- Interactive career roadmap canvas and milestone detail panel.
- Roadmap progress tracking and dynamic replanning.
- Learning objectives, project deliverables, resources, and interview preparation.
- Backend roadmap-generation and validation flow.
- Offline fallback datasets and improved error handling.
- Authentication, roadmap persistence, and sharing features implemented in the codebase.
- Automated tests and production builds reported as passing during development.

### Left

- Complete end-to-end testing of the full user journey.
- Verify live AI generation, authentication, cloud saving, and shared links in the browser.
- Test mobile responsiveness, error handling, and deployment configuration.
- Deploy the frontend and backend publicly and verify the production environment.

### Plan

1. Test the complete application locally.
2. Resolve any remaining functional or UI issues.
3. Deploy the frontend and backend.
4. Verify environment variables, database access, and API connectivity.
5. Update this README with the verified live URL and final test results.

## 🚀 How to Run Locally

### Prerequisites

- Node.js and npm
- A MongoDB Atlas database
- A Google Gemini API key for live AI generation

### 1. Clone the repository

```bash
git clone https://github.com/sakshambhardwaj868-lgtm/PathForgeAI.git
cd PathForgeAI
```

### 2. Install dependencies

Open a terminal in the project root and install dependencies in the relevant folders:

```bash
cd server
npm install
```

Open a **second terminal** in the project root:

```bash
cd client
npm install
```

### 3. Configure environment variables

Create `server/.env` using `server/.env.example` as a reference. Add the variables required by the server, including your Gemini API key, MongoDB connection string, and authentication secret.

Example format:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_long_random_secret
```

Use the exact variable names expected by the project configuration. Never commit real credentials or `.env` files.

### 4. Start the backend

In the server terminal:

```bash
npm run dev
```

Confirm that the server starts and connects to MongoDB successfully.

### 5. Start the frontend

In the client terminal:

```bash
npm run dev
```

Open the local URL printed by Vite, currently expected to be:

`http://localhost:5173`

### 6. Try the main workflow

1. Enter a specific career objective.
2. Choose your current skill level and weekly study hours.
3. Click **Synthesize Roadmap**.
4. Explore the graph and select a milestone.
5. Review the objectives, project deliverables, resources, and interview questions.
6. Mark skills as known or completed and inspect the updated progress.
7. Sign in to test cloud saving and create a shared roadmap link.

*Note: Confirm the environment-variable names, setup commands, and each workflow against the final code before submitting.*

## 🤖 Tools and AI Used

- **Google Gemini API:** Generates personalized career-roadmap content.
- **Antigravity IDE:** AI-assisted development and debugging.
- **React Flow and Dagre:** Interactive graph visualization and layout.
- **MongoDB Atlas:** Cloud database.
- **Git and GitHub:** Version control and source-code hosting.

AI-generated content is provided as career guidance and should be checked against official documentation and current job requirements. The interface should clearly identify AI-generated recommendations.

## 👥 Who Is It For?

- College students preparing for internships and placements.
- Beginners who need a structured path into software development or another technical career.
- Students preparing for specialized roles in fintech, AI, design, and full-stack development.
- Learners who need to organize study time, projects, and interview preparation.

PathForge AI aims to make career preparation more specific, actionable, and trackable than a generic list of courses.

## 👨‍💻 Team

**Team:** Nexora

- **Team Leader:** Saksham Bhardwaj
- **Team Member:** pankaj singh

## 🔗 Repository

[View PathForge AI on GitHub](https://github.com/sakshambhardwaj868-lgtm/PathForgeAI)

**Live Demo:** Add the verified public deployment URL after deployment.

---

*Built for the hackathon — Problem Statement #1: Reverse-Engineered Career Roadmapper.*
