'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChainContext } from '~/hooks';
import { FeesResponse, RelayRequestBody, RelayerResponse } from '~/types';
import { relayerClient } from '~/utils';

export const useRelayer = (
  relayerUrl: string,
  chainId: number,
): {
  isError?: boolean;
  isLoading?: boolean;
  fees: FeesResponse['feeBPS'] | undefined;
  relayerAddress: FeesResponse['feeReceiverAddress'] | undefined;
  relay: (input: RelayRequestBody) => Promise<RelayerResponse>;
} => {
  const { selectedPoolInfo } = useChainContext();

  const feesQuery = useQuery({
    queryKey: ['relayerFees', relayerUrl, chainId],
    queryFn: () => relayerClient.fetchFees(relayerUrl, chainId, selectedPoolInfo.assetAddress),
  });

  const relay = useCallback((input: RelayRequestBody) => relayerClient.relay(relayerUrl, input), [relayerUrl]);

  const isError = feesQuery.isError;
  const isLoading = feesQuery.isLoading;

  return useMemo(
    () => ({
      isError,
      isLoading,
      fees: feesQuery.data?.feeBPS,
      relayerAddress: feesQuery.data?.feeReceiverAddress,
      relay,
    }),
    [isError, isLoading, feesQuery.data?.feeBPS, feesQuery.data?.feeReceiverAddress, relay],
  );
};
