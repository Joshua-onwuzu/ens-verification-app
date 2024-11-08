/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import { Button, cn, DynamicAlert } from '@fileverse/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import Image from 'next/image';
import ensVerificationLogo from '@/public/ensVerificationLogo.svg';
import devconLogo from '@/public/devconLogo.svg';
import { useSearchParams } from 'next/navigation';
import { useConnectWallet } from '@privy-io/react-auth';

import { createPublicClient, Hex, http } from 'viem';
import { MAINNET_RPC_URL, TEAMS_BACKEND_URL } from '@/constants';
import { mainnet } from 'viem/chains';

const ethereumClient = createPublicClient({
  chain: mainnet,
  transport: http(MAINNET_RPC_URL),
});

const checkHasENSApi = async (
  token: string,
  orgId: string,
  identityId: string
): Promise<boolean> => {
  const response = await fetch(`${TEAMS_BACKEND_URL}/identity/has-ens`, {
    headers: {
      Authorization: `Bearer ${token}`,
      orgId: orgId,
      identityId: identityId,
    },
    method: 'GET',
  });
  const data = (await response.json()) as { hasEns: boolean };
  return data.hasEns;
};

const EnsVerificationPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const orgId = searchParams.get('orgId');
  const identityId = searchParams.get('identityId');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      setLoading(true);
      const address = wallet?.address as Hex;
      ethereumClient
        .getEnsName({ address })
        .then((ensName) => {
          if (ensName) {
            window.opener.parent.postMessage(
              {
                type: 'ENS_VERIFICATION_SUCCESS',
                data: {
                  ensName,
                },
              },
              '*'
            );
            window.close();
          } else {
            setErrorMessage('No ENS found for this wallet');
          }
        })
        .catch((err) => {
          setErrorMessage('Something went wrong');
          console.log(err);
        })
        .finally(() => setLoading(false));
    },
  });

  const callCheckHasENSApi = useCallback(async () => {
    if (token && orgId && identityId) {
      const alreadyHasENS = await checkHasENSApi(token, orgId, identityId);
      if (alreadyHasENS) {
        setErrorMessage('You already have an ENS');
      }
    } else {
      setErrorMessage('Invalid token');
    }
  }, [token, orgId, identityId]);

  useEffect(() => {
    void callCheckHasENSApi();
  }, [callCheckHasENSApi]);

  const handleConnectWallet = () => {
    connectWallet();
  };
  const isMaxHeight800px = useMediaQuery('(max-height: 800px)');

  const isDisabled = !!errorMessage || loading;
  return (
    <div className="w-full h-screen flex flex-col lg:!flex-row relative items-center justify-between lg:justify-center gap-0">
      <div
        className={cn(
          'flex-1 h-full w-full lg:py-0 px-4 flex flex-col items-center justify-center order-2 lg:order-1',
          isMaxHeight800px ? 'lg:h-[85vh]' : 'lg:h-[750px]'
        )}
      >
        <div className="flex flex-col items-center justify-center h-full w-full text-center mx-auto py-[40px] max-w-[440px]">
          <div className="flex items-center gap-4">
            <Image
              src={devconLogo as string}
              alt="ens"
              width={64}
              height={64}
            />
            <p className="text-[24px]">+</p>
            <Image
              src={ensVerificationLogo as string}
              alt="ens"
              width={64}
              height={64}
            />
          </div>
          <h1 className="color-text-default text-[24px] mt-8 mb-3">
            Bring your own identity
          </h1>
          <p className="text-body-sm color-text-secondary font-normal">
            This step verifies that you own an ENS and displays it on your
            Devcon Collab account.
          </p>
          <Button
            disabled={isDisabled}
            onClick={handleConnectWallet}
            className="w-full mt-6"
          >
            Connect your wallet
          </Button>
        </div>
        {errorMessage ? (
          <DynamicAlert
            description={errorMessage}
            variant="danger"
            className="w-full mt-6"
          />
        ) : null}
      </div>
      <div className="relative w-full lg:!w-[560px] h-full overflow-hidden order-1 lg:order-2 hidden lg:block">
        <AnimatePresence>
          <>
            <motion.img
              key="https://s3.eu-west-2.amazonaws.com/assets.fileverse.io/dapp/public/fileverse-teams/img-join.jpg"
              src="https://s3.eu-west-2.amazonaws.com/assets.fileverse.io/dapp/public/fileverse-teams/img-join.jpg"
              alt="nav-svg-teamSpace"
              className="absolute top-0 right-0 object-cover object-left-top w-[560px] h-auto shadow-elevation-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnsVerificationPage;
