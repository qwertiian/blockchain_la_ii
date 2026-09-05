'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import EmailLoginForm from '@/components/EmailLoginForm';
import WalletActions from '@/components/WalletActions';

interface ServerVerificationResult {
  success: boolean;
  verifiedAt: string;
  user: {
    id: string;
    created_at: number;
    linked_accounts: Array<{
      type: string;
      address?: string;
      email?: string;
      wallet_client_type?: string;
      chain_type?: string;
    }>;
  };
}

export default function Home() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const [authMode, setAuthMode] = useState<'email' | 'modal'>('email');
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverResult, setServerResult] = useState<ServerVerificationResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyOnBackend = async () => {
    if (!user) return;
    setIsVerifying(true);
    setServerError(null);
    setServerResult(null);

    try {
      const accessToken = await getAccessToken();
      const res = await fetch('/api/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, accessToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Backend verification failed');
      }
      setServerResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify session';
      setServerError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-2xl z-10 space-y-6 my-8">
        {/* Header Badge & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Privy Quickstart: <code className="font-mono font-semibold">blockchain</code>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Privy Web3 Quickstart
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            1. Authenticate with Email OTP &bull; 2. Provision Embedded Wallets &bull; 3. Sign and Send Transactions
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-neutral-900/80 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
          {!ready ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-neutral-400 tracking-wider font-mono">INITIALIZING PRIVY SDK...</p>
            </div>
          ) : authenticated && user ? (
            <div className="space-y-6">
              {/* Authenticated Profile Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {user.email?.address ? user.email.address[0].toUpperCase() : '⚡'}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Authenticated Session</h2>
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Connected ({user.email?.address || 'Web3 User'})
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="text-xs px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition font-medium border border-neutral-700 cursor-pointer shadow-sm active:scale-95"
                >
                  Disconnect
                </button>
              </div>

              {/* User Identifiers */}
              <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">User ID (DID)</span>
                  <button
                    onClick={() => handleCopy(user.id)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono transition cursor-pointer"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-xs text-neutral-300 break-all select-all">{user.id}</p>
              </div>

              {/* Quickstart 2 & 3: Embedded Wallet & Transaction Actions */}
              <WalletActions user={user} />

              {/* Server-Side Session Verification */}
              <div className="pt-4 border-t border-neutral-800/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Server Verification</h3>
                    <p className="text-[11px] text-neutral-400">
                      Query Privy REST API on backend using <code className="text-indigo-300">PRIVY_APP_SECRET</code>.
                    </p>
                  </div>
                  <button
                    onClick={verifyOnBackend}
                    disabled={isVerifying}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium border border-neutral-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify on Backend'}
                  </button>
                </div>

                {serverError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    ❌ {serverError}
                  </div>
                )}

                {serverResult && (
                  <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-emerald-500/30 space-y-1.5">
                    <span className="text-xs text-emerald-400 font-medium">✓ Verified with Backend App Secret</span>
                    <pre className="text-[10px] font-mono text-neutral-300 overflow-x-auto p-2 bg-neutral-900 rounded-lg max-h-36">
                      {JSON.stringify(serverResult.user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Login Method Tabs */}
              <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    authMode === 'email'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  ✉️ 1. Email OTP (Quickstart)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('modal')}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    authMode === 'modal'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  🌐 All-in-One Modal
                </button>
              </div>

              {/* Tab 1: Email OTP (Quickstart Section 1) */}
              {authMode === 'email' ? (
                <div className="space-y-4">
                  <div className="text-left space-y-1">
                    <h3 className="text-sm font-semibold text-white">Log in with Email OTP</h3>
                    <p className="text-xs text-neutral-400">
                      Implements <code className="text-indigo-300 font-mono">useLoginWithEmail</code> from the Quickstart. Enter your email to receive a 6-digit one-time passcode.
                    </p>
                  </div>

                  <EmailLoginForm />
                </div>
              ) : (
                /* Tab 2: All-in-One Modal */
                <div className="flex flex-col items-center text-center py-6 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-base font-semibold text-white">Multi-Wallet & Social Login</h3>
                    <p className="text-xs text-neutral-400">
                      Open Privy modal to connect with MetaMask, Coinbase, Rainbow, or WalletConnect.
                    </p>
                  </div>

                  <button
                    onClick={login}
                    disabled={!ready}
                    className="w-full sm:w-auto min-w-[220px] px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-xs transition shadow-lg shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
                  >
                    Open Privy Modal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2 px-2 font-mono">
          <span>App ID: <span className="text-neutral-400">cmto0awjx005s0bl6wksf3t7u</span></span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Embedded Wallets Enabled
          </span>
        </div>
      </div>
    </main>
  );
}
