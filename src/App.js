import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Contract from "./contract";
import {
  injected,
  walletConnector,
  privateKey,
  masterAddress,
} from "./constant";
import './app.css'


function App() {
  const data = Contract();
  const {account, chainId, activate, library, disconnect} = useWeb3React();
  const [balance, setBalance] = useState(0);
  const [stake, setStake] = useState(0);
  const [earned, seteEarned] = useState(0);
  const [isApproved, setIsApproved] = useState(false);

  const roundNumber = (num) => (Math.round(num * 100) / 100)
  const formatNumber = (num) => data.web3.utils.fromWei(num);

  const connectMetamask = () => {
    activate(injected);
  }

  const walletConnect = () => {
    activate(walletConnector, undefined, true).catch(e => {console.error(e)});
  }

  const getBalance = async () => {
    const balance = await data.wethContract.methods.balanceOf(account).call();
    setBalance(formatNumber(balance));
  }
                                                         
  const getAmount = async () => {
    const amount = await data.masterContract.methods.userInfo(account).call();
    setStake(formatNumber(amount.amount));
  }

  const geEarnDD2 = async () => {
    const earned = await data.masterContract.methods.pendingDD2(account).call();
    seteEarned(roundNumber(formatNumber(earned)));
  }
  
  const approve = async () => {
    await data.web3.eth.accounts.wallet.add(privateKey);
    await data.wethContract.methods
      .approve(masterAddress, data.web3.utils.toWei(balance).toString())
      .send()
      .then((res) => {
        setIsApproved(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  
  useEffect(() => {
    if (account) {
      getBalance();
      getAmount();
      geEarnDD2();
    }
  }, [account]);

  return (
    <div className="App">
      {account && chainId && library ? (
        <>
          <div className="d-flex">
            <h3>Wallet addresss: {account}</h3>
            <h3>Balance: {balance} WETH</h3>
          </div>
          <div className="d-flex">
            <h3>Total earn: {earned} DD2</h3>
            <button>Harvest</button>
          </div>
          {isApproved ? (
            <>
              <button>Deposit</button>
              <button>Withdraw</button>
            </>
          ) : (
            <button onClick={approve}>Approve</button>
          )}
          <div>
            <h3>Your stake: {stake} WETH</h3>
            <h3>Total stake: {0} WET</h3>
          </div>
        </>
      ) : (
        <>
          <button onClick={connectMetamask}>Connect Metamask</button>
          <br />
          <button onClick={walletConnect}>Connect walletConnect</button>
        </>
      )}
    </div>
  );
}

export default App;
