// apps/jan-2026/lib/ton/wallet.js
export async function connectWallet() {
  if (typeof window !== 'undefined') {
    const tonConnect = await import('@tonconnect/sdk');
    const connector = new tonConnect.TonConnect({
      manifestUrl: 'https://streetwall.art/tonconnect-manifest.json'
    });
    const wallets = await connector.getWallets();
    await connector.connect({  
      universalLink: 'https://tonhub.com/ton-connect',
      bridgeUrl: 'https://bridge.tonapi.io/bridge'
    });
    return connector;
  }
}
