import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test;

test.describe('Withdrawal Flow', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        const recoveryPhrase = process.env.RECOVERY_PHRASE || '';
        await page.goto('/');
        await loginPage.loadAccount(recoveryPhrase);
    });

    test.describe('Successful Withdrawal', () => {
        test.only('should complete a successful withdrawal', {
            tag: '@smoke'
        }, async ({ page, metamask }) => {
            test.slow();

            await page.getByTestId('withdraw-button').click();
            await page.getByTestId('withdrawal-amount-input').getByRole('textbox').fill('0.001');
            await page.getByTestId('target-address-input').getByRole('textbox').fill('0xB08979f3806e2139000d9Dd657E4F58af6b4ca79');
            await page.getByTestId('confirm-withdrawal-button').click();
            await page.getByText('Generating the ZK Proof').waitFor({ state: 'hidden' });
            await page.getByTestId('confirm-review-button').click();

            await metamask.approveSwitchNetwork();
            await page.waitForTimeout(4000);
            await metamask.confirmTransaction();
            await page.getByText('Processing the withdrawal').waitFor({ state: 'hidden' });

            await expect(page.getByTestId('success-title')).toBeVisible({ timeout: 10_000 });
            await expect(page.getByText('You withdrew')).toBeVisible();
        });
    });
});
