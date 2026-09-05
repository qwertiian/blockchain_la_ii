'use client';

import { useState } from 'react';

interface StaffCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStampSuccess: () => void;
  getAccessToken: () => Promise<string | null>;
}

export default function StaffCounterModal({
  isOpen,
  onClose,
  onStampSuccess,
  getAccessToken,
}: StaffCounterModalProps) {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAwardStamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Customer session has expired. Please sign in again.');
      }

      // POST /api/loyalty with Bearer token and staffPin
      // The server verifies the token cryptographically and derives the customer identity!
      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'stamp',
          staffPin: pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to award stamp. Please verify the staff PIN.');
      }

      setSuccessMessage(data.message || 'Stamp awarded successfully!');
      setPin('');
      onStampSuccess();

      // Auto close after 1.5s
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Stamp request failed. Check server connection.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-5 text-zinc-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition disabled:opacity-40"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-300 text-[11px] font-mono font-medium">
            <span>🥖</span> Staff Counter Action
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Award Official Stamp</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Staff enters counter PIN to verify and stamp this customer&apos;s digital card.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <span className="text-sm">⚠️</span>
            <div className="flex-1">
              <strong className="font-semibold block">Stamp Request Failed</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <span className="text-base">✓</span>
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Staff PIN Form */}
        <form onSubmit={handleAwardStamp} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">Staff Counter PIN</label>
              <span className="text-[10px] font-mono text-zinc-500">Default: 1234</span>
            </div>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center font-mono text-lg tracking-widest text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition cursor-pointer border border-zinc-700/80 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-wide transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  <span>Stamping...</span>
                </>
              ) : (
                <span>Stamp Card (+1)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
