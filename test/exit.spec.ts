import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test;

test.describe('Exit Flow', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        const recoveryPhrase = process.env.RECOVERY_PHRASE_EXIT || '';
        await page.goto('/');
        await loginPage.loadAccount(recoveryPhrase);
    });

    test('should complete a successful exit flow', {
        tag: '@smoke'
    }, async ({ page, depositPage, exitPage, metamask }) => {
        test.slow();
        // Ceate a deposit first
        await depositPage.deposit('0.01');
        await metamask.confirmTransaction();
        await page.getByText('Processing the deposit').waitFor({ state: 'hidden' });
        await page.getByTestId('go-to-dashboard-button').click();

        // Test the exit flow
        await exitPage.exit();
        await metamask.confirmTransaction();
        await page.getByText('Processing the exit').waitFor({ state: 'hidden' });
        await expect(page.getByTestId('success-title')).toBeVisible({ timeout: 5_000 });
        await expect(page.getByText('You exited')).toBeVisible();
    });

    test('should handle transaction rejection gracefully', async ({ page, depositPage, exitPage, metamask }) => {
        test.slow();
        // Ceate a deposit
        await depositPage.deposit('0.01');
        await metamask.confirmTransaction();
        await page.getByText('Processing the deposit').waitFor({ state: 'hidden' });
        await page.getByTestId('go-to-dashboard-button').click();

        // Attempt exit but reject transaction
        await exitPage.exit();
        await metamask.rejectTransaction();

        // Should show error notification
        await expect(page.getByText('User rejected the request')).toBeVisible();
    });
});

test.describe('Exit button status', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        const recoveryPhrase = process.env.RECOVERY_PHRASE_ALL_STATUSES || '';
        await page.goto('/');
        await loginPage.loadAccount(recoveryPhrase);
    });

    test('should disable exit button when pool account status is exited', async ({ page, exitPage }) => {
        await exitPage.getExitMenuButtonForStatus('exited');
        await expect(page.getByTestId('dotted-menu-exit')).toBeDisabled();
    });

    test('should disable exit button when pool account status is approved', async ({ page, exitPage }) => {
        await exitPage.getExitMenuButtonForStatus('approved');
        await expect(page.getByTestId('dotted-menu-exit')).toBeEnabled();
    });

    test('should disable exit button when pool account status is pending', async ({ page, exitPage }) => {
        await exitPage.getExitMenuButtonForStatus('pending');
        await expect(page.getByTestId('dotted-menu-exit')).toBeEnabled();
    });

    test('should disable exit button when pool account status is declined', async ({ page, exitPage }) => {
        await exitPage.getExitMenuButtonForStatus('declined');
        await expect(page.getByTestId('dotted-menu-exit')).toBeEnabled();
    });
});
