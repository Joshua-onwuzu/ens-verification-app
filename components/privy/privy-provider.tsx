import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID } from '@/constants';
import React from 'react';

import { CHAIN } from '@/constants';

export const PrivyAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          accentColor: '#6A6FF5',
          theme: '#FFFFFF',
          showWalletLoginFirst: false,
        },
        loginMethods: [
          'email',
          'wallet',
          'twitter',
          'farcaster',
          'github',
          'discord',
        ],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [CHAIN],
        defaultChain: CHAIN,
      }}
    >
      {children}
    </PrivyProvider>
  );
};
