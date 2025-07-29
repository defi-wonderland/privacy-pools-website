import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
    await page.goto('/');
    await loginPage.connectWallet();
});

test('show welcome message and user menu', async ({ page }) => {
    await expect(page.getByTestId('account-menu-button')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to Privacy Pools' })).toBeVisible();
    await expect(page).toHaveScreenshot();
})

test.only('create new account', async ({ page }) => {
    await page.getByTestId('create-account').click();
    await page.getByRole('button', { name: 'Copy Recovery Phrase' }).click();

    const copiedRecoveryPhrase = await page.evaluate('navigator.clipboard.readText()') as string;
    const phraseWords = copiedRecoveryPhrase.split(" ");
    await page.getByRole('button', { name: 'Continue to Verification' }).click();
    const verificationInputs = await page.getByRole('textbox').all();
    for (const [index, input] of verificationInputs.entries()) {
        if (await input.isEditable()) {
            await input.fill(phraseWords[index]);
        }
    }

    await page.getByRole('button', { name: 'Verify' }).click();
    await page.getByTestId('save-recovery-phrase').getByRole('checkbox').check();
    await page.getByTestId('create-account-button').click();
    await page.getByTestId('return-to-dashboard-button').click();

    await expect(page.getByTestId('action-menu')).toBeVisible();
})
