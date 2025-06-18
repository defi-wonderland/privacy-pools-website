import { testWithMetaMask as test } from './fixtures/testWithMetamask';

const { expect } = test

test.beforeEach('open start URL and connect wallet', async ({ page, metamask }) => {
    await page.goto('/');
    await page.getByTestId('connect-wallet-button').click();
    await page.getByTestId('wallet-option-metaMask').click();
    await metamask.connectToDapp();
});

test('shows dashboard for logged user without account', async ({ page }) => {
    await page.locator('button:right-of(:text("Welcome to Privacy Pools"))').first().click();
    await page.getByRole('button', { name: 'Personal' }).click();

    const personalTabText = 'Your activity will appear here when there\'s something to show.';

    await expect(page.getByText('Create or Load')).toBeVisible();
    await expect(page.getByText(personalTabText)).toBeVisible();
})
