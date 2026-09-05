'use client';

import { PrivyProvider } from '@privy-io/react-auth';

// Privy App IDs are required to be a 25-character string (e.g. clxxxxxxxxxxxxxxxxxxxxxxx)
const FALLBACK_APP_ID = 'cl00000000000000000000000';

export default function Providers({ children }: { children: React.ReactNode }) {
  const envAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appId = envAppId && envAppId.length === 25 ? envAppId : FALLBACK_APP_ID;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1',
          logo: 'https://auth.privy.io/logos/privy-logo.png',
          walletList: ['metamask', 'coinbase_wallet', 'rainbow', 'wallet_connect'],
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
