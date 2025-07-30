import { DepositsByLabelResponse, ReviewStatus } from '~/types';

export const MOCK_DEPOSITS_BY_LABEL: DepositsByLabelResponse = [
  {
    type: 'deposit',
    amount: '1000000000000000000',
    address: '0xsenderaddress1',
    label: 'label1',
    txHash: '0xhash1',
    timestamp: 1670000000,
    precommitmentHash: '0xprecommitmenthash1',
    reviewStatus: ReviewStatus.APPROVED,
  },
  {
    type: 'deposit',
    amount: '2000000000000000000',
    address: '0xsenderaddress2',
    label: 'label2',
    txHash: '0xhash2',
    timestamp: 1670000001,
    precommitmentHash: '0xprecommitmenthash2',
    reviewStatus: ReviewStatus.PENDING,
  },
];
