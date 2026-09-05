'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

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
      {/* Dynamic ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[360px] bg-indigo-600/15 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-2xl z-10 space-y-6">
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Privy App Connected: <code className="font-mono font-semibold">blockchain</code>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Web3 Authentication Lab
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-lg mx-auto">
            Full-stack authentication using Privy SDK with Client-Side embedded wallets and Server-Side session verification.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-neutral-900/80 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
          {!ready ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-neutral-400 tracking-wider font-mono">INITIALIZING PRIVY CLIENT...</p>
            </div>
          ) : authenticated && user ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-800/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {user.email?.address ? user.email.address[0].toUpperCase() : '⚡'}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Active Session</h2>
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      Client Authenticated
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

              {/* Account Credentials */}
              <div className="grid grid-cols-1 gap-3">
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

                {user.wallet && (
                  <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Connected Wallet</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono">
                        {user.wallet.walletClientType || user.wallet.chainType || 'External'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-indigo-300 break-all select-all font-medium">
                      {user.wallet.address}
                    </p>
                  </div>
                )}

                {user.email && (
                  <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 space-y-1.5">
                    <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Email</span>
                    <p className="font-mono text-xs text-neutral-200">{user.email.address}</p>
                  </div>
                )}
              </div>

              {/* Fullstack Verification Action */}
              <div className="pt-2 border-t border-neutral-800/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-200">Server Verification</h3>
                    <p className="text-xs text-neutral-400">
                      Verify this session with your backend API route using your <code className="text-indigo-300">PRIVY_APP_SECRET</code>.
                    </p>
                  </div>
                  <button
                    onClick={verifyOnBackend}
                    disabled={isVerifying}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify on Backend'}
                  </button>
                </div>

                {serverError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                    ❌ {serverError}
                  </div>
                )}

                {serverResult && (
                  <div className="p-4 rounded-2xl bg-neutral-950/80 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Server Verified via Privy REST API
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {new Date(serverResult.verifiedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-[11px] font-mono text-neutral-300 overflow-x-auto p-2 bg-neutral-900 rounded-lg max-h-48">
                      {JSON.stringify(serverResult.user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h2 className="text-xl font-bold text-white tracking-tight">Connect with Privy</h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Log in with your email or connect via MetaMask, Coinbase Wallet, or WalletConnect.
                </p>
              </div>

              <button
                onClick={login}
                disabled={!ready}
                className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Log In / Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2 px-2 font-mono">
          <span>App ID: <span className="text-neutral-400">cmto0awjx005s0bl6wksf3t7u</span></span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Backend Secrets Configured
          </span>
        </div>
      </div>
    </main>
  );
}
