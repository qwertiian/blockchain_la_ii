'use client';

import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';

interface BakeryLoginFormProps {
  onOpenModal?: () => void;
}

export default function BakeryLoginForm({}: BakeryLoginFormProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Direct, reliable Email OTP flow tailored for the bakery morning queue
  const { sendCode, loginWithCode, state } = useLoginWithEmail({
    onError: (err) => {
      // Don't show an aggressive error if the user simply cancelled or closed the prompt
      if (err === 'exited_auth_flow') {
        return;
      }
      setLoginError(typeof err === 'string' ? err : 'We could not verify that passcode. Please try again.');
    },
  });

  const isCodeSent = state.status === 'awaiting-code-input' || state.status === 'submitting-code';
  const isSending = state.status === 'sending-code';
  const isSubmitting = state.status === 'submitting-code';

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoginError(null);

    try {
      await sendCode({ email: email.trim() });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('exited_auth_flow')) {
        return;
      }
      setLoginError(err instanceof Error ? err.message : 'Unable to send code. Please check your email.');
    }
  };

  const handleLoginWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoginError(null);

    try {
      await loginWithCode({ code: code.trim() });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('exited_auth_flow')) {
        return;
      }
      setLoginError(err instanceof Error ? err.message : 'Passcode verification failed. Please try again.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Friendly, Clean Bakery Intro */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mx-auto shadow-md">
          🥐
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100 tracking-tight">
          Morning Punch Card
        </h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Sign in with your email in seconds. No apps to install, no passwords, and never lose your bakery stamps again.
        </p>
      </div>

      {/* Honest Dull State: Error Notice */}
      {loginError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start justify-between gap-2">
          <div>
            <strong className="block font-semibold">Verification Notice</strong>
            <span>{loginError}</span>
          </div>
          <button
            onClick={() => setLoginError(null)}
            className="text-rose-400 hover:text-white font-bold text-sm px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Path: Email OTP */}
      {!isCodeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-zinc-300">Your Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@work.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              required
              className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSending || !email.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm transition-all duration-200 shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isSending ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                <span>Sending Instant Passcode...</span>
              </>
            ) : (
              <span>Continue with Email</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLoginWithCode} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-xs text-zinc-300 flex items-center justify-between">
            <span>Passcode sent to <strong className="text-amber-300">{email}</strong></span>
            <button
              type="button"
              onClick={() => {
                setCode('');
                setEmail('');
                setLoginError(null);
              }}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Change Email
            </button>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-zinc-300">Enter 6-Digit Passcode</label>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center font-mono text-xl tracking-widest text-amber-300 placeholder-zinc-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm transition-all duration-200 shadow-xl shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                <span>Opening Your Punch Card...</span>
              </>
            ) : (
              <span>Open My Loyalty Card</span>
            )}
          </button>
        </form>
      )}

      <p className="text-[11px] text-zinc-500 text-center font-sans">
        Collect 10 stamps on your morning bread to earn 1 free artisan cake.
      </p>
    </div>
  );
}
