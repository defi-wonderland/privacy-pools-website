import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../wallet-setup/basic.setup';
import { LoginPage } from '../pages/login-page';
import { DepositPage } from '../pages/deposit-page';
import { WithdrawPage } from '../pages/withdraw-page';

export const testWithMetaMask = testWithSynpress(metaMaskFixtures(basicSetup)).extend<{
    metamask: MetaMask
    loginPage: LoginPage
    depositPage: DepositPage
    withdrawPage: WithdrawPage
}>({
    metamask: async ({ context, metamaskPage, extensionId }, use) => {
        const metamask = new MetaMask(
            context,
            metamaskPage,
            basicSetup.walletPassword,
            extensionId
        )
        await use(metamask)
    },
    loginPage: async ({ page, metamask }, use) => {
        const loginPage = new LoginPage(page, metamask);
        await use(loginPage)
    },
    depositPage: async ({ page, metamask }, use) => {
        const loginPage = new DepositPage(page, metamask);
        await use(loginPage)
    },
    withdrawPage: async ({ page, metamask }, use) => {
        const loginPage = new WithdrawPage(page, metamask);
        await use(loginPage)
    }
})
