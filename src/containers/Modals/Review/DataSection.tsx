'use client';
import { Stack, styled, Typography } from '@mui/material';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { ExtendedTooltip as Tooltip } from '~/components';
import { useExternalServices, usePoolAccountsContext, useChainContext } from '~/hooks';
import { EventType } from '~/types';
import { getUsdBalance, truncateAddress } from '~/utils';

export const DataSection = () => {
  const { address } = useAccount();
  const {
    balanceBN: { symbol, decimals },
    price,
    selectedPoolInfo,
  } = useChainContext();
  const { currentSelectedRelayerData } = useExternalServices();
  const { amount, target, actionType, poolAccount, vettingFeeBPS, feeBPSForWithdraw } = usePoolAccountsContext();
  const isDeposit = actionType === EventType.DEPOSIT;
  const aspDataFees = (vettingFeeBPS * parseUnits(amount, decimals)) / 100n / 100n;
  const aspOrRelayer = {
    label: isDeposit ? 'ASP' : 'Relayer',
    value: isDeposit ? '0xBow ASP' : currentSelectedRelayerData?.name,
  };

  const fromAddress = isDeposit ? address : '';
  const toAddress = isDeposit ? '' : target;

  const relayerFees = (BigInt(feeBPSForWithdraw ?? 0n) * parseUnits(amount, decimals)) / 100n / 100n;

  const fees = isDeposit ? aspDataFees : relayerFees;
  const feeFormatted = formatUnits(fees, decimals);
  const feeUSD = getUsdBalance(price, feeFormatted, decimals);
  const feeText = `${feeFormatted} ${symbol} (~ ${feeUSD} USD)`;

  const feesCollectorAddress = isDeposit
    ? selectedPoolInfo.entryPointAddress
    : currentSelectedRelayerData?.relayerAddress;
  const feesCollector = `OxBow (${truncateAddress(feesCollectorAddress)})`;

  const amountUSD = getUsdBalance(price, amount, decimals);
  const amountWithFeeBN = parseUnits(amount, decimals) - fees;
  const amountWithFee = formatUnits(amountWithFeeBN, decimals);
  const amountWithFeeUSD = getUsdBalance(price, amountWithFee, decimals);

  const valueText = `${amountWithFee} ${symbol} (~ ${amountWithFeeUSD} USD)`;
  const totalText = `~${amount.slice(0, 6)} ${symbol} (~ ${amountUSD} USD)`;

  return (
    <Container>
      <Stack>
        {actionType !== EventType.EXIT && (
          <Row>
            <Label variant='body2'>{aspOrRelayer.label}:</Label>
            <Value variant='body2'>{aspOrRelayer.value}</Value>
          </Row>
        )}

        <Row>
          <Label variant='body2'>From:</Label>
          <Value variant='body2'>
            <Tooltip title={fromAddress} placement='top'>
              <span>
                {fromAddress && truncateAddress(fromAddress)}
                {!fromAddress && `PA-${poolAccount?.name}`}
              </span>
            </Tooltip>
          </Value>
        </Row>

        <Row>
          <Label variant='body2'>To:</Label>
          <Value variant='body2'>
            <Tooltip title={toAddress} placement='top'>
              <span>
                {toAddress && truncateAddress(toAddress)}
                {!toAddress && 'New Pool Account'}
              </span>
            </Tooltip>
          </Value>
        </Row>
      </Stack>

      {actionType !== EventType.EXIT && (
        <Stack>
          <Row>
            <Label variant='body2'>Fees Collector:</Label>
            <Tooltip title={feesCollectorAddress} placement='top'>
              <Value variant='body2'>{feesCollector}</Value>
            </Tooltip>
          </Row>
          <Row>
            <Label variant='body2'>Fees:</Label>
            <Value variant='body2'>{feeText}</Value>
          </Row>
          <Row>
            <Label variant='body2'>Value:</Label>
            <Value variant='body2'>{valueText}</Value>
          </Row>
        </Stack>
      )}

      <Row>
        <TotalValueLabel variant='body2'>{actionType !== EventType.EXIT ? 'Total:' : 'Value:'}</TotalValueLabel>
        <TotalValue variant='body2'>{totalText}</TotalValue>
      </Row>
    </Container>
  );
};

const Container = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  fontSize: '1.6rem',
  width: '100%',
  zIndex: 1,
}));

const Row = styled(Stack)(({ theme }) => ({
  gap: 0,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',

  '& > *:not(:last-child)': {
    marginRight: theme.spacing(1),
  },

  [theme.breakpoints.down('sm')]: {
    '& > p': {
      fontSize: theme.typography.body2.fontSize,
    },
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[500],
  fontSize: '1.6rem',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '150%',
}));

const Value = styled(Label)(() => ({
  fontWeight: 400,
}));

const TotalValueLabel = styled(Label)(({ theme }) => ({
  color: theme.palette.grey[900],
}));

const TotalValue = styled(Value)(({ theme }) => ({
  color: theme.palette.grey[900],
}));
