import { writeContract, waitForTransaction } from "@wagmi/core";
import styles from "../styles/Swap.module.css";
import {
  Card,
  CardHeader,
  CardBody,
  Box,
  Text,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Spinner,
} from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { abi } from "../artifacts/contracts/TokenSwap.sol/TokenExchange.json";
import { contractAddress, chainId } from "../artifacts/contractInfo";
import { ethers } from "ethers";
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
//Ethers.js adapter
import { useEthersProvider, useEthersSigner } from "./ethers";

type AccountAbstractionProps = {
  getUpdatedBalances: () => void;
  connectedAddress: `0x${string}` | undefined;
  addressIsConnected: boolean;
  priceFeed: number | undefined;
  maxEth: number | null;
  maxSta: number | null;
  tokenContract: string;
};

type DataProps = {
  ETH?: number;
  STA?: number;
};

const calcEthToSta = (eth: number, price: number) => eth * price;

const calcStaToEth = (sta: number, price: number) => {
  if (sta) {
    return sta / price;
  }
  return 0;
};

//Biconomy Setups
const bundler: IBundler = new Bundler({
  bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/abc",
  //bundlerUrl: "https://bundler.biconomy.io/api/v2/1442/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
  chainId: ChainId.POLYGON_ZKEVM_TESTNET, // POLYGON_ZKEVM_TESTNET  //POLYGON_MUMBAI
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl:
    "https://paymaster.biconomy.io/api/v1/1442/qwE3p3lk2.e29a50a3-2c5c-423e-99a4-958027e40a62", // you can get this value from biconomy dashboard.
});

const AccountAbstraction: React.FC<AccountAbstractionProps> = ({
  getUpdatedBalances,
  connectedAddress,
  addressIsConnected,
  priceFeed,
  maxEth,
  maxSta,
  tokenContract,
}) => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ETH: Math.min(maxEth || 100, 1),
      STA: 1,
    },
  });

  const watchEth = useWatch({
    control,
    name: "ETH",
  });

  const watchSta = useWatch({
    control,
    name: "STA",
  });

  const setMaxEth = () => {
    if (maxEth !== null) {
      setValue("ETH", maxEth);
    }
  };

  const setMaxSTA = () => {
    if (maxSta !== null) {
      setValue("STA", maxSta);
    }
  };

  useEffect(() => {
    setValue("ETH", Math.min(maxEth || 100, 1));
  }, [maxEth]);

  const onSwapEth = (data: DataProps) => {
    // handleDepositEth(data.ETH);
    sponsoredTransaction();
  };

  const onSwapSta = (data: DataProps) => {
    // handleWithdrawEth(data.STA);
  };

  const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
    signer: signer as ethers.Signer,
    chainId: ChainId.POLYGON_ZKEVM_TESTNET, //POLYGON_ZKEVM_TESTNET  // POLYGON_MUMBAI
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
 //   console.log("balances: ", await biconomySmartAccount.getAllTokenBalances({ chainId: ChainId.POLYGON_ZKEVM_TESTNET, eoaAddress: biconomySmartAccount.owner, tokenAddresses:[]}))
    return biconomyAccount;
  }

  async function sponsoredTransaction() {
    // We setup the tx for
    console.log("signer: ", signer)
    console.log("creating account...")
    const smartAccount = await createAccount();

    const scwAddress = await smartAccount.getSmartAccountAddress(); // do we need this ?

    // Create the contract object to good old ethers.js way.
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log("contract: ", contract);

    //setup the contract for a depositCollateral call
    const fragment = contract.interface.getFunction("depositCollateral");
    const encodedData = contract.interface.encodeFunctionData(fragment);
    console.log(encodedData);

    console.log("Building transaction...")
    // NEED TO FUND THE SMART ACCOUNT WITH ETH TO DEPOSIT COLLATERAL
    const transaction = {
      to: contractAddress,
      data: encodedData,
      value: ethers.utils.parseEther("0.001"),
    };
    console.log("transaction: ", transaction)

    const biconomyPaymaster = smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
    console.log("biconomyPaymaster: ", biconomyPaymaster)

    let paymasterServiceData: SponsorUserOperationDto = {mode: PaymasterMode.SPONSORED,};
    console.log("paymasterServiceData: ", paymasterServiceData)

    console.log("Building userOp...")
    let partialUserOp = await smartAccount.buildUserOp([transaction]);

    console.log("Getting paymasterAndData...")
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

    console.log("Partial userOp: ", partialUserOp);

    console.log("Sending userOp...");
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

  return (
    <Card my={4} p={4} className={styles.swap}>
      <CardHeader>
        <Heading>STA stablecoin swap</Heading>
        <br></br>
        {maxEth !== null && maxEth < 0.02 && (
          <Text>
            🚰 Get ETH from the{" "}
            <a
              href="https://faucet.polygon.technology/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Polygon zkEVM Faucet
            </a>
          </Text>
        )}
        <Text>
          API3{" "}
          <a
            href="https://market.api3.org/dapis/polygon-zkevm-testnet/ETH-USD"
            rel="noopener noreferrer"
            target="_blank"
          >
            ETH / USD price feed
          </a>{" "}
          - ${Number(priceFeed).toLocaleString("en")}
        </Text>
        <Text>
          <a
            href={`https://testnet-zkevm.polygonscan.com/address/${tokenContract}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            👀 STA Contract
          </a>
        </Text>
      </CardHeader>
      <CardBody>
        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>ETH ➡️ STA</Tab>
            <Tab>STA ➡️ ETH</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>Swap ETH for STA</p>

              <form onSubmit={handleSubmit(onSwapEth)}>
                <InputGroup my={4}>
                  <InputLeftAddon>ETH</InputLeftAddon>

                  <Box>
                    <Input
                      type="decimal"
                      placeholder="ETH"
                      {...register("ETH", {})}
                    />
                    {watchSta && priceFeed !== undefined && (
                      <Text px={"10px"}>
                        ~
                        {calcEthToSta(watchEth, priceFeed).toLocaleString("en")}{" "}
                        STA
                      </Text>
                    )}
                  </Box>
                  <InputRightAddon
                    onClick={setMaxEth}
                    className="right-action"
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      cursor: "pointer",
                    }}
                  >
                    Max
                  </InputRightAddon>
                </InputGroup>

                {isLoading ? (
                  <Spinner />
                ) : (
                  <Input
                    value={
                      addressIsConnected ? "Swap" : "Connect wallet to swap"
                    }
                    disabled={!addressIsConnected}
                    type="submit"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "rgb(14, 118, 253)",
                      color: "white",
                    }}
                  />
                )}
              </form>
            </TabPanel>
            <TabPanel>
              <p>Swap STA for ETH</p>
              <form onSubmit={handleSubmit(onSwapSta)}>
                <InputGroup my={4}>
                  <InputLeftAddon>STA</InputLeftAddon>
                  <Box>
                    <Input
                      type="decimal"
                      placeholder="STA"
                      {...register("STA", {})}
                    />

                    {watchSta && priceFeed !== undefined && (
                      <Text px={"10px"}>
                        ~
                        {calcStaToEth(watchSta, priceFeed).toLocaleString("en")}{" "}
                        ETH
                      </Text>
                    )}
                  </Box>
                  <InputRightAddon
                    onClick={setMaxSTA}
                    className="right-action"
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      cursor: "pointer",
                    }}
                  >
                    Max
                  </InputRightAddon>
                </InputGroup>

                {isLoading ? (
                  <Spinner />
                ) : (
                  <Input
                    value={
                      addressIsConnected ? "Swap" : "Connect wallet to swap"
                    }
                    disabled={!addressIsConnected}
                    type="submit"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "rgb(14, 118, 253)",
                      color: "white",
                    }}
                  />
                )}
              </form>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <br />
        <Text>ETH balance: {maxEth?.toLocaleString("en")}</Text>
        <Text>STA balance: {maxSta?.toLocaleString("en")}</Text>
      </CardBody>
    </Card>
  );
};

export default AccountAbstraction;
