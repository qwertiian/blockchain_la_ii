'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

// Privy App IDs are required to be a 25-character string (e.g. cmto0awjx005s0bl6wksf3t7u)
const FALLBACK_APP_ID = 'cl00000000000000000000000';

export default function Providers({ children }: { children: React.ReactNode }) {
  const envAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appId = envAppId && envAppId.length === 25 ? envAppId : FALLBACK_APP_ID;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        appearance: {
          theme: 'dark',
          accentColor: '#f59e0b', // Vibrant warm gold
          logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=128&auto=format&fit=crop&q=80',
          showWalletLoginFirst: false, // Ensure external wallet is NOT the primary path
          walletList: ['detected_wallets'],
        },
        // Fast, reliable email OTP login tailored for the morning queue
        loginMethods: ['email'],
        embeddedWallets: {
          ethereum: {
            // Automatically provision an embedded wallet on login without user click
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
