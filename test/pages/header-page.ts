import { Page, Locator } from '@playwright/test';

export class HeaderPage {
    readonly page: Page;
    readonly accountMenuBtn: Locator;
    readonly logoutBtn: Locator;
    readonly disclaimerBannerCloseBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.accountMenuBtn = page.getByTestId('account-menu-button');
        this.logoutBtn = page.getByRole('menuitem', { name: 'Logout' });
    }
} 