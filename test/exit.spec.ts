import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test;

test.describe('Exit Flow', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        const recoveryPhrase = process.env.RECOVERY_PHRASE || '';
        await page.goto('/');
        await loginPage.loadAccount(recoveryPhrase);
    });

    test.describe('Successful Exit Flow', () => {
        test('should complete a successful exit flow', {
            tag: '@smoke'
        }, async ({ page, depositPage, metamask }) => {
            test.slow();
            // Ceate a deposit first
            await depositPage.deposit('0.01');
            await metamask.confirmTransaction();
            await page.getByText('Processing the deposit').waitFor({ state: 'hidden' });
            await page.getByTestId('go-to-dashboard-button').click();

            // Test the exit flow
            await page.locator('tr').getByRole('button').first().click();
            await page.getByTestId('dotted-menu-exit').click();
            await page.getByText('Generating the ZK Proof').waitFor({ state: 'hidden' });
            await expect(page.getByText('The exit returns your funds without privacy.')).toBeVisible();
            await page.getByTestId('confirm-review-button').click({ timeout: 5_000 });
            await metamask.confirmTransaction();
            await page.getByText('Processing the exit').waitFor({ state: 'hidden' });

            await expect(page.getByTestId('success-title')).toBeVisible({ timeout: 5_000 });
            await expect(page.getByText('You exited')).toBeVisible();
        });
    });

    test.describe('Exit Button States', () => {
        test('should disable exit button when pool account status is exited', async ({ page }) => {
            await page.locator('tr').filter({ hasText: 'exited' }).getByRole('button').first().click();
            await expect(page.getByTestId('dotted-menu-exit')).toBeDisabled();
        });

        test('should disable exit button when pool account status is approved', async ({ page }) => {
            await page.locator('tr').filter({ hasText: 'approved' }).getByRole('button').first().click();
            await expect(page.getByTestId('dotted-menu-exit')).toBeEnabled();
        });

        test('should disable exit button when pool account status is pending', async ({ page }) => {
            await page.locator('tr').filter({ hasText: 'pending' }).getByRole('button').first().click();
            await expect(page.getByTestId('dotted-menu-exit')).toBeEnabled();
        });

        test('should disable exit button when pool account status is declined', async ({ page }) => {
            await page.locator('tr').filter({ hasText: 'declined' }).getByRole('button').first().click();
            await expect(page.getByTestId('dotted-menu-exit')).toBeEnabled();
        });
    });

    test.describe('Negative Testing', () => {
        test('should handle transaction rejection gracefully', async ({ page, depositPage, metamask }) => {
            test.slow();
            // Ceate a deposit
            await depositPage.deposit('0.01');
            await metamask.confirmTransaction();
            await page.getByText('Processing the deposit').waitFor({ state: 'hidden' });
            await page.getByTestId('go-to-dashboard-button').click();

            // Attempt exit but reject transaction
            await page.locator('tr').getByRole('button').first().click();
            await page.getByTestId('dotted-menu-exit').click();
            await page.getByText('Generating the ZK Proof').waitFor({ state: 'hidden' });
            await page.getByTestId('confirm-review-button').click();
            await metamask.rejectTransaction();

            // Should show error notification
            await expect(page.getByText('User rejected the request')).toBeVisible();
        });
    });
});
