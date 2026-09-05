'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import BakeryLoginForm from '@/components/BakeryLoginForm';
import BakeryPunchCard from '@/components/BakeryPunchCard';
import StaffCounterModal from '@/components/StaffCounterModal';
import TechInspector from '@/components/TechInspector';
import { CustomerLoyalty } from '@/lib/loyaltyStore';

interface ServerLoyaltyResponse {
  success: boolean;
  derivedUserId: string;
  verifiedAt: string;
  loyalty: CustomerLoyalty;
  embeddedWalletAddress: string | null;
  serverClaims: Record<string, unknown>;
}

export default function Home() {
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy();

  const [loyaltyData, setLoyaltyData] = useState<CustomerLoyalty>({
    userId: '',
    stamps: 0,
    freeCakesEarned: 0,
    freeCakesRedeemed: 0,
    history: [],
  });
  const [serverVerifiedData, setServerVerifiedData] = useState<ServerLoyaltyResponse | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch verified loyalty status from server using customer's Privy JWT Bearer token
  const fetchLoyaltyStatus = useCallback(async () => {
    if (!authenticated || !user) return;

    try {
      const token = await getAccessToken();
      if (!token) return;

      const res = await fetch('/api/loyalty', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLoyaltyData(data.loyalty);
        setServerVerifiedData(data);
      }
    } catch {
      // Dull state handled gracefully
    }
  }, [authenticated, user, getAccessToken]);

  useEffect(() => {
    if (authenticated && user) {
      fetchLoyaltyStatus();
    }
  }, [authenticated, user, fetchLoyaltyStatus]);

  // Handle free cake redemption at 10 stamps
  const handleRedeemCake = async () => {
    setIsRedeeming(true);
    setFeedbackNotice(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Session expired');

      const res = await fetch('/api/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'redeem' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to redeem free cake');
      }

      setLoyaltyData(data.loyalty);
      setFeedbackNotice({
        type: 'success',
        message: '🎉 Free artisan cake redeemed successfully at the counter!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Redemption failed';
      setFeedbackNotice({ type: 'error', message: msg });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Dull state 1: App initializing
  if (!ready) {
    return (
      <main className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl animate-pulse">🥖</span>
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-serif tracking-widest text-zinc-400 uppercase">
            Opening Ramesh&apos;s Bakery...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      {/* Dynamic ambient halo lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-amber-500/[0.04] blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[300px] bg-indigo-600/[0.03] blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-xl z-10 space-y-6 my-6">
        {/* Bakery Brand Header */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-serif tracking-wide shadow-sm">
            <span>🌾</span> Fresh Daily &bull; Est. 1994
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-100">
            Ramesh&apos;s Artisan Bakery
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto">
            The loyalty card that can&apos;t be photocopied. 10 stamps on your morning bread, 1 free artisan cake.
          </p>
        </header>

        {/* Main Card Container (Layered dark & less dark) */}
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {authenticated && user ? (
            /* ========================================================================= */
            /* SIGNED-IN STATE: Customer Loyalty Dashboard                               */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Customer Session Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-serif font-bold shadow-md">
                    {user.email?.address ? user.email.address[0].toUpperCase() : '🥐'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {user.email?.address || 'Loyal Customer'}
                    </h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Card Verified on Server
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition font-medium border border-zinc-700/80 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

              {/* Feedback Notices */}
              {feedbackNotice && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-2 ${
                    feedbackNotice.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span>{feedbackNotice.message}</span>
                  <button
                    onClick={() => setFeedbackNotice(null)}
                    className="font-bold px-1 hover:opacity-70 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Visual 10-Slot Bakery Punch Card */}
              <BakeryPunchCard
                loyalty={loyaltyData}
                onRedeem={handleRedeemCake}
                isRedeeming={isRedeeming}
              />

              {/* Counter Staff Stamping Action (Layered less dark card) */}
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span>🥖</span> Buying Bread Right Now?
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Show your screen at the counter for Ramesh or staff to award a stamp.
                  </p>
                </div>

                <button
                  onClick={() => setIsStaffModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-wide transition shadow-md shadow-amber-500/20 cursor-pointer whitespace-nowrap active:scale-98"
                >
                  Award Stamp (Staff PIN)
                </button>
              </div>

              {/* Stamping History */}
              {loyaltyData.history && loyaltyData.history.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    Recent Activity
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {loyaltyData.history.slice(0, 5).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{ev.type === 'cake_redeemed' ? '🎂' : '🥐'}</span>
                          <span className="text-zinc-300 text-[11px]">{ev.note}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security & Cryptographic Architecture Inspector */}
              <TechInspector
                user={user}
                serverVerifiedData={serverVerifiedData}
                onRefresh={fetchLoyaltyStatus}
              />
            </div>
          ) : (
            /* ========================================================================= */
            /* CUSTOMER FIRST SCREEN: Zero Blockchain Jargon                             */
            /* ========================================================================= */
            <BakeryLoginForm />
          )}
        </div>

        {/* Footer info */}
        <footer className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2 px-2 font-mono">
          <span>Ramesh&apos;s Bakery Loyalty</span>
          <span>Base Sepolia &bull; Embedded Wallets</span>
        </footer>
      </div>

      {/* Staff Counter PIN Modal */}
      <StaffCounterModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onStampSuccess={fetchLoyaltyStatus}
        getAccessToken={getAccessToken}
      />
    </main>
  );
}
