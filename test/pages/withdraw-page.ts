import { Page, Locator } from '@playwright/test';
import { MetaMask } from '@synthetixio/synpress/playwright';

export class WithdrawPage {
    readonly page: Page;
    readonly metamask: MetaMask;
    readonly withdrawBtn: Locator;
    readonly withdrawalAmountInput: Locator;
    readonly targetAddressInput: Locator;
    readonly confirmWithdrawalBtn: Locator;
    readonly generateZkProofModal: Locator;
    readonly confirmReviewBtn: Locator;
    readonly successTitle: Locator;
    readonly youWithdrewText: Locator;
    readonly feeText: Locator;

    constructor(page: Page, metamask: MetaMask) {
        this.page = page;
        this.metamask = metamask;
        this.withdrawBtn = page.getByTestId('withdraw-button');
        this.withdrawalAmountInput = page.getByTestId('withdrawal-amount-input').getByRole('textbox');
        this.targetAddressInput = page.getByTestId('target-address-input').getByRole('textbox');
        this.confirmWithdrawalBtn = page.getByTestId('confirm-withdrawal-button');
        this.generateZkProofModal = page.getByText('Generating the ZK Proof');
        this.confirmReviewBtn = page.getByTestId('confirm-review-button');
        this.successTitle = page.getByTestId('success-title');
        this.youWithdrewText = page.getByText('You withdrew');
    }

    async prepareWithdraw(amount: string, targetAddress: string) {
        await this.withdrawBtn.waitFor({ state: 'visible' });
        await this.withdrawBtn.click();
        await this.withdrawalAmountInput.fill(amount);
        await this.targetAddressInput.fill(targetAddress);
    }

    async withdraw(amount: string, targetAddress: string) {
        await this.prepareWithdraw(amount, targetAddress);
        await this.confirmWithdrawalBtn.click();
        await this.generateZkProofModal.waitFor({ state: 'hidden' });
        await this.confirmReviewBtn.click();
        await this.metamask.approveSwitchNetwork();
        await this.page.waitForTimeout(4000);
    }
}
