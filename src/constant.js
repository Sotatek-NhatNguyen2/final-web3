import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const masterAddress = '0x9da687e88b0A807e57f1913bCD31D56c49C872c2'
export const wethAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
export const INFURA_KEY = 'b7c023125d6e4596b6837425a1ba3b88';
export const privateKey =
  "4031a6beb2f486b9305adb0db0722665d2088888ffa75b640d412751892c7c82";

export const NETWORK_URLS = {
  // 1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
};

export const BRIDGE_URL = 'https://bridge.walletconnect.org';

export const injected = new InjectedConnector({
  supportedChainIds: [4]
})

export const walletConnector = new WalletConnectConnector({
  supportedChainIds: [4],
  rpc: NETWORK_URLS,
  bridge: BRIDGE_URL,
  qrcode: true
})


