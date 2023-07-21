import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { getAccount, fetchBalance, readContract } from "@wagmi/core";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import Swap from "../components/Swap";
import { abi } from "../artifacts/contracts/TokenSwap.sol/TokenExchange.json";
import { contractAddress } from "../artifacts/contractInfo";
import styles from "../styles/Home.module.css";

const fetchBalances = async (address: `0x${string}` | undefined) => {
  const balances: {
    [key: string]: any;
  } = {};
  if (address) {
    // fetch ETH balance
    const eth = await fetchBalance({
      address: address,
    });
    balances.eth = eth;

    // fetch STA token balance
    const staToken = await fetchBalance({
      address: address,
      token: contractAddress,
    });
    balances.sta = staToken;
  }

  return balances;
};

// contract helpers
const readPriceFeed = async (): Promise<[ethers.BigNumberish, number]> => {
  const [price]: any = await readContract({
    address: contractAddress,
    abi,
    functionName: "readDataFeed",
  });
  return price;
};

const Home: NextPage = () => {
  const [connectedAddress, setConnectedAddress] = useState<
    `0x${string}` | undefined
  >();
  const [addressIsConnected, setAddressIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<any | null>(null);
  const [priceFeed, setPriceFeed] = useState<number | undefined>();

  useEffect(() => {
    // interval check whether user has connected or disconnected wallet
    const interval = setInterval(() => {
      const { address, isConnected } = getAccount();
      setConnectedAddress(address);
      setAddressIsConnected(isConnected);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkBalances = () => {
    fetchBalances(connectedAddress)
      .catch(console.error)
      .then((data) => {
        setBalance(data);
      });
  };

  useEffect(() => {
    checkBalances();
    // get price feed
    readPriceFeed()
      .catch(console.error)
      .then((price: any) => {
        setPriceFeed(parseFloat(ethers.utils.formatEther(price)));
      });
  }, [addressIsConnected, connectedAddress]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Stablecoin swap on Polygon zkEVM</title>
        <meta
          content="A simple stablecoin swap on Polygon zkEVM"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        <Swap
          getUpdatedBalances={checkBalances}
          connectedAddress={connectedAddress}
          addressIsConnected={addressIsConnected}
          priceFeed={priceFeed}
          maxEth={balance?.eth?.formatted || 0}
          maxSta={balance?.sta?.formatted || 0}
          tokenContract={contractAddress}
        />

        <footer className={styles.footer}>
          Made with 🫶🏼 by{" "}
          <a
            href="https://twitter.com/wc49358"
            rel="noopener noreferrer"
            target="_blank"
          >
            {" "}
            Billy{" "}
          </a>{" "}
          and{" "}
          <a
            href="https://twitter.com/0ceans404"
            rel="noopener noreferrer"
            target="_blank"
          >
            Steph
          </a>
        </footer>
      </main>
    </div>
  );
};

export default Home;
