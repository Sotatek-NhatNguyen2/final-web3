import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Contract from "./contract";
import {
  injected,
  walletConnector,
  masterAddress,
  wethAddress,
} from "./constant";
import masterABI from "./masterABI.json";
import wethABI from "./wethABI.json";

import moment from "moment";

import { queryHistory, queryGraph } from "./query";
import {
  Box,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { Multicall } from "ethereum-multicall";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 1,
  p: 4,
};

function App() {
  const {account, chainId, library, activate} = useWeb3React();
  const [balance, setBalance] = useState(0);
  const [stake, setStake] = useState(0);
  const [earned, setEarned] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [totalStake, setTotalStake] = useState(0);
  const [estimaseGas, setEstimateGas] = useState(0);
  const [history, setHistory] = useState({});
  const [valueDeposit, setValueDeposit] = useState('0');
  const [valueWithdraw, setValueWithdraw] = useState('0');
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  const {masterContract, wethContract, web3} = Contract();

  const roundNumber = (num) => Math.round(num * 1000) / 1000;
  const formatNumber = (num) => web3.utils.fromWei(num);
  const toNumber = (num) => web3.utils.toWei(num);
  const toString = (num) => num.toString();
  const bigNumber = (num) => web3.utils.toBN(num);

  const connectMetamask = () => {
    activate(injected);
  };

  const walletConnect = () => {
    activate(walletConnector, undefined, true).catch((e) => {
      console.error(e);
    });
  };

  // const getBalance = async () => {
  //   const balance = await wethContract.methods.balanceOf(account).call();
  //   setBalance(roundNumber(formatNumber(balance)));
  // };

  // const getAmount = async () => {
  //   const amount = await masterContract.methods.userInfo(account).call();
  //   setStake(roundNumber(formatNumber(amount.amount)));
  // };

  // const geEarnDD2 = async () => {
  //   const earned = await masterContract.methods.pendingDD2(account).call();
  //   setEarned(roundNumber(formatNumber(earned)));
  // };

  // const getTotalStake = async () => {
  //   const total = await wethContract.methods.balanceOf(masterAddress).call();
  //   setTotalStake(roundNumber(formatNumber(total)));
  // };

  const getEstimateGas = async () => {
    const estimaseGas = await masterContract.methods
      .deposit(toNumber(valueDeposit))
      .estimateGas({ from: account });

    setEstimateGas(estimaseGas);
  };

  // const checkAllowance = async () => {
  //   wethContract.methods
  //     .allowance(account, masterAddress)
  //     .call()
  //     .then((res) => {
  //       setAllowance(Number(res));
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  const handleApprove = async () => {
    wethContract.methods
      .approve(masterAddress, toString(bigNumber(10000)))
      .send({ from: account })
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const getHistory = async () => {
    const conditions = {
      first: 3,
      user: account,
      orderDirection: "desc",
    };
    const history = await queryGraph(queryHistory, conditions);
    setHistory(history);
  };

  const handleHarvest = async () => {
    await masterContract.methods
      .withdraw(bigNumber(0))
      .send({ from: account})
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.log("err", err);
      });
      
    getHistory();
  };

  const handleDeposit = async () => {
    await getEstimateGas();
    await masterContract.methods
      .deposit(toString(toNumber(valueDeposit)))
      .send({
        from: account,
        gas: estimaseGas,
        // value: toString(toNumber(valueDeposit)),
      })
      .then((res) => {
        console.log('res', res);
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setOpenDeposit(false);
      });
    
    getHistory();
  };

  const handleWithdraw = async () => {
    await masterContract.methods
      .withdraw(toString(toNumber(valueWithdraw)))
      .send({
        from: account,
        // gas: estimaseGas,
        // value: 
      })
      .then((res) => {
        console.log("res", res);
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        setOpenWithdraw(false);
      });
    
      getHistory();
  };

  const multicallData = async () => {
    if ((masterContract && wethContract && web3)) {
      const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });

      const multi = [
        {
          reference: "balanceAcc",
          contractAddress: wethAddress,
          abi: wethABI,
          calls: [{ reference: "balanceAcc", methodName: "balanceOf",methodParameters: [account] }]
        },
        {
          reference: "totalStake",
          contractAddress: wethAddress,
          abi: wethABI,
          calls: [{ methodName: "balanceOf", methodParameters: [masterAddress] }]
        },
        {
          reference: "allowance",
          contractAddress: wethAddress,
          abi: wethABI,
          calls: [{ methodName: "allowance", methodParameters: [account, masterAddress] }]
        },
        {
          reference: "userInfo",
          contractAddress: masterAddress,
          abi: masterABI,
          calls: [{ methodName: "userInfo", methodParameters: [account] }]
        },
        {
          reference: "DD2earned",
          contractAddress: masterAddress,
          abi: masterABI,
          calls: [{ methodName: "pendingDD2", methodParameters: [account] }]
        }
      ];

      const results = await multicall.call(multi);
      setBalance(roundNumber(formatNumber(results.results.balanceAcc.callsReturnContext[0].returnValues[0].hex)))
      setTotalStake(roundNumber(formatNumber(results.results.totalStake.callsReturnContext[0].returnValues[0].hex)))
      setAllowance(toNumber(formatNumber(results.results.allowance.callsReturnContext[0].returnValues[0].hex)))
      setStake(roundNumber(formatNumber(results.results.userInfo.callsReturnContext[0].returnValues[0].hex)))
      setEarned(roundNumber(formatNumber(results.results.DD2earned.callsReturnContext[0].returnValues[0].hex)))
    }
  }


  useEffect(() => {
    if (account) {
      multicallData();
      getHistory();
      // checkAllowance();
      // getBalance();
      // getAmount();
      // geEarnDD2();
      // getTotalStake();
    }
  }, [account]);

  const convertTime = (time) => {
    return moment.unix(time).format("HH:mm DD/MM/YYYY")
  }
  
  return (
    <div className="App">
      <Box
        sx={{ p: 3, borderRadius: 1, borderColor: "text.primary", border: 1 }}
      >
        {account && chainId && library ? (
          <Box sx={{ display: "flex" }}>
            <Box
              sx={{
                borderRadius: 1,
                borderColor: "text.primary",
                border: 1,
                width: "100%",
                mr: 2,
                p: 1,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{marginRight: "20px"}}>Wallet addresss: {account}</h3>
                <h3>Balance: {balance} WETH</h3>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Total earn: {earned} DD2</h3>
                <Button variant="contained" onClick={handleHarvest}>
                  Harvest
                </Button>
              </Box>
              {allowance <= 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button variant="contained" onClick={handleApprove}>
                    Approve
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                  <Button
                    variant="contained"
                    onClick={() => setOpenDeposit(true)}
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setOpenWithdraw(true)}
                  >
                    Withdraw
                  </Button>
                </Box>
              )}
              <Box>
                <h3>Your stake: {stake} WETH</h3>
                <h3>Total stake: {totalStake} WETH</h3>
              </Box>
            </Box>
            <Box
              sx={{
                borderRadius: 1,
                borderColor: "text.primary",
                border: 1,
                width: "100%",
              }}
            >
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history?.data?.depositEntities.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">Deposit</TableCell>
                        <TableCell>{formatNumber(item.amount)}</TableCell>
                        <TableCell>{convertTime(item.transactionTime)}</TableCell>
                      </TableRow>
                    ))}

                    {history?.data?.withdrawEntities.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">Withdraw</TableCell>
                        <TableCell>{formatNumber(item.amount)}</TableCell>
                        <TableCell>{convertTime(item.transactionTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" onClick={connectMetamask}>
                Connect Metamask
              </Button>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" onClick={walletConnect}>
                Connect walletConnect
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Modal open={openDeposit} onClose={() => setOpenDeposit(false)}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4">
            Stake
          </Typography>
          <TextField
            label="Enter your amount"
            value={valueDeposit}
            onChange={(e) => setValueDeposit(e.target.value)}
            variant="outlined"
          />
          <Typography id="modal-modal-title" variant="h5">
            Your WETH balance: {balance} WETH
          </Typography>
          <Button variant="contained" onClick={handleDeposit}>
            Stake
          </Button>
        </Box>
      </Modal>

      <Modal open={openWithdraw} onClose={() => setOpenWithdraw(false)}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4">
            Withdraw
          </Typography>
          <TextField
            label="Enter your amount"
            value={valueWithdraw}
            onChange={(e) => setValueWithdraw(e.target.value)}
            variant="outlined"
          />
          <Typography id="modal-modal-title" variant="h5">
            Your WETH deposited: {stake} WETH
          </Typography>
          <Button variant="contained" onClick={handleWithdraw}>
            Withdraw
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
