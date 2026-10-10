import { useState, useEffect } from 'react';
import { Compass, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-obsidian-800 bg-obsidian-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg text-brand-emerald">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              PathForge AI
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                MVP Scaffolding
              </span>
            </h1>
            <p className="text-xs text-slate-400">Reverse-Engineered Career Roadmapper</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-obsidian-800 border border-obsidian-700 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            Backend: {loading ? 'Connecting...' : health ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Phase 1 Clean Tooling & Architecture Verified
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          Living, Interactive Career Skill Trees
        </h2>
        <p className="text-slate-400 max-w-xl text-sm sm:text-base mb-8">
          Reverse-engineering dream engineering roles into directed acyclic graphs with schema-enforced milestone projects and dynamic re-routing.
        </p>

        {/* Health Status Card */}
        <div className="w-full max-w-md p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 text-left shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-obsidian-800 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              API Health Status
            </span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
              health ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950/80 text-amber-400 border border-amber-800'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              {loading ? 'Checking...' : health ? '200 OK' : 'Pending API Start'}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Service:</span>
              <span className="text-slate-200">{health?.service || 'pathforge-server'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Endpoint:</span>
              <span className="text-brand-cyan">GET /api/v1/health</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Environment:</span>
              <span className="text-slate-200">development</span>
            </div>
            {error && (
              <div className="mt-2 text-rose-400 text-xs bg-rose-950/30 p-2 rounded border border-rose-900">
                Note: {error} (API server will connect when running)
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-obsidian-800 px-6 py-3 text-center text-xs text-slate-500">
        PathForge AI &bull; Problem Statement 1 &bull; Hackathon Project
      </footer>
    </div>
  );
}
