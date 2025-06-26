import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test;

test.describe('Deposit Flow', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, metamask }) => {
        await page.goto('/');
        await page.getByTestId('connect-wallet-button').click();
        await page.getByTestId('wallet-option-metaMask').click();
        await metamask.connectToDapp(['Account 1', 'Account 2']);
        await page.getByText('Create or Load').click();
        await page.getByTestId('import-account').click();

        const recoveryPhrase = process.env.RECOVERY_PHRASE || '';
        const wordList = recoveryPhrase.split(" ");

        for (const [index, word] of wordList.entries()) {
            await page.getByRole('textbox').nth(index).fill(word);
        }

        await page.getByTestId('load-account-button').click();
    });

    test.describe('Make a deposit', () => {
        test('should complete a successful deposit flow with valid amount', {
            tag: '@smoke'
        }, async ({ page, metamask }) => {
            test.slow();
            // Navigate to deposit modal
            const depositAmount = '0.01';
            await page.getByTestId('deposit-button').click();

            // Enter a valid deposit amount
            await page.getByTestId('deposit-input').getByRole('textbox').fill(depositAmount);
            await page.getByTestId('confirm-deposit-button').click();
            await page.getByTestId('confirm-review-button').click();

            // Confirm transaction in MetaMask
            await metamask.approveSwitchNetwork();
            // Properly wait for MetaMask to fully load to confirm the transaction, otherwhise Playwright loses track of its context
            await page.waitForTimeout(4000);
            await metamask.confirmTransaction();

            // Success modal should appear
            await page.getByText('Processing the deposit').waitFor({ state: 'hidden' });
            await expect(page.getByTestId('success-title')).toBeVisible();
        });

        test('should use "Use Max" button to set maximum deposit amount', async ({ page }) => {
            const maxAmount = '1';
            await page.getByTestId('deposit-button').click();
            await page.getByRole('button', { name: 'Use Max' }).click();

            // Input should be populated with maximum amount
            const inputValue = await page.getByTestId('deposit-input').getByRole('textbox').inputValue();
            expect(inputValue).toEqual(maxAmount);
            await expect(page.getByTestId('confirm-deposit-button')).toBeEnabled();
        });

        test.skip('should allow changing ASP selection', async ({ page }) => {
            // TO DO: Implement this test when more than one ASP is available
        });

        test('should display and update correct fee', async ({ page }) => {
            await page.getByTestId('deposit-button').click();
            await page.getByTestId('deposit-input').getByRole('textbox').fill('0.2');

            const feeText = page.getByText(/Fee.*USD/);
            await expect(feeText).toContainText('0.002');
            await page.getByTestId('deposit-input').getByRole('textbox').fill('0.4');
            await expect(feeText).toContainText('0.004');
        });
    });

    test.describe('Input validation', () => {
        test('should show error for insufficient balance', async ({ page, metamask }) => {
            // Switch to account with no balance
            await metamask.switchAccount("Account 2");

            await page.getByTestId('deposit-button').click();
            await page.getByTestId('deposit-input').getByRole('textbox').fill('0.5');

            await expect(page.getByText('Insufficient balance')).toBeVisible();
            await expect(page.getByTestId('confirm-deposit-button')).toBeDisabled();
        });

        test('should show error for amount below minimum', async ({ page }) => {
            await page.getByTestId('deposit-button').click();
            await page.getByTestId('deposit-input').getByRole('textbox').fill('0.009');

            await expect(page.getByText(/Minimum deposit amount is/)).toBeVisible();
            await expect(page.getByTestId('confirm-deposit-button')).toBeDisabled();
        });

        test('should show error for amount above maximum', async ({ page }) => {
            await page.getByTestId('deposit-button').click();
            await page.getByTestId('deposit-input').getByRole('textbox').fill('1.01');

            await expect(page.getByText(/Maximum deposit amount is/)).toBeVisible();
            await expect(page.getByTestId('confirm-deposit-button')).toBeDisabled();
        });
    });

    test.describe('Cancel deposit', () => {
        test.only('should show toast notification when user rejects transaction', async ({ page, metamask }) => {
            test.slow();
            await page.getByTestId('deposit-button').click();
            await page.getByTestId('deposit-input').getByRole('textbox').fill('0.01');
            await page.getByTestId('confirm-deposit-button').click();
            await page.getByTestId('confirm-review-button').click();

            await metamask.approveSwitchNetwork();
            await page.waitForTimeout(4000);
            await metamask.rejectTransaction();

            await expect(page.getByText('User rejected the request')).toBeVisible();
        });
    });
});
