import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { masterAddress, wethAddress } from "./constant";
import masterABI from "./masterABI.json";
import wethABI from "./wethABI.json";

function Contract () {
    const {account, chainId, library} = useWeb3React();
    if(account && chainId && library) {
        const web3 = new Web3(library.provider)
        const masterContract = new web3.eth.Contract(masterABI, masterAddress);
        const wethContract = new web3.eth.Contract(wethABI, wethAddress);
        return { masterContract, wethContract, web3 };
    }

    return {}
}
export default Contract;

// export const { masterContract, wethContract, web3 } = Contract();