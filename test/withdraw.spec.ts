import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test;

test.describe('Withdrawal Flow', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        const recoveryPhrase = process.env.RECOVERY_PHRASE_WITHDRAW || '';
        await page.goto('/');
        await loginPage.connectWallet();
        await loginPage.loadAccount(recoveryPhrase);
    });

    test('should complete a successful withdrawal', {
        tag: '@smoke'
    }, async ({ page, metamask, withdrawPage }) => {
        test.slow();
        await withdrawPage.withdraw('0.001', '0xB08979f3806e2139000d9Dd657E4F58af6b4ca79');
        await metamask.confirmTransaction();
        await page.getByText('Processing the withdrawal').waitFor({ state: 'hidden' });
        await expect(page.getByTestId('success-title')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText('You withdrew')).toBeVisible();
    });

    test('should show error for invalid target address', async ({ page, withdrawPage }) => {
        await withdrawPage.prepareWithdraw('0.001', '0xB08979f3806e2139000d9Dd657E4F58af6b4ca7');
        await expect(page.getByText('Invalid address')).toBeVisible();
        await expect(withdrawPage.confirmWithdrawalBtn).toBeDisabled();
    });

    test('should show error for amount greater than PA balance', async ({ page, withdrawPage }) => {
        await withdrawPage.prepareWithdraw('100', '0xB08979f3806e2139000d9Dd657E4F58af6b4ca79');
        await expect(page.getByText(/Maximum withdraw amount is/)).toBeVisible();
        await expect(withdrawPage.confirmWithdrawalBtn).toBeDisabled();
    });

    test('should show error for zero amount', async ({ page, withdrawPage }) => {
        await withdrawPage.prepareWithdraw('0', '0xB08979f3806e2139000d9Dd657E4F58af6b4ca79');
        await expect(page.getByText('Withdrawal amount must be greater than 0')).toBeVisible();
        await expect(withdrawPage.confirmWithdrawalBtn).toBeDisabled();
    });

    test('should handle transaction rejection', async ({ page, metamask, withdrawPage }) => {
        await withdrawPage.prepareWithdraw('0.001', '0xB08979f3806e2139000d9Dd657E4F58af6b4ca79');
        await withdrawPage.confirmWithdrawalBtn.click();
        await withdrawPage.generateZkProofModal.waitFor({ state: 'hidden' });
        await withdrawPage.confirmReviewBtn.click();
        await metamask.rejectTransaction();
        await expect(page.getByText('User rejected the request')).toBeVisible();
    });
});
