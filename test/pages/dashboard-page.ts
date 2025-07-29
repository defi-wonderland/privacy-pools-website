import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly welcomeMessageCloseBtn: Locator;
    readonly personalTabBtn: Locator;
    readonly hideEmptyPoolsBtn: Locator;
    readonly showEmptyPoolsBtn: Locator;
    readonly tokenDropdown: Locator;
    readonly viewAllPoolAccountsBtn: Locator;
    readonly viewAllGlobalPersonalActivityBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.welcomeMessageCloseBtn = page.locator('button:right-of(:text("Welcome to Privacy Pools"))').first();
        this.personalTabBtn = page.getByRole('button', { name: 'Personal' });
        this.hideEmptyPoolsBtn = page.getByRole('button', { name: 'Hide empty pools' });
        this.showEmptyPoolsBtn = page.getByRole('button', { name: 'Show empty pools' });
        this.tokenDropdown = page.getByRole('combobox');
        this.viewAllPoolAccountsBtn = page.getByText('View All').first();
        this.viewAllGlobalPersonalActivityBtn = page.getByText('View All').last();
    }

    async selectToken(tokenName: string) {
        await this.tokenDropdown.click();
        await this.page.getByRole('option', { name: tokenName }).click();
    }
} 
