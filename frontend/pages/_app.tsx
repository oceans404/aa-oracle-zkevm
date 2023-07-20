import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonZkEvm, polygonZkEvmTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { Wallet, providers, ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { useEffect, useState } from "react";

const bundler: IBundler = new Bundler({
  bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/abc",
  chainId: ChainId.POLYGON_ZKEVM_TESTNET,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

const provider = new providers.JsonRpcProvider(
  `https://polygonzkevm-testnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
);

const wallet = new Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY || "", provider);

const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
  signer: wallet,
  chainId: ChainId.POLYGON_ZKEVM_TESTNET,
  bundler: bundler,
};

async function createAccount() {
  let biconomySmartAccount = new BiconomySmartAccount(
    biconomySmartAccountConfig
  );
  biconomySmartAccount = await biconomySmartAccount.init();
  return biconomySmartAccount;
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [polygonZkEvmTestnet]
      : []),
    polygonZkEvm,
  ],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY || "" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME || "",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  const [bicoAccount, setBicoAccount] =
    useState<BiconomySmartAccount | null | void>(null);
  useEffect(() => {
    const fetchBicoAccount = async () => {
      return await createAccount();
    };

    fetchBicoAccount()
      .catch(console.error)
      .then((data) => {
        setBicoAccount(data);
      });
  }, []);

  return (
    <ChakraProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;
