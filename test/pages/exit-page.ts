import { Page, Locator, expect } from '@playwright/test';
import { MetaMask } from '@synthetixio/synpress/playwright';

export class ExitPage {
    readonly page: Page;
    readonly metamask: MetaMask;
    readonly tableRowDottedMenuBtn: Locator;
    readonly dottedMenuExitBtn: Locator;
    readonly generateZkProofModal: Locator;
    readonly processingExitModal: Locator;
    readonly exitWarningText: Locator;
    readonly confirmReviewBtn: Locator;

    constructor(page: Page, metamask: MetaMask) {
        this.page = page;
        this.metamask = metamask;
        this.tableRowDottedMenuBtn = page.locator('tr').getByRole('button');
        this.dottedMenuExitBtn = page.getByTestId('dotted-menu-exit');
        this.generateZkProofModal = page.getByText('Generating the ZK Proof');
        this.exitWarningText = page.getByText('The exit returns your funds without privacy.');
        this.processingExitModal = page.getByText('Processing the exit');
        this.confirmReviewBtn = page.getByTestId('confirm-review-button');
    };

    async exit() {
        await this.tableRowDottedMenuBtn.first().click();
        await this.dottedMenuExitBtn.click();
        await this.generateZkProofModal.waitFor({ state: 'hidden' });
        await expect(this.exitWarningText).toBeVisible();
        await this.confirmReviewBtn.click({ timeout: 5_000 });
    };

    async getExitMenuButtonForStatus(status: string) {
        return this.page.locator('tr').filter({ hasText: status }).getByRole('button').first().click();
    };
};
