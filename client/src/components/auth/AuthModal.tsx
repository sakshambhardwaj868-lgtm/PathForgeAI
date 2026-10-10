import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
  const authModalMode = useAuthStore((s) => s.authModalMode);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'login') {
      await login(email.trim(), password);
    } else {
      await register(name.trim(), email.trim(), password);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-800 bg-obsidian-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/80 rounded-lg text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-sm font-bold text-white">
                {mode === 'login' ? 'Sign In to PathForge AI' : 'Create PathForge Account'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Persistent MongoDB Atlas cloud storage & career synchronization
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-obsidian-950/80 border-b border-obsidian-800/80 m-4 mb-2 rounded-xl">
          <button
            type="button"
            data-testid="tab-login"
            onClick={() => {
              setMode('login');
              clearError();
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            data-testid="tab-register"
            onClick={() => {
              setMode('register');
              clearError();
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-3.5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ada Lovelace"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Password {mode === 'register' && <span className="text-slate-500 font-normal">(min 8 chars, 1 uppercase, 1 lowercase, 1 number)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="p-2.5 rounded-lg bg-obsidian-950/60 border border-obsidian-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enterprise Security Standard</span>
              </div>
              <p>Passwords are salted and hashed with bcrypt (12 rounds). Tokens are signed with JWT.</p>
            </div>
          )}

          <button
            type="submit"
            data-testid="auth-submit-btn"
            disabled={isLoading}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-obsidian-800 disabled:text-slate-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-obsidian-800/80 bg-obsidian-950/40 text-center">
          <p className="text-[11px] text-slate-500">
            Roadmaps and milestone progress are securely linked to your account and protected by private ownership checks.
          </p>
        </div>
      </div>
    </div>
  );
};
