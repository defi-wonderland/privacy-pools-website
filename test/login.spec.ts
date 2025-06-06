import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.beforeEach('open start URL and connect wallet', async ({ page, metamask }) => {
    await page.goto('/');
    await page.getByTestId('connect-wallet-button').click();
    await page.getByTestId('wallet-option-metaMask').click();
    await metamask.connectToDapp();
});

test('show welcome message and user menu', async ({ page }) => {
    await expect(page.getByTestId('account-menu-button')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to Privacy Pools' })).toBeVisible();
    await expect(page).toHaveScreenshot();
})

test('create new account', async ({ page }) => {
    await page.getByTestId('create-account').click();
    await page.getByRole('button', { name: 'Copy Recovery Phrase' }).click();
    await page.getByTestId('save-recovery-phrase').getByRole('checkbox').check();
    await page.getByTestId('create-account-button').click();
    await page.getByTestId('return-to-dashboard-button').click();

    const copiedRecoveryPhrase = await page.evaluate('navigator.clipboard.readText()');
    const recoveryPhraseFormat = /^(\b[a-z]+\b\s){11}\b[a-z]+\b$/;

    expect(copiedRecoveryPhrase).toMatch(recoveryPhraseFormat);
    await expect(page.getByTestId('action-menu')).toBeVisible();
})
