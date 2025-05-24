import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.beforeEach('open start URL and connect wallet', async ({ page, metamask }) => {
  await page.goto('/');
  await page.getByTestId('connect-wallet-button').click();
  await page.getByTestId('wallet-option-metaMask').click();
  await metamask.connectToDapp();
});

test('should show welcome message and user menu', async ({ page }) => {
  await expect(page.getByTestId('account-menu-button')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome to Privacy Pools' })).toBeVisible();
  await expect(page).toHaveScreenshot();
})

test('should disconnect wallet', async ({ page }) => {
  await page.getByTestId('account-menu-button').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
  await expect(page).toHaveScreenshot();
})

test('should copy wallet address', async ({ page, metamask }) => {
  const connectedAddress = await metamask.getAccountAddress();
  const truncatedAddress = `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`;

  await page.getByTestId('account-menu-button').click();
  await page.getByRole('menuitem', { name: truncatedAddress }).click();
  const clipboardText = await page.evaluate('navigator.clipboard.readText()');

  await expect(clipboardText).toContain(connectedAddress);
})
