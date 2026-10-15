import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoadmapPromptBar } from '../components/common/RoadmapPromptBar';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useAuthStore } from '../store/useAuthStore';
import { CareerRoadmap } from '../types/roadmap';

describe('Phase 9 — Universal Career Search Component Tests', () => {
  const sampleRoadmap: CareerRoadmap = {
    id: 'rm-universal-custom',
    targetRole: 'Data Scientist & ML Engineer',
    targetCompanyType: 'Innovative Tech Company',
    experienceLevel: 'Intermediate',
    weeklyCommitmentHours: 20,
    totalEstimatedWeeks: 14,
    source: 'live_ai',
    modelUsed: 'gemini-flash-lite-latest',
    phases: [
      { id: 'p1', title: 'Data Foundations', description: 'Pandas & SQL', order: 1 },
      { id: 'p2', title: 'Machine Learning', description: 'Scikit-Learn & PyTorch', order: 2 },
    ],
    intermediateRoles: [
      { title: 'Junior Data Analyst', estimatedTimelineMonth: 3, description: 'EDA and visualization' },
    ],
    edges: [{ id: 'e1', source: 'ms-1', target: 'ms-2' }],
    createdAt: '2026-10-15T00:00:00.000Z',
    milestones: [
      {
        id: 'ms-1',
        title: 'Exploratory Data Analysis & Statistics',
        category: 'foundation',
        phaseId: 'p1',
        estimatedHours: 20,
        prerequisiteIds: [],
        status: 'available',
        isKnown: false,
        actionableData: {
          whyItMatters: 'Statistical foundations enable accurate hypothesis testing.',
          difficultyLevel: 'Intermediate',
          learningObjectives: ['Clean unstructured datasets', 'Perform A/B testing calculations'],
          learningOutcomes: ['Calculate p-values', 'Build Seaborn charts'],
          topics: [{ title: 'Hypothesis Testing', subtopics: ['Null hypothesis', 'Confidence intervals'] }],
          lessons: [],
          practicalExercises: [],
          weekendProject: {
            title: 'Customer Churn Analysis',
            description: 'Identify leading predictors of churn in SaaS subscriptions.',
            deliverables: ['Jupyter notebook', 'Executive summary'],
            estimatedHours: 8,
          },
          curatedResources: [],
          interviewChallenges: [],
          quizQuestions: [],
          completionCriteria: ['Complete churn notebook'],
        },
      },
      {
        id: 'ms-2',
        title: 'Supervised Learning & Model Tuning',
        category: 'core-skill',
        phaseId: 'p2',
        estimatedHours: 25,
        prerequisiteIds: ['ms-1'],
        status: 'locked',
        isKnown: false,
        actionableData: {
          whyItMatters: 'Production model tuning drives predictive accuracy.',
          difficultyLevel: 'Intermediate',
          learningObjectives: ['Tune hyperparameters with Optuna', 'Implement cross-validation'],
          learningOutcomes: ['Prevent data leakage', 'Deploy XGBoost models'],
          topics: [{ title: 'Gradient Boosting', subtopics: ['XGBoost', 'LightGBM'] }],
          lessons: [],
          practicalExercises: [],
          weekendProject: {
            title: 'End-to-End Prediction Pipeline',
            description: 'Train and serialize a gradient boosted classifier.',
            deliverables: ['Scikit-learn pipeline', 'Model artifact'],
            estimatedHours: 10,
          },
          curatedResources: [],
          interviewChallenges: [],
          quizQuestions: [],
          completionCriteria: ['Deploy model pipeline'],
        },
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useRoadmapStore.setState({
      roadmap: null,
      isLoading: false,
      error: null,
      isReadOnly: false,
      lastAttemptedInput: null,
    });
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it('renders prominent search input with correct placeholder and controls', () => {
    render(<RoadmapPromptBar />);

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('maxLength', '100');

    // Experience Level and Study Hours
    expect(screen.getByLabelText(/Experience Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weekly Study Commitment/i)).toBeInTheDocument();

    // Generate Roadmap button
    const generateBtn = screen.getByRole('button', { name: /Generate Roadmap/i });
    expect(generateBtn).toBeInTheDocument();

    // Quick suggestions preset pills
    expect(screen.getByText(/Quick Suggestions:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Climate Tech Full Stack/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fintech UI\/UX Designer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generative AI Engineer/i })).toBeInTheDocument();
  });

  it('allows typing any custom career goal into the search input', () => {
    render(<RoadmapPromptBar />);

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    fireEvent.change(searchInput, { target: { value: 'Quantum Computing Architect' } });

    expect(searchInput).toHaveValue('Quantum Computing Architect');
  });

  it('submits search on Enter key press with correct parameters', async () => {
    const generateSpy = vi.fn().mockResolvedValue(true);
    useRoadmapStore.setState({ generateRoadmap: generateSpy });

    render(<RoadmapPromptBar />);

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    const levelSelect = screen.getByLabelText(/Experience Level/i);
    const hoursSelect = screen.getByLabelText(/Weekly Study Commitment/i);

    fireEvent.change(searchInput, { target: { value: 'DevOps & Site Reliability Engineer' } });
    fireEvent.change(levelSelect, { target: { value: 'Advanced' } });
    fireEvent.change(hoursSelect, { target: { value: '30' } });

    // Press Enter in search input
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith({
        targetRole: 'DevOps & Site Reliability Engineer',
        targetCompanyType: 'Innovative Tech Company',
        experienceLevel: 'Advanced',
        weeklyCommitmentHours: 30,
      });
    });
  });

  it('submits search on Generate Roadmap button click with correct parameters', async () => {
    const generateSpy = vi.fn().mockResolvedValue(true);
    useRoadmapStore.setState({ generateRoadmap: generateSpy });

    render(<RoadmapPromptBar />);

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    const levelSelect = screen.getByLabelText(/Experience Level/i);
    const hoursSelect = screen.getByLabelText(/Weekly Study Commitment/i);
    const generateBtn = screen.getByRole('button', { name: /Generate Roadmap/i });

    fireEvent.change(searchInput, { target: { value: 'Bioinformatics Pipeline Developer' } });
    fireEvent.change(levelSelect, { target: { value: 'Intermediate' } });
    fireEvent.change(hoursSelect, { target: { value: '20' } });

    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith({
        targetRole: 'Bioinformatics Pipeline Developer',
        targetCompanyType: 'Innovative Tech Company',
        experienceLevel: 'Intermediate',
        weeklyCommitmentHours: 20,
      });
    });
  });

  it('rejects empty input or whitespace and displays validation error', async () => {
    const generateSpy = vi.fn();
    useRoadmapStore.setState({ generateRoadmap: generateSpy });

    render(<RoadmapPromptBar />);

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    fireEvent.change(searchInput, { target: { value: '   ' } });

    // Try submitting empty search via form
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Please enter a career goal/i)).toBeInTheDocument();
    });

    expect(generateSpy).not.toHaveBeenCalled();
  });

  it('rejects input shorter than 3 characters and displays validation error', async () => {
    const generateSpy = vi.fn();
    useRoadmapStore.setState({ generateRoadmap: generateSpy });

    render(<RoadmapPromptBar />);

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    fireEvent.change(searchInput, { target: { value: 'AI' } });

    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Career goal must be at least 3 characters long/i)).toBeInTheDocument();
    });

    expect(generateSpy).not.toHaveBeenCalled();
  });

  it('shows loading indicator and prevents duplicate submissions while loading', () => {
    const generateSpy = vi.fn();
    useRoadmapStore.setState({ isLoading: true, generateRoadmap: generateSpy });

    render(<RoadmapPromptBar />);

    const generateBtn = screen.getByRole('button', { name: /Generate Roadmap/i });
    expect(generateBtn).toBeDisabled();
    expect(screen.getByText(/Generating Roadmap\.\.\./i)).toBeInTheDocument();

    // Trying to click while loading should not trigger submission
    fireEvent.click(generateBtn);
    expect(generateSpy).not.toHaveBeenCalled();
  });

  it('selecting a quick suggestion preset populates input and triggers generation', async () => {
    const generateSpy = vi.fn().mockResolvedValue(true);
    useRoadmapStore.setState({ generateRoadmap: generateSpy });

    render(<RoadmapPromptBar />);

    const aiPresetBtn = screen.getByRole('button', { name: /Generative AI Engineer/i });
    fireEvent.click(aiPresetBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith({
        targetRole: 'Generative AI Systems Engineer',
        targetCompanyType: 'Autonomous Agent Platform',
        experienceLevel: 'Advanced',
        weeklyCommitmentHours: 25,
      });
    });

    const searchInput = screen.getByPlaceholderText(/Search any career, e\.g\. Data Scientist, Cloud Architect, Cybersecurity Engineer/i);
    expect(searchInput).toHaveValue('Generative AI Systems Engineer');
  });

  it('displays accurate live AI badge metadata when live roadmap is loaded', () => {
    useRoadmapStore.setState({ roadmap: sampleRoadmap });

    render(<RoadmapPromptBar />);

    expect(screen.getByText(/Source: Live AI \(gemini-flash-lite-latest\)/i)).toBeInTheDocument();
  });

  it('displays fallback badge metadata when cached fallback is loaded', () => {
    useRoadmapStore.setState({
      roadmap: {
        ...sampleRoadmap,
        source: 'cached_fallback',
        modelUsed: undefined,
      },
    });

    render(<RoadmapPromptBar />);

    expect(screen.getByText(/Source: Verified Fallback/i)).toBeInTheDocument();
  });

  it('displays inline error banner and allows retrying when backend error occurs', async () => {
    const generateSpy = vi.fn().mockResolvedValue(true);
    useRoadmapStore.setState({
      roadmap: sampleRoadmap,
      error: 'Upstream connection timed out. Please retry.',
      generateRoadmap: generateSpy,
    });

    render(<RoadmapPromptBar />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Upstream connection timed out\. Please retry\./i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalled();
    });
  });
});
