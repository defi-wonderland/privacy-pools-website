import { Page, Locator } from '@playwright/test';
import { MetaMask } from '@synthetixio/synpress/playwright';

export class LoginPage {
    readonly page: Page;
    readonly metamask: MetaMask;
    readonly connectWalletBtn: Locator;
    readonly metamaskOptionBtn: Locator;
    readonly createOrLoadBtn: Locator;
    readonly importAccountBtn: Locator;
    readonly loadAccountBtn: Locator;

    constructor(page: Page, metamask: MetaMask) {
        this.page = page;
        this.metamask = metamask;
        this.connectWalletBtn = page.getByTestId('connect-wallet-button');
        this.metamaskOptionBtn = page.getByTestId('wallet-option-metaMask');
        this.createOrLoadBtn = page.getByText('Create or Load');
        this.importAccountBtn = page.getByTestId('import-account');
        this.loadAccountBtn = page.getByTestId('load-account-button');
    }

    async connectWallet() {
        await this.connectWalletBtn.click();
        await this.metamaskOptionBtn.click();
        await this.metamask.connectToDapp(['Account 1', 'Account 2']);
    }

    async loadAccount(recoveryPhrase: string) {
        const wordList = recoveryPhrase.split(" ");
        await this.createOrLoadBtn.click();
        await this.importAccountBtn.click();

        for (const [index, word] of wordList.entries()) {
            await this.page.getByRole('textbox').nth(index).fill(word);
        }
        await this.loadAccountBtn.click();
    }
}