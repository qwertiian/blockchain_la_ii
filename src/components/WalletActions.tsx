'use client';

import { useState } from 'react';
import {
  useCreateWallet,
  useSendTransaction,
  useSignMessage,
  useWallets,
  User,
} from '@privy-io/react-auth';

interface WalletActionsProps {
  user: User;
}

export default function WalletActions({ user }: WalletActionsProps) {
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const { sendTransaction } = useSendTransaction();
  const { signMessage } = useSignMessage();

  // Find if user has an embedded wallet
  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const activeWallet = embeddedWallet || wallets[0];

  // State for actions
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [recipient, setRecipient] = useState('0xE3070d3e4309afA3bC9a6b057685743CF42da77C');
  const [amountWei, setAmountWei] = useState('100000');
  const [messageToSign, setMessageToSign] = useState('Hello from Privy Web3 Quickstart!');

  const [txHash, setTxHash] = useState<string | null>(null);
  const [signatureResult, setSignatureResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    setActionError(null);
    try {
      await createWallet();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to create embedded wallet');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!recipient) return;
    setIsActionPending(true);
    setActionError(null);
    setTxHash(null);

    try {
      // Send transaction request using Privy's embedded wallet
      const tx = await sendTransaction({
        to: recipient as `0x${string}`,
        value: Number(amountWei) || 100000,
      });

      if (tx && tx.hash) {
        setTxHash(tx.hash);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Transaction was rejected or failed');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleSignMessage = async () => {
    if (!messageToSign) return;
    setIsActionPending(true);
    setActionError(null);
    setSignatureResult(null);

    try {
      const res = await signMessage({
        message: messageToSign,
      });

      if (res && res.signature) {
        setSignatureResult(res.signature);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Message signing was rejected or failed');
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Embedded Wallet Status Section */}
      <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <h3 className="text-sm font-semibold text-white">Embedded Wallet Status</h3>
          </div>
          <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
            embeddedWallet
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {embeddedWallet ? 'Embedded Wallet Active' : 'No Embedded Wallet'}
          </span>
        </div>

        {embeddedWallet ? (
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
              <span className="text-neutral-400 font-mono text-[11px]">Address:</span>
              <span className="font-mono text-indigo-300 select-all break-all">{embeddedWallet.address}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span>Type: <strong className="text-neutral-200">Privy Self-Custodial Embedded</strong></span>
              <span>Chain: <strong className="text-neutral-200">EVM Compatible</strong></span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-neutral-400">
              No embedded wallet is currently associated with this user session. You can generate one instantly:
            </p>
            <button
              onClick={handleCreateWallet}
              disabled={isCreatingWallet}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCreatingWallet ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Wallet...
                </>
              ) : (
                'Create Embedded Wallet Now'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action Error Notice */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-400 hover:text-rose-200 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Send Transaction & Sign Section */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
          <h3 className="text-sm font-semibold text-white">Wallet Actions (Quickstart)</h3>
        </div>

        {/* Tab / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Sign Message (Instant testing, no gas required) */}
          <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-200">Sign Message</h4>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">No Gas</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Sign arbitrary data using your embedded wallet key without requiring testnet balance.
              </p>
              <textarea
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
              />
            </div>

            <button
              onClick={handleSignMessage}
              disabled={isActionPending}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition border border-neutral-700/80 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
              Sign Message
            </button>
          </div>

          {/* Card B: Send Transaction (EVM Quickstart) */}
          <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-200">Send Transaction</h4>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">EVM Tx</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Prompt transaction with recipient and value (in wei) from the quickstart guide.
              </p>

              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Recipient 0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200 font-mono focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400">Value (Wei):</span>
                  <input
                    type="text"
                    value={amountWei}
                    onChange={(e) => setAmountWei(e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200 font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSendTransaction}
              disabled={isActionPending}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
              Send Transaction
            </button>
          </div>
        </div>

        {/* Results display */}
        {signatureResult && (
          <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-400 font-medium">✓ Signed Signature:</span>
              <span className="text-[10px] font-mono text-neutral-500">Secp256k1</span>
            </div>
            <p className="font-mono text-[11px] text-neutral-300 break-all select-all bg-neutral-900 p-2 rounded-lg">
              {signatureResult}
            </p>
          </div>
        )}

        {txHash && (
          <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium">✓ Transaction Broadcasted:</span>
              <span className="text-[10px] font-mono text-neutral-500">Hash</span>
            </div>
            <p className="font-mono text-[11px] text-emerald-300 break-all select-all bg-neutral-900 p-2 rounded-lg">
              {txHash}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
