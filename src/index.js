import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

const getLibrary = (provider, connector) => {
  // depend on web3 or ethers
  const library = new Web3Provider(provider);
  return library;
}

const Web3NetWork = createWeb3ReactRoot("NETWORK")

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3NetWork getLibrary={getLibrary}>
        <App />
      </Web3NetWork>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
