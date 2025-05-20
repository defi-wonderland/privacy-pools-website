'use client';

import { createContext, SetStateAction, Dispatch, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { getEnv } from '~/config/env';
import { useChainContext, useExternalServices, useNotifications, usePoolAccountsContext } from '~/hooks';
import { useAccountManager } from '~/hooks/useAccountManager';
import { AccountService, DepositsByLabelResponse, EventType, PoolAccount, ReviewStatus, HistoryData } from '~/types';
import { addPoolAccount, addWithdrawal, getPoolAccountsFromAccount, addRagequit } from '~/utils';

const { TEST_MODE } = getEnv();

type ContextType = {
  seed: string | null;
  setSeed: Dispatch<SetStateAction<string | null>>;
  accountService: AccountService | null;

  poolAccounts: PoolAccount[];
  poolAccountsByChainScope: Record<string, PoolAccount[]>; // chainId-scope -> poolAccounts
  isLoading: boolean;
  hasApprovedDeposit: boolean;

  createAccount: (seed: string) => void;
  loadAccount: (seed: string) => Promise<void>;
  addPoolAccount: (...params: Parameters<typeof addPoolAccount>) => void;
  addWithdrawal: (...params: Parameters<typeof addWithdrawal>) => void;
  addRagequit: (...params: Parameters<typeof addRagequit>) => void;
  resetGlobalState: () => void;

  allPools: number;
  allEth: bigint;
  pendingEth: bigint;

  historyData: HistoryData;

  hideEmptyPools: boolean;
  toggleHideEmptyPools: () => void;
};

interface Props {
  children: React.ReactNode;
}

export const AccountContext = createContext({} as ContextType);

export const AccountProvider = ({ children }: Props) => {
  const [seed, setSeed] = useState<string | null>(null);
  const accountServiceRef = useRef<AccountService | null>(null);
  const [poolAccounts, setPoolAccounts] = useState<ContextType['poolAccounts']>([]);
  const [poolAccountsByChainScope, setPoolAccountsByChainScope] = useState<ContextType['poolAccountsByChainScope']>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hideEmptyPools, setHideEmptyPools] = useState(false);
  const {
    chain: { poolInfo },
  } = useChainContext();
  const { addNotification } = useNotifications();
  const {
    aspData: { mtLeavesData, fetchDepositsByLabel, refetchMtLeaves, isError: aspError },
  } = useExternalServices();
  const { poolAccount, setPoolAccount } = usePoolAccountsContext();

  const { loadAccount, createAccount } = useAccountManager(
    setSeed,
    setPoolAccounts,
    setPoolAccountsByChainScope,
    accountServiceRef,
    poolInfo.chainId,
  );

  const allPools = poolAccounts.length;
  const allEth = poolAccounts.reduce((acc, curr) => acc + BigInt(curr.balance), BigInt(0));
  const pendingEth = poolAccounts.reduce(
    (acc, curr) => (curr.reviewStatus === ReviewStatus.PENDING ? acc + BigInt(curr.balance) : acc),
    BigInt(0),
  );

  const approvedAccount = useMemo(() => {
    return poolAccounts.find((account) => account.reviewStatus === ReviewStatus.APPROVED && account.balance !== 0n);
  }, [poolAccounts]);

  const hasApprovedDeposit = !!approvedAccount;

  useEffect(() => {
    if (approvedAccount && !poolAccount) {
      setPoolAccount(approvedAccount); // set default pool account
    }
  }, [approvedAccount, poolAccount, setPoolAccount]);

  // Updates the review status and timestamp of deposit entries in pool accounts based on deposit data from ASP
  const processDeposits = useCallback(
    (_poolAccounts: PoolAccount[], _depositData: DepositsByLabelResponse, onFinish: () => void) => {
      if (!_poolAccounts || !_depositData) throw Error('Pool accounts or deposits data not found');
      if (!mtLeavesData?.aspLeaves) throw Error('ASP leaves not found');

      const updatedPoolAccounts = _poolAccounts.map((entry) => {
        const deposit = _depositData.find((d) => d.label === entry.label.toString());
        if (!deposit) return entry;

        if (entry.reviewStatus === ReviewStatus.EXITED) {
          return {
            ...entry,
            reviewStatus: ReviewStatus.EXITED,
            isValid: false,
          };
        }

        const aspLeaf = mtLeavesData.aspLeaves.find((leaf) => leaf.toString() === entry.label.toString());
        let reviewStatus = deposit.reviewStatus;

        // The deposit is approved but the leaves are not yet updated
        if (deposit.reviewStatus === ReviewStatus.APPROVED && !aspLeaf) {
          reviewStatus = ReviewStatus.PENDING;
        }

        return {
          ...entry,
          reviewStatus: TEST_MODE ? ReviewStatus.APPROVED : reviewStatus,
          isValid: reviewStatus === ReviewStatus.APPROVED, // Could be removed due reviewStatus is pending till leaves are updated
          timestamp: deposit.timestamp,
        };
      });

      setPoolAccounts(updatedPoolAccounts);
      onFinish();
    },
    [mtLeavesData],
  );

  // This is executed before updatePoolAccounts updates the state
  const fetchAndProcessDeposits = useCallback(
    (newPoolAccounts?: PoolAccount[]) => {
      setIsLoading(true);
      const _poolAccounts = newPoolAccounts ?? poolAccounts;
      const labels = _poolAccounts.map((entry) => entry.label.toString());

      fetchDepositsByLabel(labels)
        .then((deposits) => {
          if (deposits.length) {
            processDeposits(_poolAccounts, deposits, () => setIsLoading(false));
          } else {
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    },
    [fetchDepositsByLabel, processDeposits, poolAccounts],
  );

  const handleLoadAccount = useCallback(
    async (seed: string): Promise<void> => {
      if (!seed) {
        throw new Error('Seed not found');
      }

      const _poolAccounts = await loadAccount(seed);
      fetchAndProcessDeposits(_poolAccounts);
    },
    [loadAccount, fetchAndProcessDeposits],
  );

  const handleUpdatePoolAccounts = useCallback(async () => {
    if (!accountServiceRef.current) throw new Error('Account service not found');
    setIsLoading(true);

    const { poolAccounts, poolAccountsByChainScope } = await getPoolAccountsFromAccount(
      accountServiceRef.current.account,
      poolInfo.chainId,
    );

    setPoolAccountsByChainScope(poolAccountsByChainScope);
    setPoolAccounts(poolAccounts);

    fetchAndProcessDeposits(poolAccounts);
  }, [fetchAndProcessDeposits, poolInfo.chainId]);

  const handleAddPoolAccount = useCallback(
    (...params: Parameters<typeof addPoolAccount>) => {
      addPoolAccount(...params);
      handleUpdatePoolAccounts();
    },
    [handleUpdatePoolAccounts],
  );

  const handleAddWithdrawal = useCallback(
    (...params: Parameters<typeof addWithdrawal>) => {
      addWithdrawal(...params);
      handleUpdatePoolAccounts();
    },
    [handleUpdatePoolAccounts],
  );

  const handleAddRagequit = useCallback(
    (...params: Parameters<typeof addRagequit>) => {
      addRagequit(...params);
      handleUpdatePoolAccounts();
    },
    [handleUpdatePoolAccounts],
  );

  const resetGlobalState = () => {
    setPoolAccounts([]);
    setSeed(null);
    accountServiceRef.current = null;
  };

  const toggleHideEmptyPools = useCallback(() => {
    setHideEmptyPools((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!poolAccounts.length) return;

    // Refetch deposits and leaves every 1 minute
    const interval = setInterval(() => {
      refetchMtLeaves();
      fetchAndProcessDeposits();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchAndProcessDeposits, poolAccounts, refetchMtLeaves]);

  useEffect(() => {
    if (!accountServiceRef.current) return; // Not initialized yet
    if (poolInfo.chainId === poolAccounts[0]?.chainId && poolInfo.scope === poolAccounts[0]?.scope) return;

    const newPoolAccounts = poolAccountsByChainScope[`${poolInfo.chainId}-${poolInfo.scope}`];
    if (!!newPoolAccounts) {
      setPoolAccounts(newPoolAccounts);
      fetchAndProcessDeposits(newPoolAccounts);
    } else {
      if (poolAccounts.length > 0) {
        setPoolAccounts([]);
      }
    }
  }, [poolInfo.chainId, poolInfo.scope, poolAccounts, poolAccountsByChainScope, fetchAndProcessDeposits]);

  useEffect(() => {
    if (aspError) {
      addNotification('error', 'ASP Error: Service interruption detected with the ASP. Please try again later.');
    }
  }, [aspError, addNotification]);

  const historyData = useMemo(() => {
    const history = [];

    for (const pa of poolAccounts) {
      history.push({
        type: EventType.DEPOSIT,
        txHash: pa.deposit.txHash,
        reviewStatus: pa.reviewStatus,
        amount: pa.deposit.value,
        timestamp: Number(pa.deposit.timestamp),
        label: pa.label,
      });

      for (const [idx, child] of pa.children.entries()) {
        history.push({
          type: EventType.WITHDRAWAL,
          txHash: child.txHash,
          reviewStatus: ReviewStatus.APPROVED,
          amount: (idx === 0 ? pa.deposit.value : pa.children[idx - 1].value) - child.value,
          timestamp: Number(child.timestamp),
          label: child.label,
        });
      }
    }

    for (const { ragequit } of poolAccounts) {
      if (!ragequit?.transactionHash) continue;
      history.push({
        type: EventType.EXIT,
        txHash: ragequit?.transactionHash,
        reviewStatus: ReviewStatus.APPROVED,
        amount: ragequit?.value,
        timestamp: Number(ragequit?.timestamp),
        label: ragequit?.label,
      });
    }

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }, [poolAccounts]);

  return (
    <AccountContext.Provider
      value={{
        poolAccounts,
        poolAccountsByChainScope,
        isLoading,
        hasApprovedDeposit,
        allPools,
        allEth,
        pendingEth,
        seed,
        accountService: accountServiceRef.current,
        setSeed,
        createAccount,
        loadAccount: handleLoadAccount,
        addPoolAccount: handleAddPoolAccount,
        addWithdrawal: handleAddWithdrawal,
        addRagequit: handleAddRagequit,
        resetGlobalState,
        historyData,
        hideEmptyPools,
        toggleHideEmptyPools,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
