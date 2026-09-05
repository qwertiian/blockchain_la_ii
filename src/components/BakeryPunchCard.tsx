'use client';

import { CustomerLoyalty } from '@/lib/loyaltyStore';

interface BakeryPunchCardProps {
  loyalty: CustomerLoyalty;
  onRedeem: () => void;
  isRedeeming: boolean;
}

export default function BakeryPunchCard({ loyalty, onRedeem, isRedeeming }: BakeryPunchCardProps) {
  const { stamps, freeCakesEarned, freeCakesRedeemed } = loyalty;
  const isFull = stamps >= 10;
  const remaining = Math.max(0, 10 - stamps);

  return (
    <div className="w-full space-y-5">
      {/* Physical-style Bakery Punch Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1d17] via-[#1e1511] to-[#140e0b] border-2 border-[#5c3e2e]/50 p-6 sm:p-8 shadow-2xl shadow-black/80 text-amber-50">
        {/* Subtle flour/craft texture effect */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#442c20] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥖</span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-100 tracking-wide">
                Ramesh&apos;s Artisan Bakery
              </h2>
            </div>
            <p className="text-xs text-amber-200/70 font-sans mt-0.5">
              Digital Loyalty Card &bull; 10 Stamps = 1 Free Cake
            </p>
          </div>

          {/* Stamp Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3d271c] border border-[#6b4733] self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-amber-300">
              {stamps}/10 STAMPS
            </span>
          </div>
        </div>

        {/* 10 Stamp Slots Grid */}
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 my-6">
          {Array.from({ length: 10 }).map((_, index) => {
            const slotNumber = index + 1;
            const isStamped = slotNumber <= stamps;
            const isCakeSlot = slotNumber === 10;

            return (
              <div
                key={slotNumber}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                  isStamped
                    ? 'bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-400/80 shadow-lg shadow-amber-900/40 text-white scale-[1.02]'
                    : isCakeSlot
                    ? 'bg-[#291b14] border-2 border-dashed border-amber-500/40 text-amber-300/60'
                    : 'bg-[#241710] border border-dashed border-[#4d3224] text-amber-300/40'
                }`}
              >
                {/* Stamp Icon */}
                {isStamped ? (
                  <div className="flex flex-col items-center justify-center animate-in zoom-in-50 duration-200">
                    <span className="text-lg sm:text-2xl">{isCakeSlot ? '🎂' : '🥐'}</span>
                    <span className="text-[9px] font-mono font-black tracking-widest text-amber-100 uppercase mt-0.5">
                      PAID
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm sm:text-lg opacity-40">{isCakeSlot ? '🎂' : '🥐'}</span>
                    <span className="text-[10px] font-mono opacity-50 mt-0.5">#{slotNumber}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card Footer / Progress info */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-amber-200/80">
            <span>
              {isFull ? (
                <strong className="text-amber-300">Card Completed! Ready to redeem.</strong>
              ) : (
                <span>
                  Collect <strong className="text-amber-300">{remaining} more {remaining === 1 ? 'stamp' : 'stamps'}</strong> for your free cake.
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-amber-300/60">
              {Math.round((stamps / 10) * 100)}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#1b120c] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 transition-all duration-500"
              style={{ width: `${(stamps / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Free Cake Celebration Banner */}
        {isFull && (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🎂</span>
              <div>
                <h4 className="text-sm font-bold text-amber-200">10 Stamps Collected!</h4>
                <p className="text-xs text-amber-300/80">Show your phone at the counter to claim your free cake.</p>
              </div>
            </div>

            <button
              onClick={onRedeem}
              disabled={isRedeeming}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs tracking-wide transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isRedeeming ? 'Redeeming...' : 'Redeem Free Cake'}
            </button>
          </div>
        )}
      </div>

      {/* Bakery Rewards Summary Stats */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Free Cakes Earned</span>
          <p className="text-xl font-bold text-amber-400 mt-0.5">{freeCakesEarned}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Cakes Redeemed</span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{freeCakesRedeemed}</p>
        </div>
      </div>
    </div>
  );
}
