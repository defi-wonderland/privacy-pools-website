'use client';

import React from 'react';
import { FormControl, MenuItem, Select, styled, SelectChangeEvent } from '@mui/material';
import { ChainAssets } from '~/config';
import { useChainContext } from '~/hooks/context/useChainContext';
import { EtherIcon } from '~/assets/coins/ether';

export interface Option {
  value: ChainAssets;
  label: string;
  icon?: React.ReactNode;
}

const DEFAULT_TOKEN_OPTIONS: Option[] = [
  { value: 'ETH', label: 'ETH', icon: <EtherIcon /> },
  { value: 'USDC', label: 'USDC' },
];

const MENU_STYLING = {
  MenuListProps: {
    sx: {
      '& .MuiMenuItem-root': {
        padding: '1.2rem 0rem',
      },
    },
  },
};

export interface AssetSelectProps {
  value?: string;
  options?: Option[];
}

export const AssetSelect: React.FC<AssetSelectProps> = ({ options = DEFAULT_TOKEN_OPTIONS }) => {
  const { selectedAsset, setSelectedAsset } = useChainContext();

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    setSelectedAsset(event.target.value as ChainAssets);
  };

  return (
    <FormControl fullWidth>
      <StyledSelect value={selectedAsset} onChange={handleChange} variant='outlined' MenuProps={MENU_STYLING}>
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <MenuItemContent>
              {option.icon && <IconWrapper>{option.icon}</IconWrapper>}
              <span>{option.label}</span>
            </MenuItemContent>
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};

const StyledSelect = styled(Select)(() => {
  return {
    // FYI: This is the expected height of the Select component extracted from FIGMA, we can change if it is not appropriate
    height: '3.8rem',
    fontWeight: 500,
  };
});

const MenuItemContent = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  width: '100%',
}));

const IconWrapper = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.4rem',
  height: '1.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
  },
}));
