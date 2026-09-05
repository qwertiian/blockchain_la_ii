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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-7 shadow-2xl space-y-5 text-neutral-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition disabled:opacity-40"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-medium">
            <span>🥖</span> Staff Counter Action
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Award Official Stamp</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Staff enters their counter PIN to sign and verify an unforgeable stamp for this customer.
          </p>
        </div>

        {/* Error Alert (Honest dull state) */}
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
              <label className="text-xs font-medium text-neutral-300">Staff Counter PIN</label>
              <span className="text-[10px] font-mono text-neutral-500">Default PIN: 1234</span>
            </div>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono text-lg tracking-widest text-white placeholder-neutral-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition cursor-pointer border border-neutral-700/80 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-amber-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
