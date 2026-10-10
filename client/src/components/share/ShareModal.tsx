import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Clock,
  Trash2,
  ShieldAlert,
  Eye,
  CloudUpload,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { safeFetchJson } from '../../services/apiClient';
import { ApiResponse, ShareSummary, CreateShareResponseData } from '../../types/roadmap';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const roadmap = useRoadmapStore((s) => s.roadmap);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const saveRoadmapToCloud = useAuthStore((s) => s.saveRoadmapToCloud);
  const isSavingToCloud = useAuthStore((s) => s.isSavingToCloud);

  const [label, setLabel] = useState<string>('Shared Career Roadmap');
  const [expiryDays, setExpiryDays] = useState<number | null>(30);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [existingShares, setExistingShares] = useState<ShareSummary[]>([]);
  const [isLoadingShares, setIsLoadingShares] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing shares when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && roadmap?.id) {
      fetchExistingShares();
    } else {
      setGeneratedUrl(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, isAuthenticated, roadmap?.id]);

  if (!isOpen) return null;

  const fetchExistingShares = async () => {
    if (!roadmap?.id || !token) return;
    setIsLoadingShares(true);
    setError(null);

    const result = await safeFetchJson<ApiResponse<ShareSummary[]>>(
      `/api/v1/roadmaps/${roadmap.id}/shares`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setIsLoadingShares(false);
    if (result.ok && result.data?.success && Array.isArray(result.data.data)) {
      setExistingShares(result.data.data);
    }
  };

  const handleCreateShare = async () => {
    if (!roadmap) return;
    setError(null);
    setSuccessMessage(null);

    // If not authenticated, prompt auth
    if (!isAuthenticated || !token) {
      openAuthModal('login');
      return;
    }

    setIsGenerating(true);

    // 1. Ensure the roadmap is saved in the database first
    const saveSuccess = await saveRoadmapToCloud(roadmap);
    if (!saveSuccess) {
      setIsGenerating(false);
      setError('Unable to save roadmap before sharing. Please check your database connection.');
      return;
    }

    // 2. Request backend share link generation
    const result = await safeFetchJson<ApiResponse<CreateShareResponseData>>(
      `/api/v1/roadmaps/${roadmap.id}/shares`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expiresInDays: expiryDays,
          label: label.trim() || 'Shared Career Roadmap',
        }),
      }
    );

    setIsGenerating(false);

    if (!result.ok || !result.data?.success || !result.data?.data) {
      setError(result.error || result.data?.error || 'Failed to create share link.');
      return;
    }

    setGeneratedUrl(result.data.data.shareUrl);
    setSuccessMessage('Share link generated securely!');
    fetchExistingShares();
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRevoke = async (shareId: string) => {
    if (!roadmap?.id || !token) return;
    setError(null);

    const result = await safeFetchJson<ApiResponse<any>>(
      `/api/v1/roadmaps/${roadmap.id}/shares/${shareId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (result.ok && result.data?.success) {
      fetchExistingShares();
      if (generatedUrl && generatedUrl.includes(shareId)) {
        setGeneratedUrl(null);
      }
    } else {
      setError(result.error || result.data?.error || 'Failed to revoke link.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-obsidian-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-base font-bold text-white leading-tight">
                Share Career Roadmap
              </h2>
              <p className="text-xs text-slate-400">
                Generate secure, read-only public links for mentors, recruiters, and peers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-slate-200">
          {/* Unauthenticated notice */}
          {!isAuthenticated ? (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/80 space-y-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-cyan-200">Sign in to Generate Share Links</div>
                  <p className="text-slate-300 leading-relaxed">
                    Share links are cryptographically signed and tied to your cloud roadmaps so you can revoke them anytime.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="w-full py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-semibold text-xs transition-colors"
              >
                Log In or Create Account
              </button>
            </div>
          ) : (
            <>
              {/* Error & Success Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && !error && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Share Configuration */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="share-label" className="block text-xs font-medium text-slate-300 mb-1.5">
                    Link Purpose or Label
                  </label>
                  <input
                    id="share-label"
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Mentor Review, Recruiter Portfolio Link"
                    maxLength={60}
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label htmlFor="share-expiry" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Expiration Duration
                  </label>
                  <select
                    id="share-expiry"
                    value={expiryDays === null ? 'never' : String(expiryDays)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExpiryDays(val === 'never' ? null : parseInt(val, 10));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="7">Expires in 7 days</option>
                    <option value="30">Expires in 30 days (Recommended)</option>
                    <option value="90">Expires in 90 days</option>
                    <option value="never">Never expires (Permanent until revoked)</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateShare}
                  disabled={isGenerating || isSavingToCloud}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-obsidian-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGenerating || isSavingToCloud ? (
                    <>
                      <CloudUpload className="w-4 h-4 animate-bounce" />
                      Generating Secure Share Link...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Create Secure Share Link
                    </>
                  )}
                </button>
              </div>

              {/* Generated URL Result Box */}
              {generatedUrl && (
                <div className="p-4 rounded-xl bg-obsidian-950 border border-cyan-800/80 space-y-2.5">
                  <div className="text-[11px] font-semibold text-cyan-300 flex items-center justify-between">
                    <span>Ready to Share:</span>
                    <span className="text-[10px] text-slate-400">Read-Only Link</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedUrl}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono text-xs text-cyan-200 select-all focus:outline-none"
                    />

                    <button
                      onClick={() => handleCopyLink(generatedUrl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Active Share Links List */}
              <div className="space-y-2 pt-2 border-t border-obsidian-800">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Manage Active Links</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {existingShares.length} link{existingShares.length === 1 ? '' : 's'}
                  </span>
                </div>

                {isLoadingShares ? (
                  <div className="p-3 text-center text-xs text-slate-500">Loading links...</div>
                ) : existingShares.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-obsidian-950/50 rounded-xl border border-obsidian-800/60">
                    No active share links yet. Generate one above!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {existingShares.map((item) => {
                      const isExpired = item.expiresAt && new Date(item.expiresAt).getTime() < Date.now();
                      const statusLabel = item.isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active';
                      const statusColor = item.isRevoked
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : isExpired
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800';

                      return (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-obsidian-950 border border-obsidian-800/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-medium text-white truncate flex items-center gap-2">
                              <span>{item.label || 'Career Roadmap'}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full border font-mono ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                              <span>ID: {item.tokenPrefix}</span>
                              <span>&bull;</span>
                              <span>
                                {item.expiresAt
                                  ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}`
                                  : 'No Expiry'}
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-0.5">
                                <Eye className="w-3 h-3 text-slate-500" />
                                {item.viewCount} view{item.viewCount === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>

                          {!item.isRevoked && !isExpired && (
                            <button
                              onClick={() => handleRevoke(item.id)}
                              title="Revoke link immediately"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
