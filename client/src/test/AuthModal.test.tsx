import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuthStore } from '../store/useAuthStore';

describe('AuthModal Component (Phase 6)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isAuthModalOpen: true,
      authModalMode: 'login',
    });
    vi.restoreAllMocks();
  });

  it('renders modal in login mode by default', () => {
    render(<AuthModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sign In to PathForge AI/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/developer@example.com/i)).toBeInTheDocument();
    expect(screen.getByTestId('auth-submit-btn')).toBeInTheDocument();
  });

  it('switches between Sign In and Create Account tabs', () => {
    render(<AuthModal />);

    const createAccountTab = screen.getByTestId('tab-register');
    fireEvent.click(createAccountTab);

    expect(screen.getByRole('heading', { name: /Create PathForge Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ada Lovelace/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise Security Standard/i)).toBeInTheDocument();
  });

  it('renders error message when error state is set', () => {
    useAuthStore.setState({ error: 'Invalid email or password.' });
    render(<AuthModal />);

    expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it('closes modal on close button click', () => {
    render(<AuthModal />);

    const closeBtn = screen.getByLabelText(/Close authentication modal/i);
    fireEvent.click(closeBtn);

    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  it('submits login form when credentials are provided', async () => {
    const loginSpy = vi.fn().mockResolvedValue(true);
    useAuthStore.setState({ login: loginSpy });

    render(<AuthModal />);

    const emailInput = screen.getByPlaceholderText(/developer@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);
    const submitBtn = screen.getByTestId('auth-submit-btn');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPassword123!' } });
    fireEvent.click(submitBtn);

    expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'SecretPassword123!');
  });
});
