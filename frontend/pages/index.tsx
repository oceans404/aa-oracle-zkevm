import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { getAccount, fetchBalance, readContract } from "@wagmi/core";
import { useState, useEffect } from "react";
import Swap from "../components/Swap";
const tokenContract = "0x1fba51630d9557710778e827d786db624ee3c4e1";
import { abi } from "../artifacts/contracts/TokenSwap.sol/TokenExchange.json";
import { ethers } from "ethers";

const fetchBalances = async (address: `0x${string}`) => {
  const balances: {
    [key: string]: any;
  } = {};

  // fetch ETH balance
  const eth = await fetchBalance({
    address: address,
  });
  balances.eth = eth;

  // fetch STA token balance
  const staToken = await fetchBalance({
    address: address,
    token: tokenContract,
  });
  balances.sta = staToken;

  return balances;
};

// contract helpers
const readPriceFeed = async (): Promise<[ethers.BigNumberish, number]> => {
  const [price]: any = await readContract({
    address: tokenContract,
    abi,
    functionName: "readDataFeed",
  });
  return price;
};

const Home: NextPage = () => {
  const [balance, setBalance] = useState<any | null>(null);
  const [priceFeed, setPriceFeed] = useState<number | null>(null);
  const account = getAccount();
  useEffect(() => {
    if (account.address) {
      fetchBalances(account.address)
        .catch(console.error)
        .then((data) => {
          setBalance(data);
        });
    }

    // get price feed
    readPriceFeed()
      .catch(console.error)
      .then((price: any) => {
        setPriceFeed(parseFloat(ethers.utils.formatEther(price)));
      });
  }, [account, account.address]);

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
          priceFeed={priceFeed}
          maxEth={balance?.eth.formatted}
          maxSta={balance?.sta.formatted}
          tokenContract={tokenContract}
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
