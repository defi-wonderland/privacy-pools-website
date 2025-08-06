import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
  await page.goto('/');
  await loginPage.connectWallet();
});

test('show hamburger menu', async ({ page, headerPage }) => {
  await headerPage.accountMenuBtn.click();

  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('heading', { level: 6 })).toContainText('ETH');
  await expect(page.getByRole('menuitem', { name: /^0x/ })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
})

test('copy wallet address', async ({ page, metamask, headerPage }) => {
  const connectedAddress = await metamask.getAccountAddress();
  const truncatedAddress = `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`;
  await headerPage.accountMenuBtn.click();
  await page.getByRole('menuitem', { name: truncatedAddress }).click();
  const clipboardText = await page.evaluate('navigator.clipboard.readText()');

  expect(clipboardText).toContain(connectedAddress);
})

test('logout', async ({ page, headerPage }) => {
  await headerPage.accountMenuBtn.click();
  await headerPage.logoutBtn.click();

  await expect(page.getByTestId('connect-wallet-button')).toBeVisible();
})

test('show and hide disclaimer banner', async ({ page, headerPage }) => {
  const bannerText = 'This app is in beta. Use at your own risk. Lost funds cannot be recovered.';
  await expect(page.getByText(bannerText)).toBeVisible();
  await page.locator(`button:right-of(:text("${bannerText}"))`).first().click();
  await expect(page.getByText(bannerText)).not.toBeVisible();
})
