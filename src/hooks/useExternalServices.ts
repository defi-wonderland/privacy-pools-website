'use client';

import { useMemo } from 'react';
import { useASP, useRelayer, useChainContext } from '~/hooks';

export const useExternalServices = () => {
  const {
    chainId,
    chain: { poolInfo, aspUrl },
    selectedRelayer,
    relayersData,
  } = useChainContext();

  const currentSelectedRelayerData = useMemo(() => {
    return relayersData.find((r) => r.url === selectedRelayer?.url);
  }, [relayersData, selectedRelayer]);

  const aspData = useASP(chainId, poolInfo.scope.toString(), aspUrl);
  const relayerData = useRelayer();

  const isLoading = aspData.isLoading || relayerData.isQuoteLoading;

  return {
    aspData,
    relayerData,
    currentSelectedRelayerData,
    isLoading,
  };
};
