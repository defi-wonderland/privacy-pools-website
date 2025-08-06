import { defineWalletSetup } from '@synthetixio/synpress';
import { getExtensionId, MetaMask } from '@synthetixio/synpress/playwright';
import '@dotenvx/dotenvx/config';

const SEED_PHRASE = process.env.SEED_PHRASE || "";
const PASSWORD = process.env.WALLET_PASSWORD || "";

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
    const extensionId = await getExtensionId(context, 'MetaMask');
    const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);
    await metamask.importWallet(SEED_PHRASE);
    await metamask.importWalletFromPrivateKey(process.env.EMPTY_WALLET_PRIVATE_KEY || '');
    await metamask.switchAccount("Account 1");
})
