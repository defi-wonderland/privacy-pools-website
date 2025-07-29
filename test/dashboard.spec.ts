import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.describe('Dashboard No Connected Wallet', () => {
    test('shows dashboard for logged out user', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Personal' })).toBeDisabled();
    });
});

test.describe('Dashboard Connected wallet', () => {
    test.beforeEach('open start URL and connect wallet', async ({ page, loginPage }) => {
        await page.goto('/');
        await loginPage.connectWallet();
    });

    test('shows dashboard for logged user without account', async ({ page }) => {
        await page.locator('button:right-of(:text("Welcome to Privacy Pools"))').first().click();
        await page.getByRole('button', { name: 'Personal' }).click();

        const personalTabText = 'Your activity will appear here when there\'s something to show.';
        await expect(page.getByText('Create or Load')).toBeVisible();
        await expect(page.getByText(personalTabText)).toBeVisible();
    });

    test('shows dashboard for logged user without pool accounts', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_EMPTY || '');
        await page.getByRole('button', { name: 'Personal' }).click();

        const personalTabText = 'Your activity will appear here when there\'s something to show.';
        await expect(page.getByText(personalTabText)).toBeVisible();
        await expect(page.getByTestId('deposit-button')).toBeEnabled();
        await expect(page.getByTestId('withdraw-button')).toBeDisabled();
    });

    test('shows dashboard for logged user with pool accounts', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_ALL_STATUSES || '');
        await page.getByRole('button', { name: 'Personal' }).click();

        await expect(page.getByTestId('deposit-button')).toBeVisible();
        await expect(page.getByTestId('withdraw-button')).toBeVisible();

        await expect(page.getByRole('table').first()).toContainText('AccountValueCreatedStatusPA-');
        await expect(page.getByRole('table').last()).toContainText('ActionPool AccountValueTimeStatus');
    });

    test('hides/shows empty pools', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_ALL_STATUSES || '');
        await page.getByRole('button', { name: 'Hide empty pools' }).click();

        await expect(page.getByRole('table').first()).not.toContainText('0 ETH');
        await expect(page.getByRole('row').filter({ hasText: 'exited' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Show empty pools' })).toBeVisible();

        await page.getByRole('button', { name: 'Show empty pools' }).click();

        await expect(page.locator('tr').filter({ hasText: 'exited' }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Hide empty pools' })).toBeVisible();
    });

    test('change token using dropdown menu', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_ALL_STATUSES || '');
        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'USDC' }).click();

        await expect(page.getByRole('table').last()).not.toContainText('ETH');
        await expect(page.getByRole('table').last()).toContainText('USDC');

        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'ETH' }).click();

        await expect(page.getByRole('table').last()).not.toContainText('USDC');
        await expect(page.getByRole('table').last()).toContainText('ETH');
    });

    test('view all pool accounts', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_ALL_STATUSES || '');
        await page.getByText('View All').first().click();

        await expect(page).toHaveURL(/\/pool-accounts/);
        await expect(page.getByText('1 of')).toBeVisible();
    });

    test('view all global activity', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_ALL_STATUSES || '');
        await page.getByText('View All').last().click();

        await expect(page).toHaveURL(/\/activity\/global/);
        await expect(page.getByText('1 of')).toBeVisible();
    });

    test('view all personal activity', async ({ page, loginPage }) => {
        await loginPage.loadAccount(process.env.RECOVERY_PHRASE_ALL_STATUSES || '');
        await page.getByRole('button', { name: 'Personal' }).click();
        await page.getByText('View All').last().click();

        await expect(page).toHaveURL(/\/activity\/personal/);
        await expect(page.getByText('1 of')).toBeVisible();
    });
});
