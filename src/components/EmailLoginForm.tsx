'use client';

import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';

export default function EmailLoginForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onError: (error) => {
      setErrorMsg(typeof error === 'string' ? error : 'Authentication error');
    },
  });

  const isCodeSent = state.status === 'awaiting-code-input' || state.status === 'submitting-code';
  const isSending = state.status === 'sending-code';
  const isSubmitting = state.status === 'submitting-code';

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg(null);
    try {
      await sendCode({ email: email.trim() });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send verification code');
    }
  };

  const handleLoginWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setErrorMsg(null);
    try {
      await loginWithCode({ code: code.trim() });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid or expired passcode');
    }
  };

  return (
    <div className="w-full space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-200 ml-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {!isCodeSent ? (
        <form onSubmit={handleSendCode} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSending || !email.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-md shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isSending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending Passcode...</span>
              </>
            ) : (
              <span>Send One-Time Passcode (OTP)</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLoginWithCode} className="space-y-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
            <span>Passcode sent to <strong className="text-white">{email}</strong></span>
            <button
              type="button"
              onClick={() => {
                setCode('');
                setErrorMsg(null);
                // Reset to email step by calling sendCode or changing local state
                setEmail('');
              }}
              className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">6-Digit Verification Code</label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-center font-mono tracking-widest text-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying & Logging in...</span>
              </>
            ) : (
              <span>Verify & Complete Login</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
