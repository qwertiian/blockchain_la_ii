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
    <div className="w-full space-y-4">
      {/* Sleek Dark Bakery Punch Card */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-7 shadow-2xl text-zinc-100">
        {/* Subtle warm glow behind the card */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🥖</span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-zinc-100 tracking-wide">
                Ramesh&apos;s Artisan Bakery
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Digital Loyalty Card &bull; 10 Stamps = 1 Free Cake
            </p>
          </div>

          {/* Stamp Count Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {stamps}/10 STAMPS
            </span>
          </div>
        </div>

        {/* 10 Stamp Slots Grid */}
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3 my-5">
          {Array.from({ length: 10 }).map((_, index) => {
            const slotNumber = index + 1;
            const isStamped = slotNumber <= stamps;
            const isCakeSlot = slotNumber === 10;

            return (
              <div
                key={slotNumber}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                  isStamped
                    ? 'bg-gradient-to-br from-amber-500/25 via-amber-600/20 to-amber-700/30 border border-amber-500/70 text-amber-200 shadow-md shadow-amber-500/10 scale-[1.02]'
                    : isCakeSlot
                    ? 'bg-zinc-950/80 border-2 border-dashed border-amber-500/40 text-amber-400/60'
                    : 'bg-zinc-950/70 border border-dashed border-zinc-800 text-zinc-600'
                }`}
              >
                {/* Stamp Icon */}
                {isStamped ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl">{isCakeSlot ? '🎂' : '🥐'}</span>
                    <span className="text-[8px] font-mono font-black tracking-widest text-amber-300 uppercase mt-0.5">
                      STAMPED
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm sm:text-base opacity-40">{isCakeSlot ? '🎂' : '🥐'}</span>
                    <span className="text-[10px] font-mono opacity-50 mt-0.5">#{slotNumber}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card Progress */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              {isFull ? (
                <strong className="text-amber-400">Card Completed! Ready to redeem.</strong>
              ) : (
                <span>
                  Collect <strong className="text-zinc-200">{remaining} more {remaining === 1 ? 'stamp' : 'stamps'}</strong> for your free cake.
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              {Math.round((stamps / 10) * 100)}% Complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{ width: `${(stamps / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Free Cake Celebration */}
        {isFull && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🎂</span>
              <div>
                <h4 className="text-xs font-bold text-amber-200">10 Stamps Collected!</h4>
                <p className="text-[11px] text-zinc-400">Show your phone at the counter to claim your free cake.</p>
              </div>
            </div>

            <button
              onClick={onRedeem}
              disabled={isRedeeming}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs tracking-wide transition shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer whitespace-nowrap active:scale-95"
            >
              {isRedeeming ? 'Redeeming...' : 'Redeem Free Cake'}
            </button>
          </div>
        )}
      </div>

      {/* Bakery Rewards Summary Stats */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Free Cakes Earned</span>
          <p className="text-xl font-bold text-amber-400 mt-0.5">{freeCakesEarned}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Cakes Redeemed</span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{freeCakesRedeemed}</p>
        </div>
      </div>
    </div>
  );
}
