//New Imports
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  IPaymaster,
  BiconomyPaymaster,
  IHybridPaymaster,
  PaymasterFeeQuote,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ethers, Signer } from "ethers";
import { useState, useEffect } from "react";
import { abi } from "../artifacts/contracts/TokenSwap.sol/TokenExchange.json";
import { contractAddress, chainId } from "../artifacts/contractInfo";
//Ethers.js adapter
import { useEthersProvider, useEthersSigner } from "./ethers";

//Biconomy Setups
const bundler: IBundler = new Bundler({
  bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/abc",
  chainId: ChainId.POLYGON_ZKEVM_TESTNET, // POLYGON_ZKEVM_TESTNET  //POLYGON_MUMBAI
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl:
    "https://paymaster.biconomy.io/api/v1/1442/qwE3p3lk2.e29a50a3-2c5c-423e-99a4-958027e40a62", // you can get this value from biconomy dashboard.
});

const AccountAbstraction = () => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  //In case there is no signer
  if (!signer) {
    throw new Error("Signer is not available");
  }

  const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
    signer: signer,
    chainId: ChainId.POLYGON_MUMBAI, //POLYGON_ZKEVM_TESTNET  // POLYGON_MUMBAI
    bundler: bundler,
    paymaster: paymaster,
  };

  async function createAccount() {
    const biconomyAccount = new BiconomySmartAccount(
      biconomySmartAccountConfig
    );
    const biconomySmartAccount = await biconomyAccount.init();
    console.log("owner: ", biconomySmartAccount.owner);
    console.log(
      "address: ",
      await biconomySmartAccount.getSmartAccountAddress()
    );
    //console.log("balances: ", await biconomySmartAccount.getAllTokenBalances({ chainId: ChainId.POLYGON_MUMBAI, eoaAddress: biconomySmartAccount.owner, tokenAddresses:[]}))
    return biconomyAccount;
  }

  async function sponsoredTransaction() {
    // We setup the tx for
    const smartAccount = await createAccount();

    const scwAddress = await smartAccount.getSmartAccountAddress(); // do we need this ?

    // Create the contract object to good old ethers.js way.
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log("contract: ", contract);

    //setup the contract for a depositCollateral call
    const fragment = contract.interface.getFunction("depositCollateral");
    const encodedData = contract.interface.encodeFunctionData(fragment);
    console.log(encodedData);


    // NEED TO FUND THE SMART ACCOUNT WITH ETH TO DEPOSIT COLLATERAL
    const transaction = {
        to: contractAddress,
        data: encodedData,
        value: ethers.utils.parseEther("0.01") 
    };

    const biconomyPaymaster =
      smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

    let paymasterServiceData: SponsorUserOperationDto = {
      mode: PaymasterMode.SPONSORED,
    };

    let partialUserOp = await smartAccount.buildUserOp([transaction]);

    try {
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          partialUserOp,
          paymasterServiceData
        );
      partialUserOp.paymasterAndData =
        paymasterAndDataResponse.paymasterAndData;
    } catch (e) {
      console.log("error received ", e);
    }

    try {
      const userOpResponse = await smartAccount.sendUserOp(partialUserOp);
      console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait();
      console.log(
        `transactionDetails: ${JSON.stringify(
          transactionDetails.logs[0].transactionHash,
          null,
          "\t"
        )}`
      );
    } catch (e) {
      console.log("error received ", e);
    }
  }
};

export default AccountAbstraction;
