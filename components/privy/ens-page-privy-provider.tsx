'use client';

import React, { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { ENS_PAGE_PRIVY_APP_ID } from '@/constants';
import { mainnet } from 'viem/chains';

export const EnsPagePrivyProvider = ({ children }: { children: ReactNode }) => {
  return (
    <PrivyProvider
      appId={ENS_PAGE_PRIVY_APP_ID}
      config={{
        appearance: {
          accentColor: '#6A6FF5',
          theme: '#FFFFFF',
          showWalletLoginFirst: true,
        },
        loginMethods: ['wallet'],
        embeddedWallets: {
          createOnLogin: 'off',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [mainnet],
        defaultChain: mainnet,
      }}
    >
      {children}
    </PrivyProvider>
  );
};
