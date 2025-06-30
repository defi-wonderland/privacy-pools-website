import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test;

test.describe('Deposit Flow', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        const recoveryPhrase = process.env.RECOVERY_PHRASE || '';
        await page.goto('/');
        await loginPage.loadAccount(recoveryPhrase);
    });

    test.describe('Make a deposit', () => {
        test('should complete a successful deposit flow with valid amount', {
            tag: '@smoke'
        }, async ({ page, depositPage, metamask }) => {
            test.slow();
            await depositPage.deposit('0.01');
            await metamask.confirmTransaction();
            await page.getByText('Processing the deposit').waitFor({ state: 'hidden' });
            await expect(page.getByTestId('success-title')).toBeVisible();
            await expect(page.getByText('You deposited')).toBeVisible();
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

        test('should display and update correct fee', async ({ page, depositPage }) => {
            await depositPage.enterDepositAmount('0.2');
            const feeText = page.getByText(/Fee.*USD/);
            await expect(feeText).toContainText('0.002');
            await page.getByTestId('deposit-input').getByRole('textbox').fill('0.4');
            await expect(feeText).toContainText('0.004');
        });
    });

    test.describe('Input validation', () => {
        test('should show error for insufficient balance', async ({ page, metamask, depositPage }) => {
            // Switch to account with no balance
            await metamask.switchAccount("Account 2");
            await depositPage.enterDepositAmount('0.5');
            await expect(page.getByText('Insufficient balance')).toBeVisible();
            await expect(page.getByTestId('confirm-deposit-button')).toBeDisabled();
        });

        test('should show error for amount below minimum', async ({ page, depositPage }) => {
            await depositPage.enterDepositAmount('0.009');
            await expect(page.getByText(/Minimum deposit amount is/)).toBeVisible();
            await expect(page.getByTestId('confirm-deposit-button')).toBeDisabled();
        });

        test('should show error for amount above maximum', async ({ page, depositPage }) => {
            await depositPage.enterDepositAmount('1.01');
            await expect(page.getByText(/Maximum deposit amount is/)).toBeVisible();
            await expect(page.getByTestId('confirm-deposit-button')).toBeDisabled();
        });
    });

    test.describe('Cancel deposit', () => {
        test('should show toast notification when user rejects transaction', async ({ page, metamask, depositPage }) => {
            test.slow();
            await depositPage.deposit('0.01');
            await metamask.rejectTransaction();
            await expect(page.getByText('User rejected the request')).toBeVisible();
        });
    });
});
