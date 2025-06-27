import { Page, Locator } from '@playwright/test';
import { MetaMask } from '@synthetixio/synpress/playwright';

export class DepositPage {
    readonly page: Page;
    readonly metamask: MetaMask;
    readonly depositBtn: Locator;
    readonly depositInput: Locator;
    readonly confirmDepositBtn: Locator;
    readonly confirmReviewBtn: Locator;

    constructor(page: Page, metamask: MetaMask) {
        this.page = page;
        this.metamask = metamask;
        this.depositBtn = page.getByTestId('deposit-button');
        this.depositInput = page.getByTestId('deposit-input').getByRole('textbox');
        this.confirmDepositBtn = page.getByTestId('confirm-deposit-button');
        this.confirmReviewBtn = page.getByTestId('confirm-review-button');
    }

    async deposit(amount: string) {
        await this.depositBtn.waitFor({ state: 'visible' });
        await this.depositBtn.click();

        await this.depositInput.fill(amount);
        await this.confirmDepositBtn.click();
        await this.confirmReviewBtn.click();

        await this.metamask.approveSwitchNetwork();
        await this.page.waitForTimeout(4000);
    }

    async enterDepositAmount(amount: string) {
        await this.depositBtn.waitFor({ state: 'visible' });
        await this.depositBtn.click();
        await this.depositInput.fill(amount);
    }
}