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
import { ethers } from "ethers";

//Biconomy Setups
const bundler: IBundler = new Bundler({
  bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/abc",
  chainId: ChainId.POLYGON_MUMBAI, // POLYGON_ZKEVM_TESTNET  //POLYGON_MUMBAI
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl:
    "https://paymaster.biconomy.io/api/v1/80001/0Wj_tFgBz.8aeb7b41-a59d-4b06-8aa6-217f5974f4e3", // you can get this value from biconomy dashboard.
});

const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
  //signer: wallet,  // needs fixing
  chainId: ChainId.POLYGON_MUMBAI, //POLYGON_ZKEVM_TESTNET  // POLYGON_MUMBAI
  bundler: bundler,
  paymaster: paymaster,
};

export async function createAccount() {
  const biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
  const biconomySmartAccount = await biconomyAccount.init();
  console.log("owner: ", biconomySmartAccount.owner);
  console.log("address: ", await biconomySmartAccount.getSmartAccountAddress());
  //console.log("balances: ", await biconomySmartAccount.getAllTokenBalances({ chainId: ChainId.POLYGON_MUMBAI, eoaAddress: biconomySmartAccount.owner, tokenAddresses:[]}))
  return biconomyAccount;
}

export async function sponsoredTransaction() {  // We setup the tx for 
    const smartAccount = await createAccount();
  
    const scwAddress = await smartAccount.getSmartAccountAddress();
  
    const transaction = {
    //   to: scwAddress,
    //   data: "0x",
    //   value: ethers.utils.parseEther("0.001"),
    };
  
    const biconomyPaymaster = smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
  
    let paymasterServiceData: SponsorUserOperationDto = {mode: PaymasterMode.SPONSORED,};
  
    let partialUserOp = await smartAccount.buildUserOp([transaction,]);
  
    try {
      const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(partialUserOp, paymasterServiceData);
      partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
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