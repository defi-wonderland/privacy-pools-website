import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
    await page.goto('/');
    await loginPage.connectWallet();
});

test('show welcome message and user menu', async ({ page }) => {
    await expect(page.getByTestId('account-menu-button')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to Privacy Pools' })).toBeVisible();
})

test('create new account', async ({ page, loginPage }) => {
    await loginPage.createAccountBtn.click();
    await loginPage.copyRecoveryPhraseBtn.click();

    const copiedRecoveryPhrase = await page.evaluate('navigator.clipboard.readText()') as string;
    const phraseWords = copiedRecoveryPhrase.split(" ");
    await loginPage.continueToVerificationBtn.click();
    const verificationInputs = await page.getByRole('textbox').all();
    for (const [index, input] of verificationInputs.entries()) {
        if (await input.isEditable()) {
            await input.fill(phraseWords[index]);
        }
    }

    await loginPage.verifyBtn.click();
    await loginPage.saveRecoveryPhraseCheckbox.check();
    await loginPage.createAccountAfterVerificationBtn.click();
    await loginPage.returnToDashboardBtn.click();

    await expect(page.getByTestId('action-menu')).toBeVisible();
})
