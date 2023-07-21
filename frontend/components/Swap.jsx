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

const calcEthToSta = (eth, price) => eth * price;

const calcStaToEth = (sta, price) => {
  if (sta) {
    return sta / price;
  }
  return 0;
};

const Swap = ({
  getUpdatedBalances,
  connectedAddress,
  addressIsConnected,
  priceFeed,
  maxEth,
  maxSta,
  tokenContract,
}) => {
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
    setValue("ETH", maxEth);
  };

  const setMaxSTA = () => {
    setValue("STA", maxSta);
  };

  useEffect(() => {
    setValue("ETH", Math.min(maxEth || 100, 1));
  }, [maxEth]);

  const onSwapEth = (data) => {
    handleDepositEth(data.ETH);
  };

  const onSwapSta = (data) => {
    handleWithdrawEth(data.STA);
  };

  const handleDepositEth = async (amountEth) => {
    const parsedEth = ethers.utils.parseEther(amountEth.toString()) || 0;
    console.log(parsedEth.toString());
    if (addressIsConnected) {
      try {
        const { hash } = await writeContract({
          address: contractAddress,
          abi,
          chainId,
          functionName: "depositCollateral",
          value: parsedEth,
          account: connectedAddress,
        });
        setIsLoading(true);
        const data = await waitForTransaction({
          hash,
        });
        await getUpdatedBalances();
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Connect wallet to update blockchain data");
    }
  };

  const handleWithdrawEth = async (amountSta) => {
    const parsedSta = ethers.utils.parseEther(amountSta.toString()) || 0;
    console.log(parsedSta);
    if (addressIsConnected) {
      try {
        const { hash } = await writeContract({
          address: contractAddress,
          abi,
          chainId,
          functionName: "reclaimEth",
          args: [parsedSta],
          account: connectedAddress,
        });
        setIsLoading(true);
        const data = await waitForTransaction({
          hash,
        });
        await getUpdatedBalances();
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Connect wallet to update blockchain data");
    }
  };

  return (
    <Card my={4} p={4} className={styles.swap}>
      <CardHeader>
        <Heading>STA stablecoin swap</Heading>
        <br></br>
        {maxEth < 0.02 && (
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
                  <InputLeftAddon children="ETH" />

                  <Box>
                    <Input
                      type="decimal"
                      placeholder="ETH"
                      {...register("ETH", {})}
                    />
                    {watchSta && (
                      <Text px={"10px"}>
                        ~
                        {calcEthToSta(watchEth, priceFeed).toLocaleString("en")}{" "}
                        STA
                      </Text>
                    )}
                  </Box>
                  <InputRightAddon
                    children="Max"
                    onClick={setMaxEth}
                    className="right-action"
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      cursor: "pointer",
                    }}
                  />
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
                  <InputLeftAddon children="STA" />
                  <Box>
                    <Input
                      type="decimal"
                      placeholder="STA"
                      {...register("STA", {})}
                    />

                    {watchSta && (
                      <Text px={"10px"}>
                        ~
                        {calcStaToEth(watchSta, priceFeed).toLocaleString("en")}{" "}
                        ETH
                      </Text>
                    )}
                  </Box>
                  <InputRightAddon
                    children="Max"
                    onClick={setMaxSTA}
                    className="right-action"
                    style={{
                      backgroundColor: "white",
                      color: "black",
                      cursor: "pointer",
                    }}
                  />
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
        <Text>ETH balance: {parseFloat(maxEth).toLocaleString("en")}</Text>
        <Text>STA balance: {parseFloat(maxSta).toLocaleString("en")}</Text>
      </CardBody>
    </Card>
  );
};

export default Swap;
